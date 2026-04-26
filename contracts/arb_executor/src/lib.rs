#![no_std]
use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, token, Address, Env, Vec, Symbol, symbol_short, log, IntoVal
};

#[cfg(test)]
mod test;
#[cfg(test)]
mod mock;

/// Storage TTL Configuration
const DAY_IN_LEDGERS: u32 = 17280; 
const INSTANCE_BUMP_AMOUNT: u32 = 30 * DAY_IN_LEDGERS; // 30 days
const INSTANCE_LIFETIME_THRESHOLD: u32 = 7 * DAY_IN_LEDGERS; // 7 days

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum Error {
    NotInitialized = 1,
    AlreadyInitialized = 2,
    Unauthorized = 3,
    InvalidPath = 4,
    InsufficientProfit = 5,
    ContractPaused = 6,
    EmptySteps = 7,
    NegativeAmount = 8,
    SlippageExceeded = 9,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct SwapStep {
    pub pool: Address,
    pub token_in: Address,
    pub token_out: Address,
    pub min_out: i128, // Intermediate slippage protection
}

#[contracttype]
pub enum DataKey {
    Admin,
    Paused,
}

#[contract]
pub struct ArbExecutor;

#[contractimpl]
impl ArbExecutor {
    /// Initializes the contract with an admin address.
    /// Added `require_auth` to ensure the admin consents to the assignment.
    pub fn initialize(env: Env, admin: Address) -> Result<(), Error> {
        admin.require_auth(); 

        if env.storage().instance().has(&DataKey::Admin) {
            return Err(Error::AlreadyInitialized);
        }

        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::Paused, &false);
        
        extend_instance_ttl(&env);
        Ok(())
    }

    /// Executes a sequence of swaps (arbitrage or multi-hop trade).
    /// Fixes: Unified profit check, intermediate slippage, and TTL extension.
    pub fn execute_arbitrage(
        env: Env,
        steps: Vec<SwapStep>,
        amount_in: i128,
        min_amount_out: i128, // Replaced min_profit with min_amount_out for universal support
    ) -> Result<i128, Error> {
        extend_instance_ttl(&env);

        let is_paused: bool = env.storage().instance().get(&DataKey::Paused).unwrap_or(false);
        if is_paused {
            return Err(Error::ContractPaused);
        }

        let admin: Address = env.storage().instance().get(&DataKey::Admin).ok_or(Error::NotInitialized)?;
        admin.require_auth();

        if steps.is_empty() {
            return Err(Error::EmptySteps);
        }
        if amount_in <= 0 {
            return Err(Error::NegativeAmount);
        }

        // Track the balance of the final destination token to verify actual profit/output
        let last_step = steps.get(steps.len() - 1).unwrap();
        let dest_token_client = token::Client::new(&env, &last_step.token_out);
        let initial_dest_balance = dest_token_client.balance(&env.current_contract_address());

        let mut current_amount = amount_in;

        for i in 0..steps.len() {
            let step = steps.get(i).unwrap();
            
            // Path validation: ensure the current token_in matches the previous token_out
            if i > 0 {
                let prev_step = steps.get(i - 1).unwrap();
                if prev_step.token_out != step.token_in {
                    return Err(Error::InvalidPath);
                }
            }

            let token_in_client = token::Client::new(&env, &step.token_in);
            let token_out_client = token::Client::new(&env, &step.token_out);
            
            // Snapshot balance to verify swap return value (Defensive calculation)
            let pre_swap_out_balance = token_out_client.balance(&env.current_contract_address());

            // Transfer funds to the pool
            token_in_client.transfer(&env.current_contract_address(), &step.pool, &current_amount);

            // Execute swap with intermediate slippage protection
            let out_amount: i128 = env.invoke_contract(
                &step.pool,
                &Symbol::new(&env, "swap"),
                (
                    env.current_contract_address(),
                    step.token_in.clone(),
                    step.token_out.clone(),
                    current_amount,
                    step.min_out, // Enforce intermediate slippage
                ).into_val(&env),
            );

            // Verify actual amount received (Protects against fee-on-transfer or malicious pools)
            let post_swap_out_balance = token_out_client.balance(&env.current_contract_address());
            let actual_received = post_swap_out_balance - pre_swap_out_balance;

            if actual_received < out_amount || actual_received < step.min_out {
                return Err(Error::SlippageExceeded);
            }

            current_amount = actual_received;
        }

        // Final output verification (Covers both cyclic and non-cyclic paths)
        let final_dest_balance = dest_token_client.balance(&env.current_contract_address());
        let total_received = final_dest_balance - initial_dest_balance;

        if total_received < min_amount_out {
            return Err(Error::InsufficientProfit);
        }

        env.events().publish(
            (symbol_short!("arb_exec"), last_step.token_out.clone()),
            total_received
        );

        Ok(total_received)
    }

    /// Liquidates an undercollateralized user position on a lending protocol.
    pub fn liquidate(
        env: Env,
        protocol: Address,
        user: Address,
        debt_token: Address,
        collateral_token: Address,
        amount: i128,
    ) -> Result<(), Error> {
        extend_instance_ttl(&env);
        let admin: Address = env.storage().instance().get(&DataKey::Admin).ok_or(Error::NotInitialized)?;
        admin.require_auth();

        if amount <= 0 {
            return Err(Error::NegativeAmount);
        }

        let debt_client = token::Client::new(&env, &debt_token);
        debt_client.transfer(&env.current_contract_address(), &protocol, &amount);

        env.invoke_contract::<()>(
            &protocol,
            &Symbol::new(&env, "liquidate"),
            (
                env.current_contract_address(),
                user.clone(),
                debt_token.clone(),
                collateral_token.clone(),
                amount
            ).into_val(&env)
        );

        env.events().publish(
            (symbol_short!("liquidat"), user),
            amount
        );
        Ok(())
    }

    /// Withdraws accrued profits from the contract to the admin address.
    pub fn withdraw(env: Env, token: Address, amount: i128) -> Result<(), Error> {
        extend_instance_ttl(&env);
        let admin: Address = env.storage().instance().get(&DataKey::Admin).ok_or(Error::NotInitialized)?;
        admin.require_auth();

        if amount <= 0 {
            return Err(Error::NegativeAmount);
        }

        let token_client = token::Client::new(&env, &token);
        token_client.transfer(&env.current_contract_address(), &admin, &amount);
        
        log!(&env, "Withdrawal of {} {} successful", amount, token);
        Ok(())
    }

    /// Toggles the operational state of the contract (Emergency Stop).
    pub fn set_paused(env: Env, paused: bool) -> Result<(), Error> {
        extend_instance_ttl(&env);
        let admin: Address = env.storage().instance().get(&DataKey::Admin).ok_or(Error::NotInitialized)?;
        admin.require_auth();
        
        env.storage().instance().set(&DataKey::Paused, &paused);
        Ok(())
    }

    /// Upgrades the contract logic to a new WASM bytecode.
    pub fn upgrade(env: Env, new_wasm_hash: soroban_sdk::BytesN<32>) -> Result<(), Error> {
        extend_instance_ttl(&env);
        let admin: Address = env.storage().instance().get(&DataKey::Admin).ok_or(Error::NotInitialized)?;
        admin.require_auth();
        
        env.deployer().update_current_contract_wasm(new_wasm_hash);
        Ok(())
    }

    /// Returns the administrative address.
    pub fn get_admin(env: Env) -> Result<Address, Error> {
        extend_instance_ttl(&env);
        env.storage().instance().get(&DataKey::Admin).ok_or(Error::NotInitialized)
    }

    /// Returns whether the contract is currently paused.
    pub fn is_paused(env: Env) -> bool {
        extend_instance_ttl(&env);
        env.storage().instance().get(&DataKey::Paused).unwrap_or(false)
    }
}

/// Helper to extend the TTL of the contract instance to prevent expiration.
fn extend_instance_ttl(env: &Env) {
    env.storage().instance().extend_ttl(INSTANCE_LIFETIME_THRESHOLD, INSTANCE_BUMP_AMOUNT);
}

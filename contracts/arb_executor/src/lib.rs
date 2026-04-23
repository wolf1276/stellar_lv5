#![no_std]
use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, token, Address, Env, Vec, Symbol, symbol_short, log, IntoVal
};

#[cfg(test)]
mod test;


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
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct SwapStep {
    pub pool: Address,
    pub token_in: Address,
    pub token_out: Address,
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
    /// Can only be called once to prevent administrative takeover.
    pub fn initialize(env: Env, admin: Address) -> Result<(), Error> {
        if env.storage().instance().has(&DataKey::Admin) {
            return Err(Error::AlreadyInitialized);
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::Paused, &false);
        
        log!(&env, "ArbExecutor initialized with admin: {}", admin);
        Ok(())
    }

    /// Executes a multi-hop arbitrage swap chain atomically.
    /// 
    /// # Arguments
    /// * `steps` - A vector of SwapStep defining the swap path.
    /// * `amount_in` - Initial amount of the first token to swap.
    /// * `min_profit` - Minimum required profit (final_balance - initial_balance) in the base token.
    /// 
    /// # Returns
    /// The final amount received after all swaps.
    pub fn execute_arbitrage(
        env: Env,
        steps: Vec<SwapStep>,
        amount_in: i128,
        min_profit: i128,
    ) -> Result<i128, Error> {
        // Circuit breaker check
        let is_paused: bool = env.storage().instance().get(&DataKey::Paused).unwrap_or(false);
        if is_paused {
            return Err(Error::ContractPaused);
        }

        // Access control: only the admin can trigger execution
        let admin: Address = env.storage().instance().get(&DataKey::Admin).ok_or(Error::NotInitialized)?;
        admin.require_auth();

        if steps.is_empty() {
            return Err(Error::EmptySteps);
        }
        if amount_in <= 0 {
            return Err(Error::NegativeAmount);
        }

        let first_step = steps.get(0).unwrap();
        let first_token_client = token::Client::new(&env, &first_step.token_in);
        
        // Track the starting balance of the base token to verify profit at the end.
        let initial_contract_balance = first_token_client.balance(&env.current_contract_address());

        let mut current_amount = amount_in;

        for i in 0..steps.len() {
            let step = steps.get(i).unwrap();
            
            // Path validation: ensure the output of the previous step is the input of the current step
            if i > 0 {
                let prev_step = steps.get(i - 1).unwrap();
                if prev_step.token_out != step.token_in {
                    return Err(Error::InvalidPath);
                }
            }

            // Move tokens to the pool
            let token_in_client = token::Client::new(&env, &step.token_in);
            token_in_client.transfer(&env.current_contract_address(), &step.pool, &current_amount);

            // Execute the swap on the pool.
            // Interface: swap(to: Address, token_in: Address, token_out: Address, amount_in: i128, min_amount_out: i128)
            let out_amount: i128 = env.invoke_contract(
                &step.pool,
                &Symbol::new(&env, "swap"),
                (
                    env.current_contract_address(), // to
                    step.token_in.clone(),
                    step.token_out.clone(),
                    current_amount,
                    0i128, // Profit check happens globally at the end
                ).into_val(&env),
            );

            current_amount = out_amount;
        }

        // Global Profit Enforcement
        let last_step = steps.get(steps.len() - 1).unwrap();
        if first_step.token_in == last_step.token_out {
            let final_contract_balance = first_token_client.balance(&env.current_contract_address());
            let actual_profit = final_contract_balance - initial_contract_balance;
            
            if actual_profit < min_profit {
                return Err(Error::InsufficientProfit);
            }
            
            env.events().publish(
                (symbol_short!("arb_done"), first_step.token_in.clone()),
                actual_profit
            );
        }

        Ok(current_amount)
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
        let admin: Address = env.storage().instance().get(&DataKey::Admin).ok_or(Error::NotInitialized)?;
        admin.require_auth();

        if amount <= 0 {
            return Err(Error::NegativeAmount);
        }

        // 1. Transfer debt tokens to the protocol
        let debt_client = token::Client::new(&env, &debt_token);
        debt_client.transfer(&env.current_contract_address(), &protocol, &amount);

        // 2. Trigger protocol liquidation
        // Interface: liquidate(liquidator: Address, user: Address, debt_token: Address, collateral_token: Address, amount: i128)
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
        let admin: Address = env.storage().instance().get(&DataKey::Admin).ok_or(Error::NotInitialized)?;
        admin.require_auth();
        
        env.storage().instance().set(&DataKey::Paused, &paused);
        Ok(())
    }

    /// Upgrades the contract logic to a new WASM bytecode.
    pub fn upgrade(env: Env, new_wasm_hash: soroban_sdk::BytesN<32>) -> Result<(), Error> {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).ok_or(Error::NotInitialized)?;
        admin.require_auth();
        
        env.deployer().update_current_contract_wasm(new_wasm_hash);
        Ok(())
    }

    /// Returns the administrative address.
    pub fn get_admin(env: Env) -> Result<Address, Error> {
        env.storage().instance().get(&DataKey::Admin).ok_or(Error::NotInitialized)
    }

    /// Returns whether the contract is currently paused.
    pub fn is_paused(env: Env) -> bool {
        env.storage().instance().get(&DataKey::Paused).unwrap_or(false)
    }
}




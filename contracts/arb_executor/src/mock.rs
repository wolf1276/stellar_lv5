#![cfg(test)]
use soroban_sdk::{contract, contractimpl, Address, Env, token};

#[contract]
pub struct MockPool;

#[contractimpl]
impl MockPool {
    pub fn swap(
        env: Env,
        to: Address,
        token_in: Address,
        token_out: Address,
        amount_in: i128,
        _min_amount_out: i128,
    ) -> i128 {
        let _token_in_client = token::Client::new(&env, &token_in);
        let token_out_client = token::Client::new(&env, &token_out);

        token_out_client.transfer(&env.current_contract_address(), &to, &amount_in);
        
        amount_in
    }
}

#[contract]
pub struct MockLendingProtocol;

#[contractimpl]
impl MockLendingProtocol {
    pub fn liquidate(
        _env: Env,
        _liquidator: Address,
        _user: Address,
        _debt_token: Address,
        _collateral_token: Address,
        _amount: i128,
    ) {
    }
}

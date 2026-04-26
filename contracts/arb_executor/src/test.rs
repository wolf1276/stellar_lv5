#![cfg(test)]
use super::*;
use soroban_sdk::{testutils::{Address as _}, Address, Env, Vec};

#[test]
fn test_initialize_and_get_admin() {
    let env = Env::default();
    let contract_id = env.register_contract(None, ArbExecutor);
    let client = ArbExecutorClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    client.initialize(&admin);

    assert_eq!(client.get_admin(), admin);
}

#[test]
fn test_already_initialized() {
    let env = Env::default();
    let contract_id = env.register_contract(None, ArbExecutor);
    let client = ArbExecutorClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    client.initialize(&admin);

    let result = client.try_initialize(&admin);
    assert_eq!(result, Err(Ok(Error::AlreadyInitialized)));
}

#[test]
fn test_pause_and_resume() {
    let env = Env::default();
    let contract_id = env.register_contract(None, ArbExecutor);
    let client = ArbExecutorClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    client.initialize(&admin);

    assert!(!client.is_paused());

    env.mock_all_auths();
    client.set_paused(&true);
    assert!(client.is_paused());

    client.set_paused(&false);
    assert!(!client.is_paused());
}

#[test]
fn test_arbitrage_fails_when_paused() {
    let env = Env::default();
    let contract_id = env.register_contract(None, ArbExecutor);
    let client = ArbExecutorClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    client.initialize(&admin);

    env.mock_all_auths();
    client.set_paused(&true);

    let steps = Vec::new(&env);
    let result = client.try_execute_arbitrage(&steps, &100, &10);
    assert_eq!(result, Err(Ok(Error::ContractPaused)));
}

#[test]
fn test_arbitrage_empty_steps() {
    let env = Env::default();
    let contract_id = env.register_contract(None, ArbExecutor);
    let client = ArbExecutorClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    client.initialize(&admin);

    env.mock_all_auths();
    let steps = Vec::new(&env);
    let result = client.try_execute_arbitrage(&steps, &100, &10);
    assert_eq!(result, Err(Ok(Error::EmptySteps)));
}

#[test]
fn test_negative_amount_validation() {
    let env = Env::default();
    let contract_id = env.register_contract(None, ArbExecutor);
    let client = ArbExecutorClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    client.initialize(&admin);

    env.mock_all_auths();
    let result = client.try_withdraw(&Address::generate(&env), &-1);
    assert_eq!(result, Err(Ok(Error::NegativeAmount)));
}

#[test]
fn test_successful_arbitrage_flow() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let contract_id = env.register_contract(None, ArbExecutor);
    let client = ArbExecutorClient::new(&env, &contract_id);
    client.initialize(&admin);

    let pool_id = env.register_contract(None, crate::mock::MockPool);

    let token_a_admin = Address::generate(&env);
    let token_b_admin = Address::generate(&env);
    let token_a_id = env.register_stellar_asset_contract(token_a_admin);
    let token_b_id = env.register_stellar_asset_contract(token_b_admin);
    
    let token_a = token::Client::new(&env, &token_a_id);
    let token_b = token::Client::new(&env, &token_b_id);

    let token_a_admin_client = token::StellarAssetClient::new(&env, &token_a_id);
    let token_b_admin_client = token::StellarAssetClient::new(&env, &token_b_id);
    
    token_a_admin_client.mint(&contract_id, &1000);
    token_b_admin_client.mint(&pool_id, &2000);

    let steps = Vec::from_array(&env, [
        SwapStep {
            pool: pool_id.clone(),
            token_in: token_a_id.clone(),
            token_out: token_b_id.clone(),
        }
    ]);

    let amount_out = client.execute_arbitrage(&steps, &100, &0);
    
    assert_eq!(amount_out, 100);
    assert_eq!(token_b.balance(&contract_id), 100);
    assert_eq!(token_a.balance(&contract_id), 900);
}

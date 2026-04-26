import { 
  Horizon, 
  TransactionBuilder, 
  Networks, 
  Asset, 
  Operation,
  Memo,
  StrKey
} from '@stellar/stellar-sdk';

export interface StellarAsset {
  code: string;
  balance: string;
}

export interface StellarTransaction {
  id: string;
  hash: string;
  from: string;
  to: string;
  amount: string;
  createdAt: string;
  memo?: string;
}

export type TransactionResponse = {
  success: true;
  hash: string;
} | {
  success: false;
  error: string;
};

class StellarHelper {
  private server: Horizon.Server;
  private horizonUrl: string = "https://horizon-testnet.stellar.org";

  constructor() {
    this.server = new Horizon.Server(this.horizonUrl);
  }

  /**
   * Fetches real account data from Horizon Testnet.
   * Throws if account doesn't exist or network failure.
   */
  async getBalance(address: string): Promise<{ xlm: string; assets: StellarAsset[] }> {
    try {
      return await this.fetchAccountData(address);
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const resp = error.response as { status: number };
        if (resp.status === 404) {
          console.log(`Account ${address} not found on Testnet. Attempting to fund via Friendbot...`);
          try {
            const res = await fetch(`https://friendbot.stellar.org/?addr=${address}`);
            await res.json();
            console.log(`Account ${address} funded successfully.`);
            return await this.fetchAccountData(address);
          } catch (fundError) {
            console.error("Friendbot funding failed:", fundError);
            throw new Error("Account not found on Testnet and Friendbot auto-funding failed.");
          }
        }
      }
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to fetch balance: ${message}`);
    }
  }

  private async fetchAccountData(address: string): Promise<{ xlm: string; assets: StellarAsset[] }> {
    const account = await this.server.loadAccount(address);
    const xlm = account.balances.find(b => b.asset_type === 'native')?.balance || "0";
    const assets = account.balances
      .filter(b => b.asset_type !== 'native')
      .map(b => ({
        code: (b as Horizon.HorizonApi.BalanceLineAsset).asset_code || "Unknown",
        balance: b.balance
      }));
    return { xlm, assets };
  }

  /**
   * Builds an unsigned transaction XDR for a payment.
   */
  async buildPaymentXDR(from: string, to: string, amount: string, memo?: string): Promise<string> {
    try {
      const account = await this.server.loadAccount(from);
      const baseFee = await this.server.fetchBaseFee();
      
      const txBuilder = new TransactionBuilder(account, {
        fee: String(baseFee),
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(
          Operation.payment({
            destination: to,
            asset: Asset.native(),
            amount: amount,
          })
        );

      if (memo) {
        txBuilder.addMemo(Memo.text(memo));
      }

      const tx = txBuilder.setTimeout(60).build();
      return tx.toXDR();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Transaction building failed: ${message}`);
    }
  }

  /**
   * Submits a signed transaction XDR to the network.
   */
  async submitXDR(signedXDR: string): Promise<TransactionResponse> {
    try {
      const tx = TransactionBuilder.fromXDR(signedXDR, Networks.TESTNET);
      const result = await this.server.submitTransaction(tx);
      return {
        success: true,
        hash: result.hash
      };
    } catch (error: unknown) {
      console.error("Submission failed", error);
      let errorMessage = error instanceof Error ? error.message : String(error);
      if (error && typeof error === 'object' && 'response' in error) {
        const resp = error.response as { data?: Horizon.HorizonApi.ErrorResponseData };
        const resultCodes = resp.data && 'extras' in resp.data ? resp.data.extras?.result_codes : null;
        if (resultCodes) errorMessage = JSON.stringify(resultCodes);
      }
      return {
        success: false,
        error: `Submission failed: ${errorMessage}`
      };
    }
  }

  /**
   * Fetches real-time price from a liquidity pool.
   * Returns null if no pool exists (no simulation).
   */
  async getPoolPrice(codeA: string, codeB: string, issuerA?: string, issuerB?: string): Promise<number | null> {
    try {
      // Validate assets
      if (codeA !== 'XLM' && !issuerA) return null;
      if (codeB !== 'XLM' && !issuerB) return null;

      let assetA: Asset;
      let assetB: Asset;

      try {
        if (codeA === 'XLM') {
          assetA = Asset.native();
        } else {
          if (!issuerA || !StrKey.isValidEd25519PublicKey(issuerA)) {
            console.warn(`Invalid issuer for ${codeA}: ${issuerA}`);
            return null;
          }
          assetA = new Asset(codeA, issuerA);
        }

        if (codeB === 'XLM') {
          assetB = Asset.native();
        } else {
          if (!issuerB || !StrKey.isValidEd25519PublicKey(issuerB)) {
            console.warn(`Invalid issuer for ${codeB}: ${issuerB}`);
            return null;
          }
          assetB = new Asset(codeB, issuerB);
        }
      } catch (e) {
        console.warn(`Asset creation failed for ${codeA}/${codeB}:`, e);
        return null;
      }
      
      const pools = await this.server
        .liquidityPools()
        .forAssets(assetA, assetB)
        .call();

      if (pools.records.length > 0) {
        const pool = pools.records[0];
        const reserveA = parseFloat(pool.reserves.find(r => r.asset.split(':')[0] === (codeA === 'XLM' ? 'native' : codeA))?.amount || "0");
        const reserveB = parseFloat(pool.reserves.find(r => r.asset.split(':')[0] === (codeB === 'XLM' ? 'native' : codeB))?.amount || "0");
        
        if (reserveA > 0 && reserveB > 0) {
          return reserveB / reserveA;
        }
      }
      return null;
    } catch (error) {
      console.error("Failed to fetch pool price", error);
      return null;
    }
  }

  /**
   * Fetches recent payment operations for an account.
   */
  async getRecentTransactions(address: string, limit: number = 10): Promise<StellarTransaction[]> {
    try {
      const payments = await this.server
        .payments()
        .forAccount(address)
        .order("desc")
        .limit(limit)
        .call();

      return payments.records.map((p) => {
        let to = "";
        let amount = "0";

        if ("to" in p) {
          to = (p as Horizon.ServerApi.PaymentOperationRecord).to;
        } else if ("account" in p) {
          to = (p as Horizon.ServerApi.CreateAccountOperationRecord).account;
        } else if ("into" in p) {
          to = (p as Horizon.ServerApi.AccountMergeOperationRecord).into;
        }

        if ("amount" in p) {
          amount = (p as Horizon.ServerApi.PaymentOperationRecord).amount;
        } else if ("starting_balance" in p) {
          amount = (p as Horizon.ServerApi.CreateAccountOperationRecord).starting_balance;
        }

        return {
          id: p.id,
          hash: p.transaction_hash,
          from: p.source_account,
          to,
          amount,
          createdAt: p.created_at,
        };
      });
    } catch (error) {
      console.error("Failed to fetch recent transactions", error);
      return [];
    }
  }

  getExplorerLink(hash: string): string {
    return `https://stellar.expert/explorer/testnet/tx/${hash}`;
  }

  formatAddress(address: string, start = 4, end = 4): string {
    if (!address) return "";
    return `${address.substring(0, start)}...${address.substring(address.length - end)}`;
  }
}

export const stellar = new StellarHelper();

export interface RawSolanaTransaction {
  blockTime: number;
  meta: {
    computeUnitsConsumed: number;
    err: any;
    fee: number;
    innerInstructions: any[];
    logMessages: string[];
    postBalances: number[];
    postTokenBalances: any[];
    preBalances: number[];
    preTokenBalances: any[];
    rewards: any[];
    status: {
      Ok: any;
    };
  };
  slot: number;
  transaction: {
    message: {
      accountKeys: Array<{
        pubkey: string;
        signer: boolean;
        source: string;
        writable: boolean;
      }>;
      instructions: any[];
      recentBlockhash: string;
    };
    signatures: string[];
  };
}

export interface SolanaTransaction {
  fee: number;
  confirmed: boolean;
  transactionHash: string;
  amount: number;
  to: string;
  from: string;
  timestamp: number;
  tokenHash?: string;
  direction: string | 'sent' | 'received' | 'unknown';
}

export enum TransactionStatus {
  PENDING = 'pending',
  SETTLED = 'settled',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum TransactionType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
  TRANSFER = 'transfer',
  DEBIT = 'debit',
  CREDIT = 'credit',
  CREDIT_REFUND = 'credit_refund',
}

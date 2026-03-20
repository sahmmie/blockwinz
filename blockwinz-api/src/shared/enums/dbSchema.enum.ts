export enum DbGameSchema {
  DiceGame = 'DiceGame',
  LimboGame = 'LimboGame',
  CoinFlipGame = 'CoinFlipGame',
  CrashGame = 'CrashGame',
  KenoGame = 'KenoGame',
  PlinkoGame = 'PlinkoGame',
  RouletteGame = 'RouletteGame',
  MinesGame = 'MinesGame',
  WheelGame = 'WheelGame',

  TicTacToeGame = 'TicTacToeGame',
}

export enum DbSchema {
  BetHistory = 'BetHistory',
  User = 'User',
  Profile = 'Profile',
  Transaction = 'Transaction',
  Wallet = 'Wallet',
  WalletBalance = 'WalletBalance',
  Seed = 'Seed',
  Favourite = 'Favourite',
  Referral = 'Referral',
  ReferralSetting = 'ReferralSetting',
  Admin = 'Admin',
  Withdrawal = 'Withdrawal',
  Coupon = 'Coupon',
  Settings = 'Settings',
  Room = 'Room',
  Message = 'Message',
  Waitlist = 'Waitlist',
  OTP = 'OTP',
  /**
   * Credit Free BWZ
   * Used to credit free BWZ to users on testnet
   * This is not used in production
   */
  CreditFreeBwz = 'CreditFreeBwz',
}

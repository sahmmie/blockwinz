export const HG_ERROR_CODES = {
  TIMEOUT: 460,
  GAME_UNDER_MAINTENANCE: 461,
  BALANCE_INSUFFICIENT: 462,
  BETTING_WITH_REAL_FUNDS_DISABLED: 463,
  ROTATE_SEED_PAIR_TO_VERIFY: 464,
  TOO_MANY_REQUESTS: 465,
  OPENED_GAMES_WHEN_ROTATING_SEED_PAIR: 466,
};

export const HG_ERROR_MESSAGES = {
  TIMEOUT: 'Timeout occurred while processing the request.',
  GAME_UNDER_MAINTENANCE: 'Currently game is under maintenance.',
  BALANCE_INSUFFICIENT: 'Player balance is insufficient.',
  BETTING_WITH_REAL_FUNDS_DISABLED: 'Betting with real funds disabled',
  ROTATE_SEED_PAIR_TO_VERIFY:
    'Please rotate Your seed pair in order to verify this bet',
  TOO_MANY_REQUESTS: 'Too many requests. Please try again in few seconds.',
  OPENED_GAMES_WHEN_ROTATING_SEED_PAIR:
    'You have an opened game and cannot rotate seed pair. Please end all of Your opened games',
};

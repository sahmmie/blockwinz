export interface Challenge {
    key: string;
    name: string;
    description: string;
    type: ChallengeType; // e.g., 'daily', 'weekly', 'monthly', 'lifetime'
    category: ChallengeCategory; // e.g., 'login', 'gameplay', etc.
    condition: ChallengeCondition;
    reward: Record<string, unknown>;
    repeatable: boolean;
    expiresIn: number;
    isActive: boolean;
}

export interface ChallengeCondition {
    metric: string; // e.g., 'gamesPlayed', 'referrals', 'depositBwz'
    goal: number;
}

export interface UserChallengeProgress {
    userId: string;
    challengeId: string;
    progress: Record<string, unknown>;
    completed: boolean;
    claimed: boolean;
    completedAt: string | null;
    resetAt: string | null;
}

export interface UserChallengeListItem {
    challenge: Challenge;
    progress: UserChallengeProgress;
}

export enum ChallengeType {
    DAILY = 'daily',
    WEEKLY = 'weekly',
    MONTHLY = 'monthly',
    LIFETIME = 'lifetime',
}

export enum ChallengeCategory {
    LOGIN = 'login',
    GAMEPLAY = 'gameplay',
    SOCIAL = 'social',
    REFERRAL = 'referral',
    WAGER = 'wager',
    CUSTOM = 'custom',
    DEPOSIT = 'deposit',
} 
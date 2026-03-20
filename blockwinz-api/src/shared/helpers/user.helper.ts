import { UserDto } from 'src/shared/dtos/user.dto';
import { UserRequestI } from 'src/shared/interfaces/userRequest.type';

/**
 * User-like object that has at least one of id (UUID) or _id (legacy).
 */
export type UserLike = UserDto | UserRequestI | { _id?: unknown; id?: string };

/**
 * Returns the user identifier as a string. Prefers `id` (Postgres UUID), falls back to `_id`.
 * Use this whenever you need a single string id from a request user or DTO.
 *
 * @param user - User DTO, UserRequestI, or any object with id or _id
 * @returns The user id string, or empty string if neither is set
 */
export function getUserId(user: UserLike | null | undefined): string {
  if (user == null) return '';
  const u = user as { _id?: unknown; id?: string };
  return String(u?.id ?? u?._id ?? '');
}

/**
 * Returns the profile identifier as a string. Prefers `id`, falls back to `_id`.
 *
 * @param profile - Profile DTO or object with id or _id (or string for backward compat)
 * @returns The profile id string, or empty string if none set
 */
export function getProfileId(
  profile: { _id?: string; id?: string } | string | null | undefined,
): string {
  if (profile == null) return '';
  if (typeof profile === 'string') return profile;
  return String(profile?.id ?? profile?._id ?? '');
}

/**
 * Returns the transaction identifier. Prefers `_id`, falls back to `id`.
 */
export function getTransactionId(
  transaction: { _id?: string; id?: string } | null | undefined,
): string {
  if (transaction == null) return '';
  return String(transaction?._id ?? transaction?.id ?? '');
}

/**
 * Returns the wallet identifier from a wallet DTO. Prefers `id`, falls back to `_id`.
 */
export function getWalletId(
  wallet: { _id?: string; id?: string } | null | undefined,
): string {
  if (wallet == null) return '';
  return String(wallet?.id ?? wallet?._id ?? '');
}

/**
 * Returns the seed identifier. Accepts SeedDto-like object or string.
 */
export function getSeedId(
  seed: { _id?: string; id?: string } | string | null | undefined,
): string {
  if (seed == null) return '';
  if (typeof seed === 'string') return seed;
  return String(seed?.id ?? seed?._id ?? '');
}

/**
 * Returns the room identifier. Prefers `id`, falls back to `_id`.
 */
export function getRoomId(
  room: { _id?: string; id?: string } | string | null | undefined,
): string {
  if (room == null) return '';
  if (typeof room === 'string') return room;
  return String(room?.id ?? room?._id ?? '');
}

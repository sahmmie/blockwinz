/**
 * Reads `_id` or `sub` from a JWT access token payload (client-side only).
 */
export function getUserIdFromAccessToken(token: string | null): string | null {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const payload = JSON.parse(atob(parts[1])) as {
      _id?: string;
      sub?: string;
    };
    return payload._id ?? payload.sub ?? null;
  } catch {
    return null;
  }
}

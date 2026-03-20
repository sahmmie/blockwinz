/** Build a Drizzle `pgEnum` value tuple from a string-valued TypeScript `enum`. */
export function pgEnumValues<T extends Record<string, string>>(
  e: T,
): [string, ...string[]] {
  return Object.values(e) as [string, ...string[]];
}

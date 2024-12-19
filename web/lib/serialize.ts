/**
 * Serializes an object by converting BigInt values to strings
 * @param obj The object to serialize
 * @returns The serialized object with BigInt values converted to strings
 */
export function serialize<T>(obj: T): T {
  return JSON.parse(
    JSON.stringify(obj, (_, value) => (typeof value === "bigint" ? value.toString() : value)),
  ) as T
}

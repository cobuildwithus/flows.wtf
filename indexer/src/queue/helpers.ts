import { zeroAddress } from "viem"

export function getNonzeroLowercasedAddresses(addresses: string[]): string[] {
  return [...new Set(addresses.map((address) => address.toLowerCase()))].filter(
    (address) => address !== zeroAddress
  )
}

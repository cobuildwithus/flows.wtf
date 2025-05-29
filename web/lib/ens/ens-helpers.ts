// Ethereum address validation regex (42 characters, starts with 0x)
export const ETH_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/
// ENS name validation regex (supports subdomains and ends with .eth)
export const ENS_NAME_REGEX = /^[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.eth$/

export function isValidEthAddress(address: string): boolean {
  return ETH_ADDRESS_REGEX.test(address)
}

export function isValidEnsName(name: string): boolean {
  return ENS_NAME_REGEX.test(name)
}

export function isValidAddressOrEns(input: string): boolean {
  return isValidEthAddress(input) || isValidEnsName(input)
}

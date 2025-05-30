import { imageDomains } from "@/image-domains"
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { arbitrum, base, baseSepolia, mainnet, optimism } from "viem/chains"
import { nounsTokenAddress } from "./abis"
import { NOUNS_TOKEN } from "./config"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getShortEthAddress(address?: string | null) {
  if (!address || address.length < 10) return ""

  return `${address.substring(0, 5)}...${address.substring(address.length - 3)}`
}

export function explorerUrl(address: string, chainId: number, type: "tx" | "address" = "tx") {
  const explorerDomain: Record<number, string> = {
    [mainnet.id]: "etherscan.io",
    [base.id]: "basescan.org",
    [baseSepolia.id]: "sepolia.basescan.org",
    [optimism.id]: "optimistic.etherscan.io",
    [arbitrum.id]: "arbiscan.io",
  }

  if (!(chainId in explorerDomain)) throw new Error("Unsupported chain")

  return `https://${explorerDomain[chainId]}/${type}/${address}`
}

export function getIpfsUrl(url: string, gateway: "pinata" | "ipfs" = "ipfs") {
  if (url.startsWith("http")) {
    if (url.includes("mypinata.cloud/ipfs/")) {
      return `${url}?pinataGatewayToken=${process.env.PINATA_GATEWAY_KEY}`
    }
    return url
  }

  const hash = url.replace("ipfs://", "")

  if (gateway === "pinata") {
    return `https://${process.env.NEXT_PUBLIC_GATEWAY_URL}/ipfs/${hash}`
  }

  return `https://ipfs.io/ipfs/${hash}`
}

export function doOptimizeImage(url: string) {
  try {
    const urlObj = new URL(url)
    const hostname = urlObj.hostname

    return imageDomains.some((domain) => {
      if (domain.startsWith("*.")) {
        const suffix = domain.slice(2)
        return hostname.endsWith(suffix)
      }
      return hostname === domain
    })
  } catch {
    return false
  }
}

export function getEthAddress(address: string) {
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    throw new Error("Invalid Ethereum address")
  }

  return address.toLowerCase() as `0x${string}`
}

export function isProduction() {
  return process.env.NODE_ENV === "production"
}

export function openseaNftUrl(contract: string, tokenId: string, chainId: number): string {
  let url = ""

  switch (chainId) {
    case baseSepolia.id:
      url = "https://testnets.opensea.io/assets/base-sepolia"
      break
    case base.id:
      url = "https://opensea.io/assets/base"
      break
    default:
      url = "https://opensea.io/assets"
  }

  return `${url}/${contract}/${tokenId}`
}

export function usesTestNounsToken() {
  return NOUNS_TOKEN.toLowerCase() !== nounsTokenAddress[1].toLowerCase()
}

export function isBrowser() {
  return typeof window !== "undefined"
}

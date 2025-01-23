"use server"

import { Address, erc20Abi } from "viem"
import { l2Client } from "@/lib/viem/client"
import { getContract } from "viem"

export async function getTokenData(
  contract: Address,
  owner: Address | undefined,
  spender: Address,
) {
  const erc20Contract = getContract({
    address: contract,
    abi: erc20Abi,
    client: l2Client,
  })

  const [allowance, symbol, name, balance] = await Promise.all([
    owner ? erc20Contract.read.allowance([owner, spender]) : null,
    erc20Contract.read.symbol(),
    erc20Contract.read.name(),
    owner ? erc20Contract.read.balanceOf([owner]) : null,
  ])

  return {
    allowance,
    symbol,
    name,
    balance,
  }
}

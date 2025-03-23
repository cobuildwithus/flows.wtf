"use server"

import { kv } from "@vercel/kv"

export interface ETHRates {
  eth: number
}

const KEY = "eth_rates"

async function storeConversionRates(rates: ETHRates) {
  await kv.set(KEY, rates)
}

export const fetchAndSetEthRates = async () => {
  const response = await fetch("https://api.coinbase.com/v2/prices/ETH-USD/spot")
  const json = await response.json()

  const ethRate = Number.parseFloat(json.data?.amount)

  if (!ethRate || Number.isNaN(ethRate)) {
    throw new Error("Invalid or missing ETH rate fetched")
  }

  const rates = { eth: ethRate }
  await storeConversionRates(rates)
}

export async function getConversionRates() {
  const rates = await kv.get<ETHRates>(KEY)
  return rates
}

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
  const response = await fetch(
    "https://production.api.coindesk.com/v2/tb/price/ticker?assets=ETH",
  ).then((coinRes) => coinRes.json())

  const ethRate = response.data?.ETH?.ohlc?.c

  if (!ethRate) {
    throw new Error("No rates fetched")
  } else {
    const rates = {
      eth: ethRate,
    }
    await storeConversionRates(rates)
  }
}

export async function getConversionRates() {
  const rates = await kv.get<ETHRates>(KEY)
  return rates
}

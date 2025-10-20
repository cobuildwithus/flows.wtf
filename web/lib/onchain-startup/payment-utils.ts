export type TokenPayment = {
  timestamp: number
  txnValue: string
  newlyIssuedTokenCount: string
}

const WEI_IN_ETH = 1e18

export function paymentToUsd(payment: TokenPayment, ethPrice: number, flowsPrice: number): number {
  const wei = Number(payment.txnValue) // safer for 18-dec places
  const flowWei = Number(payment.newlyIssuedTokenCount || "0")

  // 1️⃣ Only treat txnValue as ETH when it’s actually > 0.
  if (ethPrice && wei > 0) {
    return (Number(wei) / WEI_IN_ETH) * ethPrice
  }

  // 2️⃣ Otherwise fall back to FLOW tokens.
  if (flowsPrice && flowWei > 0) {
    return (flowWei / WEI_IN_ETH) * flowsPrice
  }

  return 0
}

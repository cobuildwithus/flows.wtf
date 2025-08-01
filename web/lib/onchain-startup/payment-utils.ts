export type TokenPayment = {
  timestamp: number
  txnValue: string
  newlyIssuedTokenCount: string
}

const WEI_IN_ETH = 1e18

export function paymentToUsd(payment: TokenPayment, ethPrice: number, flowsPrice: number): number {
  if (payment.txnValue && ethPrice) {
    return (Number(payment.txnValue) / WEI_IN_ETH) * ethPrice
  }
  if (!payment.txnValue && flowsPrice) {
    return (Number(payment.newlyIssuedTokenCount) / WEI_IN_ETH) * flowsPrice
  }
  return 0
}

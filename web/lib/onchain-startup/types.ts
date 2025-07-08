export type TokenEventData = {
  txHash: string
  timestamp: number
  payer: string
  amount: string
  newlyIssuedTokenCount: string
  beneficiary: string
  chainId: number
  memo: string
  project?: { erc20Symbol: string | null } | null
}

export interface Revenue {
  totalSales: number
  totalOrders: number
  salesChange: number
  ordersChange: number
}

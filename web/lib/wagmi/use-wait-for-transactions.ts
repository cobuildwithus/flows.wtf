"use client"

import { useState, useEffect, useMemo } from "react"
import { toast } from "sonner"
import { getChain, getClient } from "../viem/client"
import { explorerUrl } from "../utils"
import { waitForTransactionReceipt } from "viem/actions"
import { Chain, Client, Transport } from "viem"

export const useWaitForTransactions = (
  txHashes: { txHash: string; chainId: number; confirmed: boolean }[],
  toastId: number | string | undefined,
) => {
  const [pendingTxs, setPendingTxs] = useState(txHashes)
  const [confirmedTxs, setConfirmedTxs] = useState<string[]>([])

  useEffect(() => {
    setPendingTxs(txHashes.filter((tx) => !tx.confirmed))
  }, [txHashes])

  useMemo(() => {
    pendingTxs.forEach(async (tx) => {
      if (confirmedTxs.includes(tx.txHash)) return

      const chainId = tx.chainId
      const chainName = getChain(chainId).name

      toast.loading(`${chainName} transaction in progress...`, {
        id: toastId,
        action: {
          label: "View",
          onClick: () => window.open(explorerUrl(tx.txHash, tx.chainId)),
        },
      })
      const client = getClient(chainId) as Client<Transport, Chain>
      await waitForTransactionReceipt(client, {
        hash: tx.txHash as `0x${string}`,
      })

      setConfirmedTxs((prev) => [...prev, tx.txHash])
      toast.success(`${chainName} transaction confirmed`, { duration: 3000, id: toastId })
      setPendingTxs((prev) => prev.filter((pendingTx) => pendingTx.txHash !== tx.txHash))
    })
  }, [pendingTxs, confirmedTxs, toastId])

  return {
    isLoading: pendingTxs.length > 0,
    isSuccess: pendingTxs.length === 0,
  }
}

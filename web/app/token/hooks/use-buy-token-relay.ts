import { useState } from "react"
import { toast } from "sonner"
import { Address, createWalletClient, custom } from "viem"
import { base, mainnet } from "viem/chains"
import { useAccount } from "wagmi"
import { tokenEmitterImplAbi } from "@/lib/abis"
import { createRelayClient } from "@/lib/relay/client"
import { getChain, l1Client, l2Client } from "@/lib/viem/client"

const toChainId = base.id

export const useBuyTokenRelay = () => {
  const { address } = useAccount()

  const [txHashes, setTxHash] = useState<{ txHash: string; chainId: number; confirmed: boolean }[]>(
    [],
  )

  const executeBuyTokenRelay = async ({
    chainId,
    tokenEmitter,
    args,
    costWithSlippage,
    toastId,
    onSuccess,
    successMessage,
  }: {
    chainId: number
    tokenEmitter: Address
    args: [Address, bigint, bigint, { builder: Address; purchaseReferral: Address }]
    costWithSlippage: bigint
    toastId: string | number | undefined
    onSuccess: (hash: string) => void
    successMessage: string
  }) => {
    const publicClient = chainId === mainnet.id ? l1Client : l2Client

    const { request } = await publicClient.simulateContract({
      address: tokenEmitter,
      abi: tokenEmitterImplAbi,
      functionName: "buyToken",
      args,
      value: costWithSlippage,
      chain: getChain(chainId),
      account: address,
    })

    const wallet = createWalletClient({
      chain: getChain(chainId),
      transport: custom(window.ethereum!),
    })

    const relayClient = createRelayClient(chainId)

    const quote = await relayClient.actions.getQuote({
      chainId,
      toChainId,
      currency: "0x0000000000000000000000000000000000000000",
      toCurrency: "0x0000000000000000000000000000000000000000",
      amount: costWithSlippage.toString(),
      tradeType: "EXACT_OUTPUT",
      wallet,
      txs: [request],
    })

    await relayClient.actions.execute({
      quote,
      wallet,
      onProgress: (progress) => {
        const { currentStep, txHashes, error } = progress

        if (currentStep?.kind === "transaction" && txHashes && txHashes.length > 0) {
          const { txHash, chainId } = txHashes[txHashes.length - 1]
          setTxHash((prev) => {
            const exists = prev.some((tx) => tx.txHash === txHash && tx.chainId === chainId)
            return exists ? prev : [...prev, { txHash, chainId, confirmed: false }]
          })
        }
        if (error) {
          toast.error(error.message, { id: toastId })
        }
      },
    })

    // wait 1s
    await new Promise((resolve) => setTimeout(resolve, 1000))

    toast.success(successMessage, { id: toastId })

    onSuccess(txHashes.length ? txHashes[txHashes.length - 1]?.txHash : "")
  }

  return {
    executeBuyTokenRelay,
    txHashes,
  }
}

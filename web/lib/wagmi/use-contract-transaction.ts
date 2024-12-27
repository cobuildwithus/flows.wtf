"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Chain } from "viem"
import { base } from "viem/chains"
import {
  useAccount,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
  type BaseError,
} from "wagmi"
import { useLogin } from "../auth/use-login"
import { explorerUrl } from "../utils"

export const useContractTransaction = (args?: {
  chainId?: Chain["id"]
  onSuccess?: (hash: string) => void
  loading?: string
  success?: string
}) => {
  const router = useRouter()
  const {
    chainId = base.id,
    loading = "Transaction in progress...",
    success,
    onSuccess = () => router.refresh(),
  } = args || {}
  const [toastId, setToastId] = useState<number | string>()
  const [callbackHandled, setCallbackHandled] = useState(false)
  const { data: hash, isPending, error, ...writeContractRest } = useWriteContract()
  const { isLoading, isSuccess } = useWaitForTransactionReceipt({ hash })

  const { chainId: connectedChainId, isConnected, address } = useAccount()
  const { switchChainAsync } = useSwitchChain()
  const { login, connectWallet } = useLogin()

  useEffect(() => {
    if (callbackHandled || !toastId) return

    if (isLoading && hash) {
      toast.loading(loading, {
        description: "",
        action: {
          label: "View",
          onClick: () => window.open(explorerUrl(hash, chainId)),
        },
        id: toastId,
      })
      return
    }

    if (error) {
      console.error(error)
      toast.error(((error as BaseError).shortMessage || error.message).replace("User ", "You "), {
        id: toastId,
        duration: 3000,
        description: "Check browser console for more details",
      })
      setCallbackHandled(true)
      return
    }

    if (isSuccess && hash) {
      toast.success(success || "Transaction confirmed", { id: toastId, duration: 3000 })
      onSuccess?.(hash)
      setCallbackHandled(true)
      return
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, error, isSuccess])

  return {
    isPending,
    isConfirming: isLoading,
    isConfirmed: isSuccess,
    isLoading: isLoading || isPending,
    hash,
    error,
    prepareWallet: async (toastId?: number | string) => {
      setCallbackHandled(false)

      if (!address) return login()
      if (!isConnected) return connectWallet()

      if (chainId !== connectedChainId) {
        try {
          await switchChainAsync({ chainId })
        } catch (e) {
          toast.error(`Please switch to ${chainId} network`)
          return
        }
      }

      const newToastId = toast.loading(loading, { id: toastId, action: null })
      setToastId(newToastId)
    },
    toastId,
    ...writeContractRest,
  }
}

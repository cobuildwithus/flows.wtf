"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import {
  useAccount,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
  type BaseError,
} from "wagmi"
import { useLogin } from "../auth/use-login"
import { explorerUrl } from "../utils"

export const useContractTransaction = (args: {
  chainId: number
  onSuccess?: (hash: string) => void
  loading?: string
  success?: string
  defaultToastId?: string
}) => {
  const router = useRouter()
  const {
    chainId,
    loading = "Transaction in progress...",
    success,
    onSuccess = () => router.refresh(),
    defaultToastId,
  } = args || {}
  const [toastId, setToastId] = useState<number | string>(defaultToastId || "")
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
    account: address,
    prepareWallet: async (customToastId?: number | string) => {
      setCallbackHandled(false)

      if (!isConnected) return connectWallet()
      if (!address) return login()

      if (chainId !== connectedChainId) {
        try {
          await switchChainAsync({ chainId })
        } catch (e) {
          toast.error(`Please switch to ${chainId} network`)
          return
        }
      }

      // Use custom ID if provided, otherwise use existing state ID
      const idToUse = customToastId || toastId || undefined
      const newToastId = toast.loading(loading, { id: idToUse, action: null })
      setToastId(newToastId)
    },
    toastId,
    ...writeContractRest,
  }
}

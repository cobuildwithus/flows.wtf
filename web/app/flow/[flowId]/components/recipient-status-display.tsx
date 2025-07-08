import { ExternalLink } from "lucide-react"
import { isAddress } from "viem"
import {
  getRecipientStatus,
  getRecipientErrorMessage,
  type ValidationState,
} from "@/lib/recipient/validation-utils"
import { explorerUrl } from "@/lib/utils"

interface Props {
  validationState: ValidationState
  chainId: number
  showStatus: boolean
}

export function RecipientStatusDisplay({ validationState, chainId, showStatus }: Props) {
  const status = getRecipientStatus(validationState)
  const errorMessage = getRecipientErrorMessage(validationState)
  const recipientAddress = validationState.recipientAddress
  const isValidAddress = recipientAddress ? isAddress(recipientAddress) : false

  return (
    <>
      {/* Error Message */}
      {showStatus && status === "error" && errorMessage && (
        <div className="mt-1 flex justify-end">
          <span className="text-xs text-red-500">{errorMessage}</span>
        </div>
      )}

      {/* Valid Address Display */}
      {isValidAddress && recipientAddress && (
        <div className="mt-2">
          <a
            href={explorerUrl(recipientAddress, chainId, "address")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 text-green-600 transition-colors hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
          >
            <span className="font-mono text-sm">
              {recipientAddress.slice(0, 6)}...{recipientAddress.slice(-4)}
            </span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      )}
    </>
  )
}

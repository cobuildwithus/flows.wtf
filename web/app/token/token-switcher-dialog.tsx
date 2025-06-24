"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { SkeletonLoader } from "@/components/ui/skeleton"
import { useERC20TokensForParent } from "@/lib/tcr/use-erc20s-for-parent"
import { useFlowForToken } from "@/lib/tcr/use-flow-for-token"
import { getIpfsUrl } from "@/lib/utils"
import { ChevronDownIcon } from "@radix-ui/react-icons"
import { useRef } from "react"
import type { Address } from "viem"
import { CurrencyDisplay } from "./currency-display"
import { TokenList } from "./token-list"
import { TokenLogo } from "./token-logo"

interface Props {
  switchToken: (token: Address, tokenEmitter: Address) => void
  currentToken: Address | undefined
  currentTokenEmitter: Address | undefined
  parentFlowContract: Address
  chainId: number
}

export function TokenSwitcherDialog({
  switchToken,
  currentToken,
  currentTokenEmitter,
  parentFlowContract,
  chainId,
}: Props) {
  const { tokens, isLoading } = useERC20TokensForParent(parentFlowContract, chainId)
  const ref = useRef<HTMLButtonElement>(null)

  const { flow } = useFlowForToken(currentToken)

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button type="button" ref={ref} className="flex flex-shrink-0">
          <CurrencyDisplay>
            {flow?.image && <TokenLogo src={getIpfsUrl(flow?.image || "")} alt="TCR token" />}
            <span className="px-1">
              {tokens?.find((erc20) => erc20.address === currentToken)?.symbol}
            </span>
            <ChevronDownIcon className="mt-0.5 h-4 w-auto pr-1 text-black dark:text-white" />
          </CurrencyDisplay>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-screen-sm">
        <DialogHeader>
          <DialogTitle className="text-center text-lg font-medium">Select a token</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <SkeletonLoader height={82} count={4} />
        ) : (
          <TokenList
            switchToken={(token, tokenEmitter) => {
              switchToken(token, tokenEmitter)
              ref.current?.click() // close dialog
            }}
            tokens={tokens}
            chainId={chainId}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

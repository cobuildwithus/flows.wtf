"use client"

import { useEthBalances } from "@/app/token/hooks/use-eth-balances"
import { useETHPrice } from "@/app/token/hooks/useETHPrice"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useLogin } from "@/lib/auth/use-login"
import React, { ComponentProps, useRef, useState } from "react"
import { Grant } from "@/lib/database/types"
import {
  TokenKey,
  formatTokenAmount,
  getTokenBalance,
  getTokensWithFlow,
} from "./libs/funding-token-lib"
import { useFundFlow } from "./hooks/use-fund-flow"
import { useFundingInput } from "./hooks/use-funding-input"
import { useERC20Balances } from "@/lib/erc20/use-erc20-balances"
import { StreamingDurationSelector } from "./streaming-duration-selector"
import { SuperfluidFlowsList } from "./superfluid-flows-list"
import { FundingTokenSelector } from "./funding-token-selector"
import { RebalanceFlowButton } from "./rebalance-flow-button"
import { AuthButton } from "../ui/auth-button"
import { useRouter } from "next/navigation"

interface Props {
  flow: Pick<
    Grant,
    | "id"
    | "title"
    | "underlyingERC20Token"
    | "chainId"
    | "superToken"
    | "underlyingTokenSymbol"
    | "underlyingTokenName"
    | "underlyingTokenDecimals"
    | "underlyingTokenLogo"
    | "recipient"
  >
}

type FundTab = "fund" | "manage"

export function FundFlow(props: Props & ComponentProps<typeof Button>) {
  const router = useRouter()
  const { flow, ...buttonProps } = props
  const { title: name, underlyingERC20Token, chainId, superToken } = flow
  const [isOpen, setIsOpen] = useState(false)
  const [selectedTokenKey, setSelectedTokenKey] = useState<TokenKey>(`${superToken}-${chainId}`)
  const [donationAmount, setDonationAmount] = useState("")
  const [streamingMonths, setStreamingMonths] = useState(1)
  const [tab, setTab] = useState<FundTab>("fund")
  const inputRef = useRef<HTMLInputElement>(null)

  const { address, isConnected } = useLogin()
  const { balances: ethBalances } = useEthBalances()
  const { ethPrice } = useETHPrice()

  const TOKENS_WITH_FLOW = getTokensWithFlow({
    superToken,
    chainId,
    underlyingTokenSymbol: flow.underlyingTokenSymbol,
    underlyingTokenName: flow.underlyingTokenName,
    underlyingTokenDecimals: flow.underlyingTokenDecimals,
    underlyingTokenLogo: flow.underlyingTokenLogo,
  })

  const selectedToken = TOKENS_WITH_FLOW[selectedTokenKey]

  // Fetch both token balances for display purposes
  const { balances } = useERC20Balances(
    [underlyingERC20Token as `0x${string}`, superToken as `0x${string}`],
    address,
    chainId,
  )

  const underlyingTokenBalance = balances[0] || 0n
  const normalizedUnderlyingTokenBalance =
    underlyingTokenBalance * BigInt(10 ** (18 - flow.underlyingTokenDecimals))
  const superTokenBalance = balances[1] || 0n

  const streamingTokenBalance = normalizedUnderlyingTokenBalance + superTokenBalance

  // Check if selected token is the streaming token (non-native token that matches the flow's token)
  const isStreamingToken = !selectedToken.isNative

  const { buttonText, isDisabled, handleFund, hasInsufficientBalance } = useFundFlow({
    selectedToken: { key: selectedTokenKey, ...selectedToken },
    donationAmount,
    flow,
    totalTokenBalance: streamingTokenBalance,
    superTokenBalance: superTokenBalance || 0n,
    isStreamingToken,
    streamingMonths,
    onSuccess: () => {
      setTimeout(() => {
        setDonationAmount("")
        router.refresh()
        setTab("manage")
      }, 3000)
    },
  })

  const { handleInputChange, handleInputFocus, handleMaxClick } = useFundingInput({
    selectedToken: { key: selectedTokenKey, ...selectedToken },
    totalTokenBalance: streamingTokenBalance,
    setDonationAmount,
  })

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <AuthButton {...buttonProps}>Fund</AuthButton>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Fund {name}</DialogTitle>
          <DialogDescription className="text-zinc-500 dark:text-muted-foreground">
            Support our builders on the ground
          </DialogDescription>
        </DialogHeader>

        {/* Tab Buttons */}
        <div className="flex items-center justify-start gap-2">
          <Button
            type="button"
            variant={tab === "fund" ? "outline" : "ghost"}
            className="min-w-20 rounded-full"
            onClick={() => setTab("fund")}
            size="xs"
          >
            Fund
          </Button>
          <Button
            type="button"
            variant={tab === "manage" ? "outline" : "ghost"}
            className="min-w-20 rounded-full"
            onClick={() => setTab("manage")}
            size="xs"
          >
            Manage
          </Button>
        </div>

        {/* Tab Content */}
        {tab === "fund" && (
          <div className="space-y-6">
            <div className="dark:hover-border-border rounded-lg border border-zinc-300 p-4 duration-300 focus-within:border-zinc-500 hover:border-zinc-500 dark:border-border/50 dark:focus-within:border-border">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Input
                    ref={inputRef}
                    type="text"
                    inputMode="numeric"
                    value={donationAmount}
                    onChange={handleInputChange}
                    disabled={!isConnected}
                    onFocus={handleInputFocus}
                    placeholder="0"
                    className="h-auto border-none bg-transparent p-0 text-3xl font-medium shadow-none placeholder:text-zinc-500 focus-visible:ring-0 dark:placeholder:text-zinc-400"
                  />
                </div>

                <div className="flex flex-col items-end gap-2">
                  <FundingTokenSelector
                    selectedToken={{ key: selectedTokenKey, ...selectedToken }}
                    onTokenChange={setSelectedTokenKey}
                    chainId={chainId}
                    ethBalances={ethBalances}
                    streamingTokenBalance={streamingTokenBalance}
                    ethPrice={ethPrice || undefined}
                    tokens={TOKENS_WITH_FLOW}
                  />

                  <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-muted-foreground">
                    <span className="font-medium">
                      {formatTokenAmount(
                        getTokenBalance(
                          { key: selectedTokenKey, ...selectedToken },
                          ethBalances,
                          streamingTokenBalance,
                        ),
                        selectedToken.decimals,
                        selectedToken.symbol,
                      )}{" "}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleMaxClick}
                      className="h-6 rounded-xl bg-primary/10 px-2 text-xs font-medium text-primary hover:bg-primary/25 hover:text-primary"
                    >
                      Max
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Only show streaming duration selector for non-native tokens when there are sufficient funds */}
            {!selectedToken.isNative && !hasInsufficientBalance && (
              <StreamingDurationSelector
                donationAmount={donationAmount}
                tokenSymbol={selectedToken.symbol}
                tokenDecimals={selectedToken.decimals}
                months={streamingMonths}
                onMonthsChange={setStreamingMonths}
              />
            )}

            <Button onClick={handleFund} disabled={isDisabled} className="w-full" size="xl">
              {buttonText}
            </Button>
          </div>
        )}

        {tab === "manage" && (
          <div className="min-h-[320px] items-end justify-between space-y-6">
            <RebalanceFlowButton
              contract={flow.recipient as `0x${string}`}
              chainId={chainId}
              address={address as `0x${string}`}
              receiver={flow.recipient}
              superToken={superToken as `0x${string}`}
              underlyingToken={underlyingERC20Token as `0x${string}`}
            />
            <div className="space-y-3">
              <SuperfluidFlowsList
                address={address}
                chainId={chainId}
                receiver={flow.recipient}
                maxItems={3}
                tokens={TOKENS_WITH_FLOW}
              />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

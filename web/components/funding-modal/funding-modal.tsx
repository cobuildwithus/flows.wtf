"use client"

import { useEthBalances } from "@/app/token/hooks/use-eth-balances"
import { useETHPrice } from "@/app/token/hooks/useETHPrice"
import { Button } from "@/components/ui/button"
import { Currency } from "@/components/ui/currency"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { useLogin } from "@/lib/auth/use-login"
import { ChevronDownIcon } from "@radix-ui/react-icons"
import React, { ComponentProps, useRef, useState, useEffect } from "react"
import { ChainLogo } from "../ui/chain-logo"
import { Grant } from "@/lib/database/types"
import { TokenLogo } from "@/app/token/token-logo"
import {
  TOKENS,
  TokenKey,
  formatTokenAmount,
  getTokenBalance,
  AVAILABLE_TOKENS,
} from "./libs/funding-token-lib"
import { useFunding } from "./hooks/use-funding"
import { useFundingInput } from "./hooks/use-funding-input"
import { getTokenDropdownItems } from "./libs/funding-dropdown-lib"
import { useERC20Balances } from "@/lib/erc20/use-erc20-balances"
import { StreamingDurationSelector } from "./streaming-duration-selector"

interface Props {
  id: string
  flow: Grant
}

export function FundingModal(props: Props & ComponentProps<typeof Button>) {
  const { id, flow, ...buttonProps } = props
  const { title: name, underlyingERC20Token, chainId, superToken } = flow
  const [isOpen, setIsOpen] = useState(false)
  const [selectedTokenKey, setSelectedTokenKey] = useState<TokenKey>(`eth-${chainId}`)
  const [donationAmount, setDonationAmount] = useState("100")
  const [streamingMonths, setStreamingMonths] = useState(3)
  const inputRef = useRef<HTMLInputElement>(null)

  const { authenticated, address, isConnected } = useLogin()
  const { balances: ethBalances } = useEthBalances()
  const { ethPrice } = useETHPrice()

  const selectedToken = TOKENS[selectedTokenKey]

  // Fetch both token balances for display purposes
  const { balances } = useERC20Balances(
    [underlyingERC20Token as `0x${string}`, superToken as `0x${string}`],
    address,
    chainId,
  )

  const underlyingTokenBalance = balances[0] || 0n
  const superTokenBalance = balances[1] || 0n
  const streamingTokenBalance = underlyingTokenBalance + superTokenBalance

  // When modal opens, default to streaming token if user has balance
  useEffect(() => {
    if (isOpen && streamingTokenBalance > 0n) {
      // Find the non-native token for this chain
      const streamingToken = AVAILABLE_TOKENS.find(
        (token) => !token.isNative && token.chainId === chainId,
      )
      if (streamingToken) {
        setSelectedTokenKey(streamingToken.key)
      }
    }
  }, [isOpen]) // Only run when modal opens/closes

  // Check if selected token is the streaming token (non-native token that matches the flow's token)
  const isStreamingToken = !selectedToken.isNative

  const { buttonText, isDisabled, handleFund, hasInsufficientBalance } = useFunding({
    selectedToken: { key: selectedTokenKey, ...selectedToken },
    donationAmount,
    flow,
    totalTokenBalance: streamingTokenBalance,
    superTokenBalance: superTokenBalance || 0n,
    isStreamingToken,
    streamingMonths,
  })

  const { handleInputChange, handleInputFocus, handleMaxClick } = useFundingInput({
    selectedToken: { key: selectedTokenKey, ...selectedToken },
    totalTokenBalance: streamingTokenBalance,
    setDonationAmount,
  })

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button {...buttonProps}>Fund</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Fund {name}</DialogTitle>
          <DialogDescription className="text-zinc-500 dark:text-muted-foreground">
            Support our builders on the ground
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 space-y-6">
          <div className="dark:hover-border-border rounded-lg border border-zinc-300 p-4 duration-300 focus-within:border-zinc-500 hover:border-zinc-500 dark:border-border/50 dark:focus-within:border-border">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Input
                  ref={inputRef}
                  type="text"
                  inputMode="numeric"
                  value={donationAmount}
                  onChange={handleInputChange}
                  disabled={!authenticated || !isConnected}
                  onFocus={handleInputFocus}
                  placeholder="0"
                  className="h-auto border-none bg-transparent p-0 text-3xl font-medium shadow-none focus-visible:ring-0"
                />
              </div>

              <div className="flex flex-col items-end gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="secondary" className="gap-2 rounded-full">
                      {selectedToken.isNative ? (
                        <ChainLogo chainId={selectedToken.chainId} size={18} />
                      ) : (
                        <TokenLogo src={selectedToken.logo} alt={selectedToken.name} size={18} />
                      )}
                      <span className="font-semibold">{selectedToken.symbol}</span>
                      <ChevronDownIcon className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64">
                    {getTokenDropdownItems(
                      chainId,
                      ethBalances,
                      streamingTokenBalance,
                      ethPrice || undefined,
                    ).map(({ token, balance, chainName, usdValue }) => (
                      <DropdownMenuItem
                        key={token.key}
                        onClick={() => setSelectedTokenKey(token.key)}
                        className="cursor-pointer py-3"
                      >
                        <div className="flex w-full items-start justify-between">
                          <div className="flex items-center gap-3">
                            {token.isNative ? (
                              <ChainLogo chainId={token.chainId} size={24} />
                            ) : (
                              <TokenLogo src={token.logo} alt={token.name} size={24} />
                            )}
                            <div>
                              <div className="font-medium">{token.symbol}</div>

                              <div className="text-xs text-zinc-500 dark:text-muted-foreground">
                                {token.isNative ? chainName : token.name}
                              </div>
                            </div>
                          </div>
                          {token.isNative ? (
                            <div className="text-right">
                              <div className="text-sm font-medium">
                                {formatTokenAmount(balance, token.decimals, token.symbol)}
                              </div>
                              <div className="text-xs text-zinc-500 dark:text-muted-foreground">
                                <Currency>{usdValue}</Currency>
                              </div>
                            </div>
                          ) : (
                            <div className="text-right">
                              <div className="text-sm font-medium">{usdValue}</div>
                            </div>
                          )}
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

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
                    {selectedToken.symbol}
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
          {!selectedToken.isNative &&
            !hasInsufficientBalance &&
            donationAmount &&
            Number(donationAmount) > 0 && (
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
      </DialogContent>
    </Dialog>
  )
}

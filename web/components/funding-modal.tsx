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
import React, { ComponentProps, useMemo, useRef, useState } from "react"
import { erc20Abi, formatUnits, parseUnits, size } from "viem"
import { base, mainnet, optimism } from "viem/chains"
import { useReadContract } from "wagmi"
import { ChainLogo } from "./ui/chain-logo"
import { Grant } from "@/lib/database/types"
import { TokenLogo } from "@/app/token/token-logo"

const TOKENS = {
  [`eth-${mainnet.id}`]: {
    symbol: "ETH",
    name: "Ethereum",
    chainId: mainnet.id,
    decimals: 18,
    isNative: true,
  },
  [`eth-${base.id}`]: {
    symbol: "ETH",
    name: "Base ETH",
    chainId: base.id,
    decimals: 18,
    isNative: true,
  },
  [`eth-${optimism.id}`]: {
    symbol: "ETH",
    name: "Optimism ETH",
    chainId: optimism.id,
    decimals: 18,
    isNative: true,
  },
  "gardens-optimism": {
    symbol: "⚘GARDEN",
    name: "Gardens",
    chainId: optimism.id,
    decimals: 18,
    isNative: false,
    logo: "/gardens.png",
  },
} as const

type TokenKey = keyof typeof TOKENS
type Token = (typeof TOKENS)[TokenKey] & { key: TokenKey }

const AVAILABLE_TOKENS: Token[] = Object.entries(TOKENS).map(([key, token]) => ({
  key: key as TokenKey,
  ...token,
}))

interface Props {
  id: string
  flow: Grant
}

export function FundingModal(props: Props & ComponentProps<typeof Button>) {
  const { id, flow, ...buttonProps } = props
  const { title: name, underlyingERC20Token, chainId } = flow
  const [isOpen, setIsOpen] = useState(false)
  const [selectedTokenKey, setSelectedTokenKey] = useState<TokenKey>(`eth-${chainId}`)
  const [donationAmount, setDonationAmount] = useState("100")
  const inputRef = useRef<HTMLInputElement>(null)

  const { login, authenticated, address, isConnected, connectWallet } = useLogin()
  const { balances: ethBalances } = useEthBalances()
  const { ethPrice } = useETHPrice()

  const selectedToken = TOKENS[selectedTokenKey]

  const { data: underlyingTokenBalance } = useReadContract({
    address: underlyingERC20Token as `0x${string}`,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: chainId,
    query: { enabled: !!address },
  })

  const getTokenBalance = (token: Token): bigint => {
    if (token.isNative) {
      return ethBalances[token.chainId as keyof typeof ethBalances] || 0n
    }

    return underlyingTokenBalance || 0n
  }

  const getTokenUSDValue = (token: Token, balance: bigint): number => {
    const amount = Number(formatUnits(balance, token.decimals))

    if (token.symbol === "ETH" && ethPrice) return amount * ethPrice

    return amount
  }

  const buttonState = useMemo(() => {
    if (!isConnected || !authenticated) {
      return { text: "Connect wallet", disabled: false }
    }

    if (!donationAmount || Number(donationAmount) <= 0) {
      return { text: "Fund", disabled: true }
    }

    try {
      const balance = getTokenBalance({ key: selectedTokenKey, ...selectedToken })
      const donationAmountBigInt = parseUnits(donationAmount, selectedToken.decimals)

      let hasInsufficientBalance = false

      if (selectedToken.isNative) {
        const gasReserve = parseUnits("0.01", selectedToken.decimals)
        hasInsufficientBalance = balance < donationAmountBigInt + gasReserve
      } else {
        hasInsufficientBalance = balance < donationAmountBigInt
      }

      if (hasInsufficientBalance) {
        return {
          text: `Insufficient ${selectedToken.symbol} balance`,
          disabled: true,
        }
      }
    } catch {
      return { text: "Fund", disabled: true }
    }

    return {
      text: `Fund ${donationAmount} ${selectedToken.symbol}`,
      disabled: false,
    }
  }, [
    isConnected,
    authenticated,
    donationAmount,
    selectedToken,
    selectedTokenKey,
    ethBalances,
    underlyingTokenBalance,
  ])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const maxDecimals = 6
    const validatedValue = validateNumericInput(e.target.value, maxDecimals)
    setDonationAmount(validatedValue)
  }

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setTimeout(() => {
      const length = e.target.value.length
      e.target.setSelectionRange(length, length)
    }, 0)
  }

  const handleMaxClick = () => {
    const balance = getTokenBalance({ key: selectedTokenKey, ...selectedToken })

    if (selectedToken.isNative) {
      const gasReserve = parseUnits("0.01", selectedToken.decimals)
      const maxAmount = balance > gasReserve ? balance - gasReserve : 0n
      setDonationAmount(formatUnits(maxAmount, selectedToken.decimals))
    } else {
      setDonationAmount(formatUnits(balance, selectedToken.decimals))
    }
  }

  const handleFund = async () => {
    if (!authenticated) return login()
    if (!isConnected) return connectWallet()

    const donationAmountBigInt = parseUnits(donationAmount, selectedToken.decimals)

    console.debug("Fund contract call", {
      flowId: id,
      name,
      amount: donationAmount,
      amountBigInt: donationAmountBigInt.toString(),
      token: selectedToken,
    })
  }

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
                    {AVAILABLE_TOKENS.filter((token) => token.chainId === chainId).map((token) => {
                      const balance = getTokenBalance(token)
                      const chainName = TOKENS[token.key].name
                      const usdValue = getTokenUSDValue(token, balance)

                      return (
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
                      )
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>

                <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-muted-foreground">
                  <span className="font-medium">
                    {formatTokenAmount(
                      getTokenBalance({ key: selectedTokenKey, ...selectedToken }),
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

          <Button onClick={handleFund} disabled={buttonState.disabled} className="w-full" size="xl">
            {buttonState.text}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

const formatTokenAmount = (amount: bigint, decimals: number, symbol: string): string => {
  const formatted = formatUnits(amount, decimals)
  const number = Number(formatted)

  if (number === 0) return "0"
  if (number < 0.000001 && symbol === "ETH") {
    return number.toFixed(8).replace(/\.?0+$/, "")
  }

  const maxDecimals = symbol === "USDC" ? 2 : 6
  return number.toFixed(maxDecimals).replace(/\.?0+$/, "")
}

const validateNumericInput = (value: string, maxDecimals: number): string => {
  const sanitized = value.replace(/[^0-9.]/g, "")
  const parts = sanitized.split(".")

  if (parts.length <= 2) {
    if (parts.length === 2 && parts[1].length > maxDecimals) {
      parts[1] = parts[1].substring(0, maxDecimals)
    }
    return parts.join(".")
  }

  return value
}

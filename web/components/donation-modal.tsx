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
import type { Address } from "viem"
import { erc20Abi, formatUnits, parseUnits } from "viem"
import { base, mainnet } from "viem/chains"
import { useReadContract } from "wagmi"
import { ChainLogo } from "./ui/chain-logo"

const TOKENS = {
  "eth-mainnet": {
    symbol: "ETH",
    name: "Ethereum",
    chainId: mainnet.id,
    decimals: 18,
    isNative: true,
  },
  "eth-base": {
    symbol: "ETH",
    name: "Base ETH",
    chainId: base.id,
    decimals: 18,
    isNative: true,
  },
  "usdc-mainnet": {
    symbol: "USDC",
    name: "USD Coin",
    chainId: mainnet.id,
    decimals: 6,
    address: "0xa0b86a33e6417aae2b7d1b1a6a8d29fb0f0fa1f7" as Address,
    isNative: false,
  },
  "usdc-base": {
    symbol: "USDC",
    name: "USD Coin",
    chainId: base.id,
    decimals: 6,
    address: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913" as Address,
    isNative: false,
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
  name: string
}

export function DonationModal(props: Props & ComponentProps<typeof Button>) {
  const { id, name, ...buttonProps } = props
  const [isOpen, setIsOpen] = useState(false)
  const [selectedTokenKey, setSelectedTokenKey] = useState<TokenKey>("usdc-base")
  const [donationAmount, setDonationAmount] = useState("100")
  const inputRef = useRef<HTMLInputElement>(null)

  const { login, authenticated, address, isConnected, connectWallet } = useLogin()
  const { balances: ethBalances } = useEthBalances()
  const { ethPrice } = useETHPrice()

  const selectedToken = TOKENS[selectedTokenKey]

  const { data: usdcMainnetBalance } = useReadContract({
    address: TOKENS["usdc-mainnet"].address,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: mainnet.id,
    query: { enabled: !!address },
  })

  const { data: usdcBaseBalance } = useReadContract({
    address: TOKENS["usdc-base"].address,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: base.id,
    query: { enabled: !!address },
  })

  const getTokenBalance = (token: Token): bigint => {
    if (token.isNative) {
      return ethBalances[token.chainId as keyof typeof ethBalances] || 0n
    }

    return token.chainId === mainnet.id ? usdcMainnetBalance || 0n : usdcBaseBalance || 0n
  }

  const getTokenUSDValue = (token: Token, balance: bigint): number => {
    const amount = Number(formatUnits(balance, token.decimals))

    if (token.symbol === "USDC") return amount
    if (token.symbol === "ETH" && ethPrice) return amount * ethPrice

    return 0
  }

  const buttonState = useMemo(() => {
    if (!isConnected || !authenticated) {
      return { text: "Connect wallet", disabled: false }
    }

    if (!donationAmount || Number(donationAmount) <= 0) {
      return { text: "Donate", disabled: true }
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
      return { text: "Donate", disabled: true }
    }

    return {
      text: `Donate ${donationAmount} ${selectedToken.symbol}`,
      disabled: false,
    }
  }, [
    isConnected,
    authenticated,
    donationAmount,
    selectedToken,
    selectedTokenKey,
    ethBalances,
    usdcMainnetBalance,
    usdcBaseBalance,
  ])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const maxDecimals = selectedToken.symbol === "USDC" ? 2 : 6
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
      setDonationAmount(formatTokenAmount(maxAmount, selectedToken.decimals, selectedToken.symbol))
    } else {
      setDonationAmount(formatTokenAmount(balance, selectedToken.decimals, selectedToken.symbol))
    }
  }

  const handleDonate = async () => {
    if (!authenticated) return login()
    if (!isConnected) return connectWallet()

    console.debug("Donate contract call", {
      flowId: id,
      name,
      amount: donationAmount,
      token: selectedToken,
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button {...buttonProps}>Donate</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Donate to {name}</DialogTitle>
          <DialogDescription className="text-zinc-500 dark:text-muted-foreground">
            Support builders
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
                      <ChainLogo chainId={selectedToken.chainId} size={18} />
                      <span className="font-semibold">{selectedToken.symbol}</span>
                      <ChevronDownIcon className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64">
                    {AVAILABLE_TOKENS.map((token) => {
                      const balance = getTokenBalance(token)
                      const chainName = token.chainId === mainnet.id ? "Mainnet" : "Base"
                      const usdValue = getTokenUSDValue(token, balance)

                      return (
                        <DropdownMenuItem
                          key={token.key}
                          onClick={() => setSelectedTokenKey(token.key)}
                          className="cursor-pointer py-3"
                        >
                          <div className="flex w-full items-center justify-between">
                            <div className="flex items-center gap-3">
                              <ChainLogo chainId={token.chainId} size={24} />
                              <div>
                                <div className="font-medium">{token.symbol}</div>
                                <div className="text-xs text-zinc-500 dark:text-muted-foreground">
                                  {chainName}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium">
                                <Currency>{usdValue}</Currency>
                              </div>
                              <div className="text-xs text-zinc-500 dark:text-muted-foreground">
                                {formatTokenAmount(balance, token.decimals, token.symbol)}
                              </div>
                            </div>
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

          <Button
            onClick={handleDonate}
            disabled={buttonState.disabled}
            className="w-full"
            size="xl"
          >
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

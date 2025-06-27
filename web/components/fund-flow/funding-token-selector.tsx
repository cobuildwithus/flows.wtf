"use client"

import { Button } from "@/components/ui/button"
import { Currency } from "@/components/ui/currency"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDownIcon } from "@radix-ui/react-icons"
import { ChainLogo } from "../ui/chain-logo"
import { TokenLogo } from "@/app/token/token-logo"
import {
  type TokenKey,
  type Token,
  type TokenInfo,
  formatTokenAmount,
} from "./libs/funding-token-lib"
import { getTokenDropdownItems } from "./libs/funding-dropdown-lib"

interface FundingTokenSelectorProps {
  selectedToken: Token
  onTokenChange: (tokenKey: TokenKey) => void
  chainId: number
  ethBalances: Record<number, bigint>
  streamingTokenBalance: bigint
  ethPrice?: number
  tokens: Record<string, TokenInfo>
}

export function FundingTokenSelector({
  selectedToken,
  onTokenChange,
  chainId,
  ethBalances,
  streamingTokenBalance,
  ethPrice,
  tokens,
}: FundingTokenSelectorProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" className="gap-2 rounded-full">
          {selectedToken.isNative ? (
            <ChainLogo chainId={selectedToken.chainId} size={18} />
          ) : selectedToken.logo ? (
            <TokenLogo src={selectedToken.logo} alt={selectedToken.name} size={18} />
          ) : (
            <div className="h-5 w-5 rounded-full bg-muted" />
          )}
          <span className="font-semibold">{selectedToken.symbol}</span>
          <ChevronDownIcon className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        {getTokenDropdownItems(tokens, chainId, ethBalances, streamingTokenBalance, ethPrice).map(
          ({ token, balance, chainName, usdValue }) => (
            <DropdownMenuItem
              key={token.key}
              onClick={() => onTokenChange(token.key)}
              className="cursor-pointer py-3"
            >
              <div className="flex w-full items-start justify-between">
                <div className="flex items-center gap-3">
                  {token.isNative ? (
                    <ChainLogo chainId={token.chainId} size={24} />
                  ) : token.logo ? (
                    <TokenLogo src={token.logo} alt={token.name} size={24} />
                  ) : (
                    <div className="h-6 w-6 rounded-full bg-muted" />
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
                    <div className="text-sm font-medium">
                      {formatTokenAmount(balance, token.decimals, token.symbol)}
                    </div>
                  </div>
                )}
              </div>
            </DropdownMenuItem>
          ),
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

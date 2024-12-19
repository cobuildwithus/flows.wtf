"use client"

import { getEthAddress } from "@/lib/utils"
import { useState } from "react"
import { Address } from "viem"
import { base } from "viem/chains"
import { useAccount, useBalance } from "wagmi"
import { useSellTokenQuote } from "./hooks/useSellTokenQuote"
import { formatUSDValue, useETHPrice } from "./hooks/useETHPrice"
import { ConversionBox } from "./conversion-box"
import { CurrencyInput } from "./currency-input"
import { TokenBalance } from "./token-balance"
import { SwitchSwapBoxButton } from "./switch-box-button"
import { useERC20Balances } from "@/lib/tcr/use-erc20-balances"
import { TokenBalanceAndUSDValue } from "./token-balance-usd-value"
import { useERC20Tokens } from "@/lib/tcr/use-erc20s"
import { TokenSwitcherDialog } from "./token-switcher-dialog"
import { EthConversionBox } from "./eth-conversion-box"
import { CurrencyDisplay } from "./currency-display"
import { BaseEthLogo } from "./base-eth-logo"
import { SellTokenButton } from "./sell-token-button"

interface Props {
  defaultTokenAmount: bigint
  switchSwapBox: () => void
  parentFlowContract: Address
  token: Address
  tokenEmitter: Address
  onSuccess: (hash: string) => void
  setTokenAndEmitter: (token: Address, tokenEmitter: Address) => void
}

const chainId = base.id

export function SellTokenBox(props: Props) {
  const {
    defaultTokenAmount,
    switchSwapBox,
    token,
    tokenEmitter,
    parentFlowContract,
    setTokenAndEmitter,
    onSuccess,
  } = props
  const { address } = useAccount()
  const { data: balance } = useBalance({ address })
  const [tokenAmount, _setTokenAmount] = useState((Number(defaultTokenAmount) / 1e18).toString())
  const [tokenAmountBigInt, _setTokenAmountBigInt] = useState(defaultTokenAmount)

  const { balances, refetch } = useERC20Balances([getEthAddress(token)], address)
  const tokenBalance = balances?.[0]

  const { tokens } = useERC20Tokens([token], chainId)
  const tokenSymbol = tokens?.[0]?.symbol

  const {
    payment,
    isLoading: isLoadingQuote,
    isError,
  } = useSellTokenQuote(getEthAddress(tokenEmitter), tokenAmountBigInt, chainId)

  const setTokenAmount = (value: string, valueBigInt?: bigint) => {
    _setTokenAmount(value)
    _setTokenAmountBigInt(valueBigInt || BigInt(Math.trunc(Number(value) * 1e18) || "0"))
  }

  const { ethPrice } = useETHPrice()

  return (
    <div className="space-y-1 rounded-3xl bg-white p-1.5 dark:bg-black/90">
      <div className="relative flex flex-col">
        <ConversionBox label="Sell">
          <div className="flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <CurrencyInput
                id="amount"
                name="amount"
                value={tokenAmount}
                onChange={(e) => setTokenAmount(e.target.value)}
              />
              <TokenSwitcherDialog
                parentFlowContract={parentFlowContract}
                switchToken={(token, tokenEmitter) => {
                  setTokenAndEmitter(token, tokenEmitter)
                }}
                currentToken={token}
                currentTokenEmitter={tokenEmitter}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 dark:text-white">
                {formatUSDValue(ethPrice || 0, payment)}
              </span>
              <div
                onClick={() =>
                  setTokenAmount((Number(tokenBalance) / 1e18).toString(), tokenBalance)
                }
                className="cursor-pointer"
              >
                <TokenBalance balance={tokenBalance} />
              </div>
            </div>
          </div>
        </ConversionBox>

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <SwitchSwapBoxButton switchSwapBox={switchSwapBox} />
        </div>
        <div className="mb-1" />

        <EthConversionBox
          currencyDisplay={
            <CurrencyDisplay className="py-0.5">
              <BaseEthLogo />
              <span className="pr-1">ETH</span>
            </CurrencyDisplay>
          }
          label="Receive"
          amount={payment}
          isLoadingQuote={isLoadingQuote}
        >
          <TokenBalanceAndUSDValue
            balance={balance?.value || BigInt(0)}
            ethPrice={ethPrice || 0}
            ethAmount={payment}
          />
        </EthConversionBox>
      </div>
      <SellTokenButton
        isLoadingQuote={isLoadingQuote}
        isError={isError}
        tokenSymbol={tokenSymbol || ""}
        tokenEmitter={tokenEmitter}
        tokenBalance={tokenBalance}
        tokenAmountBigInt={tokenAmountBigInt}
        payment={payment}
        onSuccess={(hash) => {
          refetch()
          onSuccess(hash)
        }}
      />
    </div>
  )
}

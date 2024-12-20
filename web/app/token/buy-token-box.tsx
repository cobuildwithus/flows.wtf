"use client"

import { createRelayClient } from "@/lib/relay/client"
import { useERC20Balances } from "@/lib/tcr/use-erc20-balances"
import { getEthAddress } from "@/lib/utils"
import { RelayChain } from "@reservoir0x/relay-sdk"
import { useMemo, useState } from "react"
import { Address } from "viem"
import { base } from "viem/chains"
import { useAccount, useBalance } from "wagmi"
import { BuyTokenButton } from "./buy-token-button"
import { ConversionBox } from "./conversion-box"
import { CurrencyInput } from "./currency-input"
import { EthConversionBox } from "./eth-conversion-box"
import { useBuyTokenQuote, useBuyTokenQuoteWithRewards } from "./hooks/useBuyTokenQuote"
import { useETHPrice } from "./hooks/useETHPrice"
import { SwitchSwapBoxButton } from "./switch-box-button"
import { SwitchEthChainButton } from "./switch-eth-payment-button"
import { TokenBalanceAndUSDValue } from "./token-balance-usd-value"
import { TokenBalanceWithWarning } from "./token-balance-with-warning"
import { TokenSwitcherDialog } from "./token-switcher-dialog"

interface Props {
  defaultTokenAmount: bigint
  token: Address
  tokenEmitter: Address
  parentFlowContract: Address
  onSuccess: (hash: string) => void
  switchSwapBox: () => void
  setTokenAndEmitter: (token: Address, tokenEmitter: Address) => void
}

const chainId = base.id

export function BuyTokenBox({
  defaultTokenAmount,
  token,
  tokenEmitter,
  parentFlowContract,
  switchSwapBox,
  onSuccess,
  setTokenAndEmitter,
}: Props) {
  const { address } = useAccount()
  const { chains } = useMemo(() => createRelayClient(chainId), [])
  const [selectedChain, setSelectedChain] = useState<RelayChain>(
    () => chains.find(({ id }) => id === chainId) || chains[0],
  )
  const { data: balance } = useBalance({ address, chainId: selectedChain.id })
  const [tokenAmount, _setTokenAmount] = useState((Number(defaultTokenAmount) / 1e18).toString())
  const [tokenAmountBigInt, _setTokenAmountBigInt] = useState(defaultTokenAmount)

  const { balances, refetch } = useERC20Balances([getEthAddress(token)], address)
  const tokenBalance = balances?.[0]

  const {
    totalCost: costWithRewardsFee,
    isLoading: isLoadingRewardsQuote,
    addedSurgeCost,
  } = useBuyTokenQuoteWithRewards(getEthAddress(tokenEmitter), tokenAmountBigInt, chainId)

  const { totalCost: rawCost } = useBuyTokenQuote(
    getEthAddress(tokenEmitter),
    tokenAmountBigInt,
    chainId,
  )

  const setTokenAmount = (value: string) => {
    _setTokenAmount(value)
    _setTokenAmountBigInt(BigInt(Math.trunc(Number(value) * 1e18) || "0"))
  }

  const { ethPrice } = useETHPrice()

  return (
    <div className="space-y-1 rounded-3xl bg-white p-1.5 dark:bg-black/90">
      <div className="relative flex flex-col">
        <ConversionBox label="Buy">
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
            <TokenBalanceAndUSDValue
              balance={tokenBalance}
              ethPrice={ethPrice || 0}
              ethAmount={rawCost - addedSurgeCost}
            />
          </div>
        </ConversionBox>

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <SwitchSwapBoxButton switchSwapBox={switchSwapBox} />
        </div>
        <div className="mb-1" />

        <EthConversionBox
          currencyDisplay={
            <SwitchEthChainButton
              selectedChain={selectedChain}
              switchChain={(chainId) => {
                setSelectedChain(chains.find(({ id }) => id === chainId) || chains[0])
                refetch()
              }}
            />
          }
          label="Pay"
          amount={costWithRewardsFee}
          isLoadingQuote={isLoadingRewardsQuote}
        >
          <TokenBalanceWithWarning
            balance={balance?.value || BigInt(0)}
            ethPrice={ethPrice || 0}
            rawCost={rawCost}
            addedSurgeCost={addedSurgeCost}
            costWithRewardsFee={costWithRewardsFee}
          />
        </EthConversionBox>
      </div>

      <BuyTokenButton
        className="w-full rounded-2xl py-7 text-lg font-medium tracking-wide"
        chainId={selectedChain.id}
        tokenEmitter={tokenEmitter}
        costWithRewardsFee={costWithRewardsFee}
        tokenAmountBigInt={tokenAmountBigInt}
        isReady={!isLoadingRewardsQuote}
        onSuccess={(hash) => {
          refetch()
          onSuccess(hash)
        }}
      />
    </div>
  )
}

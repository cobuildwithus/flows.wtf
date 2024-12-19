"use client"

import { Button } from "@/components/ui/button"
import { getEthAddress } from "@/lib/utils"
import { Grant } from "@prisma/flows"
import { useState } from "react"
import { Address } from "viem"
import { BuyTokenBox } from "./buy-token-box"
import { SellTokenBox } from "./sell-token-box"

interface Props {
  flow: Grant
  defaultTokenAmount: bigint
  defaultSwapState?: SwapState
  onSuccess: (hash: string) => void
}

type SwapState = "buy" | "sell"

export function SwapTokenBox(props: Props) {
  const { flow, defaultTokenAmount, defaultSwapState = "buy", onSuccess } = props
  const [swapState, setSwapState] = useState<SwapState>(defaultSwapState)
  const [token, setToken] = useState(flow.erc20 as Address)
  const [tokenEmitter, setTokenEmitter] = useState(flow.tokenEmitter as Address)

  const parentFlowContract = getEthAddress(flow.isTopLevel ? flow.recipient : flow.parentContract)

  return (
    <div className="flex flex-col space-y-3">
      <div className="flex items-center justify-start space-x-2">
        <Button
          className="h-7 rounded-full px-5"
          onClick={() => setSwapState("buy")}
          variant={swapState === "buy" ? "default" : "outline"}
        >
          Buy
        </Button>
        <Button
          className="h-7 rounded-full px-5"
          onClick={() => setSwapState("sell")}
          variant={swapState === "sell" ? "default" : "outline"}
        >
          Sell
        </Button>
      </div>
      <div>
        {swapState === "buy" ? (
          <BuyTokenBox
            onSuccess={onSuccess}
            parentFlowContract={parentFlowContract}
            defaultTokenAmount={defaultTokenAmount}
            switchSwapBox={() => setSwapState("sell")}
            setTokenAndEmitter={(token, tokenEmitter) => {
              setToken(token)
              setTokenEmitter(tokenEmitter)
            }}
            token={token}
            tokenEmitter={tokenEmitter}
          />
        ) : (
          <SellTokenBox
            onSuccess={onSuccess}
            parentFlowContract={parentFlowContract}
            defaultTokenAmount={defaultTokenAmount}
            switchSwapBox={() => setSwapState("buy")}
            setTokenAndEmitter={(token, tokenEmitter) => {
              setToken(token)
              setTokenEmitter(tokenEmitter)
            }}
            token={token}
            tokenEmitter={tokenEmitter}
          />
        )}
      </div>
    </div>
  )
}

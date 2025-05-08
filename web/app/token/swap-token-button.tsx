"use client"

import type { ButtonProps } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { Grant } from "@prisma/flows"
import Link from "next/link"
import { useRef } from "react"
import { SwapTokenBox } from "./swap-token-box"
import { useAccount } from "wagmi"
import { useERC20Balances } from "@/lib/tcr/use-erc20-balances"
import { useRouter } from "next/navigation"
import { AuthButton } from "@/components/ui/auth-button"

interface Props {
  flow: Grant
  erc20Address: `0x${string}`
  defaultTokenAmount?: bigint
  extraInfo?: "curator" | "challenge"
  onSuccess?: (hash: string) => void
  size?: ButtonProps["size"]
  variant?: ButtonProps["variant"]
  text?: string
}

export function SwapTokenButton(props: Props) {
  const router = useRouter()
  const { address } = useAccount()
  const {
    flow,
    erc20Address,
    defaultTokenAmount = BigInt(1e18),
    size = "default",
    variant = "default",
    extraInfo,
  } = props
  const ref = useRef<HTMLButtonElement>(null)
  const isRemoved = flow.isRemoved

  const { balances, refetch } = useERC20Balances([erc20Address], address)
  const {
    onSuccess = () => {
      // close dialog
      refetch()
      router.refresh()
    },
  } = props

  const text =
    props.text || (balances?.[0] ? (!flow.isTopLevel ? "Buy TCR" : "Buy FLOWS") : "Become curator")

  return (
    <Dialog>
      <DialogTrigger asChild>
        <AuthButton size={size} variant={variant} type="button" ref={ref}>
          {text}
        </AuthButton>
      </DialogTrigger>
      <DialogContent className="sm:max-w-screen-xs px-3 py-8 md:p-6">
        <DialogHeader>
          <DialogTitle className="text-center text-lg font-medium">
            Buy & sell {flow.title} tokens
          </DialogTitle>
        </DialogHeader>
        {isRemoved ? (
          <RemovedFlowInfo flow={flow} />
        ) : (
          <ul className="my-4 space-y-6 text-sm">
            {extraInfo && (
              <li className="flex items-start space-x-4">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-white">
                  1
                </span>
                {extraInfo === "curator" && <CuratorInfo />}

                {extraInfo === "challenge" && (
                  <ChallengeInfo defaultTokenAmount={defaultTokenAmount} />
                )}
              </li>
            )}
            <PriceInfo extraInfo={extraInfo} flow={flow} />
          </ul>
        )}

        <SwapTokenBox onSuccess={onSuccess} flow={flow} defaultTokenAmount={defaultTokenAmount} />
      </DialogContent>
    </Dialog>
  )
}

const CuratorInfo = () => (
  <p>
    Buy TCR tokens to{" "}
    <Link href="/curate" className="text-primary underline transition-colors hover:text-primary/80">
      become a curator
    </Link>{" "}
    and earn a stream of USDC for verifying impact of grantees.
  </p>
)

const ChallengeInfo = ({ defaultTokenAmount }: { defaultTokenAmount: bigint }) => (
  <p>
    Buy {Number(defaultTokenAmount) / 1e18} TCR tokens to challenge a grant. If your challenge is
    successful, you will win the applicant&apos;s bond and be repaid your challenge fee.
  </p>
)

const PriceInfo = ({
  extraInfo,
  flow,
}: {
  extraInfo: "curator" | "challenge" | undefined
  flow: Grant
}) => (
  <li className="flex items-start space-x-4">
    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-white">
      {!extraInfo ? "1" : "2"}
    </span>
    <p>
      Prices change based on supply and demand according to an S shaped{" "}
      <a
        href="https://github.com/rocketman-21/flow-contracts/blob/main/src/token-issuance/BondingSCurve.sol"
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary underline transition-colors hover:text-primary/80"
      >
        bonding curve
      </a>
      . View a visualization{" "}
      <a
        href={
          flow.isTopLevel
            ? "https://www.desmos.com/calculator/qd8zchfxvu"
            : "https://www.desmos.com/calculator/hizmijfgno"
        }
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary underline transition-colors hover:text-primary/80"
      >
        here
      </a>
      .
    </p>
  </li>
)

const RemovedFlowInfo = ({ flow }: { flow: Grant }) => (
  <div className="my-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-700 dark:border-yellow-900/50 dark:bg-yellow-900/20">
    Warning: This flow has been removed.{" "}
    <a
      href={`https://basescan.org/address/${flow.tokenEmitter}`}
      target="_blank"
      rel="noopener noreferrer"
      className="underline hover:text-yellow-800"
    >
      Trading tokens
    </a>{" "}
    for this flow is not advised. You can sell your tokens below.
  </div>
)

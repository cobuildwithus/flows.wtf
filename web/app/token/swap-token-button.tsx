"use client"

import { Button, ButtonProps } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Grant } from "@prisma/flows"
import Link from "next/link"
import { useRef } from "react"
import { SwapTokenBox } from "./swap-token-box"
import { getEthAddress } from "@/lib/utils"
import { useAccount } from "wagmi"
import { useERC20Balances } from "@/lib/tcr/use-erc20-balances"
import { useLogin } from "@/lib/auth/use-login"
import { useRouter } from "next/navigation"

interface Props {
  flow: Grant
  defaultTokenAmount?: bigint
  extraInfo?: "curator" | "apply" | "challenge"
  onSuccess?: (hash: string) => void
  size?: ButtonProps["size"]
  variant?: ButtonProps["variant"]
  text?: string
}

export function SwapTokenButton(props: Props) {
  const router = useRouter()
  const {
    flow,
    defaultTokenAmount = BigInt(1e18),
    size = "default",
    variant = "default",
    extraInfo,
    onSuccess = () => {
      // close dialog
      router.refresh()
      ref.current?.click()
    },
  } = props
  const ref = useRef<HTMLButtonElement>(null)

  const { address, isConnected } = useAccount()
  const { login, connectWallet } = useLogin()
  const { balances } = useERC20Balances([getEthAddress(flow.erc20)], address)

  const text =
    props.text || (balances?.[0] ? (!flow.isTopLevel ? "Buy TCR" : "Buy FLOWS") : "Become curator")

  // if not connected, return login
  if (!isConnected) {
    return (
      <Button
        size={size}
        variant={variant}
        onClick={() => {
          login()
          connectWallet()
        }}
        type="button"
        ref={ref}
      >
        {text}
      </Button>
    )
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size={size} variant={variant} type="button" ref={ref}>
          {text}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-screen-xs px-3 py-8 md:p-6">
        <DialogHeader>
          <DialogTitle className="text-center text-lg font-medium">
            Buy and sell {flow.title} tokens
          </DialogTitle>
        </DialogHeader>
        <ul className="my-4 space-y-6 text-sm">
          {extraInfo && (
            <li className="flex items-start space-x-4">
              <>
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-white">
                  1
                </span>
                {extraInfo === "curator" && (
                  <p>
                    Buy TCR tokens to{" "}
                    <Link
                      href="/curate"
                      className="text-primary underline transition-colors hover:text-primary/80"
                    >
                      become a curator
                    </Link>{" "}
                    and earn a stream of USDC for verifying impact of grantees.
                  </p>
                )}
                {extraInfo === "apply" && (
                  <p>
                    Buy {Number(defaultTokenAmount) / 1e18} TCR tokens to pay your application fee.
                    If your grant is approved, you will get your application fee back.
                  </p>
                )}
                {extraInfo === "challenge" && (
                  <p>
                    Buy {Number(defaultTokenAmount) / 1e18} TCR tokens to challenge a grant. If your
                    challenge is successful, you will win the applicant&apos;s bond and be repaid
                    your challenge fee.
                  </p>
                )}
              </>
            </li>
          )}
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
        </ul>
        <SwapTokenBox onSuccess={onSuccess} flow={flow} defaultTokenAmount={defaultTokenAmount} />
      </DialogContent>
    </Dialog>
  )
}

"use client"

import { TcrTokenBalance } from "@/components/ui/tcr-token-balance"
import { getEthAddress, getIpfsUrl } from "@/lib/utils"
import { Grant, TokenHolder } from "@prisma/flows"
import Image from "next/image"
import Link from "next/link"
import { getAddress } from "viem"
import { WithdrawCuratorSalaryButton } from "../withdraw-curator-salary-button"

interface Props {
  flow: Pick<
    Grant,
    | "id"
    | "title"
    | "image"
    | "superToken"
    | "managerRewardSuperfluidPool"
    | "erc20"
    | "monthlyRewardPoolFlowRate"
    | "activeRecipientCount"
    | "awaitingRecipientCount"
    | "challengedRecipientCount"
    | "tokenEmitter"
  >
  closePopover: () => void
  ethPrice: number
  holderInfo: TokenHolder
}

export function TokenRow(props: Props) {
  const { flow, closePopover, ethPrice, holderInfo } = props

  return (
    <div className="grid grid-cols-4 items-center gap-2 border-t border-border py-2.5">
      <div className="col-span-2 flex items-center space-x-2 overflow-hidden">
        <Image
          src={getIpfsUrl(flow.image)}
          alt={flow.title}
          className="size-6 flex-shrink-0 rounded-full object-cover max-sm:hidden"
          width={24}
          height={24}
        />
        <Link
          href={`/flow/${flow.id}`}
          className="truncate text-sm hover:underline"
          onClick={closePopover}
        >
          {flow.title}
        </Link>
      </div>
      <TcrTokenBalance
        erc20={getAddress(flow.erc20)}
        className="text-center text-sm font-medium"
        tokenEmitter={getEthAddress(flow.tokenEmitter)}
        monthlyRewardPoolRate={flow.monthlyRewardPoolFlowRate}
        ethPrice={ethPrice || 0}
        holderInfo={holderInfo}
      />

      <div className="pr-2 text-right text-sm font-medium">
        <WithdrawCuratorSalaryButton pool={getEthAddress(flow.managerRewardSuperfluidPool)} />
      </div>
    </div>
  )
}

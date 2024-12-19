import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { ChevronDownIcon } from "@radix-ui/react-icons"
import { RelayChain } from "@reservoir0x/relay-sdk"
import { base, mainnet } from "viem/chains"
import { useAccount, useBalance } from "wagmi"
import { BaseEthLogo } from "./base-eth-logo"
import { CurrencyDisplay } from "./currency-display"
import { TokenBalance } from "./token-balance"
import { TokenLogo } from "./token-logo"

export const SwitchEthChainButton = ({
  switchChain,
  selectedChain,
}: {
  switchChain: (chainId: number) => void
  selectedChain: RelayChain
}) => {
  const { address } = useAccount()

  const { data: baseEthBalance } = useBalance({
    chainId: base.id,
    address,
  })
  const { data: ethBalance } = useBalance({
    chainId: mainnet.id,
    address,
  })

  const isBase = selectedChain.id === base.id

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex-shrink-0">
          <CurrencyDisplay
            className={cn("cursor-pointer py-0.5", {
              "py-0": isBase,
              "py-1": !isBase,
            })}
          >
            <div className={cn({ "pr-0": isBase, "pr-1.5": !isBase })}>
              {selectedChain.id === base.id ? (
                <BaseEthLogo />
              ) : (
                <TokenLogo src="/eth.png" alt="ETH" />
              )}
            </div>

            <span className="pr-1">ETH</span>
            <ChevronDownIcon className="mt-0.5 h-4 w-auto pr-1 text-black dark:text-white" />
          </CurrencyDisplay>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top">
        <ChainMenuItem
          onClick={() => switchChain(mainnet.id)}
          logoChild={<TokenLogo className="mr-4" size={30} src="/eth.png" alt="ETH" />}
          chainName="Ethereum"
          balance={ethBalance?.value || BigInt(0)}
        />
        <ChainMenuItem
          onClick={() => switchChain(base.id)}
          logoChild={<BaseEthLogo className="mr-2" size={30} />}
          chainName="Base"
          balance={baseEthBalance?.value || BigInt(0)}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

interface ChainMenuItemProps {
  logoChild: React.ReactNode
  chainName: string
  balance: bigint
  onClick: () => void
}

const ChainMenuItem: React.FC<ChainMenuItemProps> = ({
  logoChild,
  chainName,
  balance,
  onClick,
}) => (
  <DropdownMenuItem asChild onClick={onClick}>
    <div className="flex cursor-pointer items-center px-4 py-3">
      {logoChild}
      <div className="flex flex-col">
        <span className="font-medium">{chainName}</span>
        <TokenBalance balance={balance} />
      </div>
    </div>
  </DropdownMenuItem>
)

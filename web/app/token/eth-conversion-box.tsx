import { cn } from "@/lib/utils"
import { CurrencyInput } from "./currency-input"
import { CurrencyDisplay } from "./currency-display"
import { BaseEthLogo } from "./base-eth-logo"
import { formatEther } from "viem"
import { ConversionBox } from "./conversion-box"

interface EthConversionBoxProps {
  label: string
  amount: bigint
  isLoadingQuote: boolean
  className?: string
  children?: React.ReactNode
  currencyDisplay: React.ReactNode
}

export function EthConversionBox({
  label,
  amount,
  isLoadingQuote,
  className,
  children,
  currencyDisplay,
}: EthConversionBoxProps) {
  return (
    <ConversionBox label={label}>
      <div className={cn("flex flex-col space-y-3", className)}>
        <div className="flex items-center justify-between">
          <CurrencyInput
            id={label.toLowerCase()}
            name={label.toLowerCase()}
            value={Number(formatEther(amount)).toFixed(12)}
            disabled
            className={cn("disabled:text-black dark:disabled:text-white", {
              "opacity-50": isLoadingQuote,
              "opacity-100": !isLoadingQuote,
            })}
          />
          {currencyDisplay}
        </div>
        {children}
      </div>
    </ConversionBox>
  )
}

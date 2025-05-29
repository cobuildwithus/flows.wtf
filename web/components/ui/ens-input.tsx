"use client"

import { Input } from "@/components/ui/input"
import { useEnsResolution } from "@/lib/hooks/use-ens-resolution"
import { explorerUrl } from "@/lib/utils"
import { cn } from "@/lib/utils"

interface Props extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
  value?: string
  onChange?: (value: string) => void
  onResolvedAddressChange?: (address: string | null) => void
  chainId?: number
  helperText?: string
  errorClassName?: string
}

export function EnsInput({
  value: controlledValue,
  onChange,
  onResolvedAddressChange,
  chainId = 1,
  helperText,
  className,
  errorClassName,
  placeholder = "vitalik.eth",
  ...inputProps
}: Props) {
  const ens = useEnsResolution(controlledValue)

  // Handle controlled/uncontrolled component pattern
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    ens.handleInputChange(newValue)
    onChange?.(newValue)
  }

  // Notify parent when resolved address changes
  if (onResolvedAddressChange && ens.resolvedAddress !== null) {
    onResolvedAddressChange(ens.resolvedAddress)
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <Input
          value={controlledValue !== undefined ? controlledValue : ens.inputValue}
          onChange={handleChange}
          placeholder={placeholder}
          className={cn(ens.resolvedAddress && !ens.isResolving ? "pr-32" : "", className)}
          {...inputProps}
        />
        {ens.resolvedAddress && !ens.isResolving && (
          <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
            <a
              href={explorerUrl(ens.resolvedAddress, chainId, "address")}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
              onClick={(e) => e.stopPropagation()}
            >
              {ens.resolvedAddress.slice(0, 4)}...{ens.resolvedAddress.slice(-3)}
            </a>
          </div>
        )}
        {ens.isResolving && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
          </div>
        )}
      </div>
      {ens.error && <p className={cn("text-xs text-destructive", errorClassName)}>{ens.error}</p>}
      {helperText && !ens.error && <p className="text-xs text-muted-foreground">{helperText}</p>}
    </div>
  )
}

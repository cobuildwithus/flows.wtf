"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { MinusIcon, PlusIcon } from "lucide-react"
import { useState, useEffect } from "react"

const MIN_MONTHS = 1
const MAX_MONTHS = 24

interface Props {
  donationAmount: string
  tokenSymbol: string
  tokenDecimals: number
  months: number
  onMonthsChange: (months: number) => void
}

export function StreamingDurationSelector({
  donationAmount,
  tokenSymbol,
  tokenDecimals,
  months,
  onMonthsChange,
}: Props) {
  // Local state for input value to allow typing
  const [inputValue, setInputValue] = useState(months.toString())

  // Sync input value when months prop changes (from external sources like +/- buttons)
  useEffect(() => {
    setInputValue(months.toString())
  }, [months])
  // Calculate monthly amount with proper formatting
  const totalAmount = parseFloat(donationAmount) || 0
  const monthlyAmount = totalAmount > 0 ? totalAmount / months : 0

  // Format the monthly amount with appropriate decimal places
  const formatMonthlyAmount = (amount: number) => {
    if (amount === 0) return "0"

    // For very small amounts, show more decimals
    if (amount < 0.01) {
      return amount.toFixed(tokenDecimals > 6 ? 6 : tokenDecimals)
    }

    // For regular amounts, show 2-4 decimals
    const formatted = amount.toFixed(4)
    return parseFloat(formatted).toString() // Remove trailing zeros
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value

    // Handle empty input
    if (value === "") {
      setInputValue("")
      return
    }

    const numValue = parseInt(value)

    // If it's not a valid number, don't update
    if (isNaN(numValue)) {
      return
    }

    // Cap the value at min/max
    let finalValue = numValue
    if (numValue > MAX_MONTHS) {
      finalValue = MAX_MONTHS
    } else if (numValue < MIN_MONTHS && value.length > 1) {
      // Only enforce minimum if they've typed more than one digit
      // This allows typing "1" through "9"
      finalValue = MIN_MONTHS
    }

    setInputValue(finalValue.toString())
    onMonthsChange(finalValue)
  }

  const handleInputBlur = () => {
    // On blur, if the input is empty or invalid, reset to the current months value
    if (inputValue === "") {
      setInputValue(months.toString())
      return
    }

    const numValue = parseInt(inputValue)
    if (isNaN(numValue) || numValue < MIN_MONTHS || numValue > MAX_MONTHS) {
      setInputValue(months.toString())
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.currentTarget.blur()
    }
  }

  const handleIncrement = () => {
    if (months < MAX_MONTHS) onMonthsChange(months + 1)
  }

  const handleDecrement = () => {
    if (months > MIN_MONTHS) onMonthsChange(months - 1)
  }

  return (
    <div className="space-y-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-border/50 dark:bg-zinc-900/50">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Duration</label>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleDecrement}
            disabled={months <= MIN_MONTHS}
            className="h-8 w-8 p-0"
          >
            <MinusIcon className="h-3 w-3" />
          </Button>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min={MIN_MONTHS}
              max={MAX_MONTHS}
              value={inputValue}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              onKeyDown={handleKeyDown}
              className="h-8 w-16 text-center text-sm"
            />
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              month{months > 1 ? "s" : ""}
            </span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleIncrement}
            disabled={months >= MAX_MONTHS}
            className="h-8 w-8 p-0"
          >
            <PlusIcon className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {totalAmount > 0 && (
        <div className="mt-3 rounded-md bg-primary/5 p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-600 dark:text-zinc-400">Monthly funding</span>
            <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {formatMonthlyAmount(monthlyAmount)} {tokenSymbol}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

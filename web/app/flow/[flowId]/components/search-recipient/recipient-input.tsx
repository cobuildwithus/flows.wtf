import { Input } from "@/components/ui/input"
import { Circle } from "lucide-react"
import { forwardRef } from "react"
import {
  getRecipientStatus,
  getRecipientStatusColor,
  type ValidationState,
} from "@/lib/recipient/validation-utils"

interface Props {
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  disabled?: boolean
  validationState: ValidationState
  placeholder?: string
  autoFocus?: boolean
}

export const RecipientInput = forwardRef<HTMLInputElement, Props>(
  ({ value, onChange, disabled, validationState, placeholder, autoFocus }, ref) => {
    const status = getRecipientStatus(validationState)
    const showStatus =
      value === validationState.debouncedInput &&
      validationState.debouncedInput !== "" &&
      status !== null

    return (
      <div className="dark:hover-border-border relative rounded-lg border border-zinc-300 p-4 duration-300 focus-within:border-zinc-500 hover:border-zinc-500 dark:border-border/50 dark:focus-within:border-border">
        <div className="flex items-center">
          <Input
            ref={ref}
            type="text"
            value={value}
            onChange={onChange}
            disabled={disabled}
            placeholder={placeholder}
            className="h-auto flex-1 border-none bg-transparent p-0 pr-8 text-lg font-medium shadow-none placeholder:text-zinc-500 focus-visible:ring-0 dark:placeholder:text-zinc-400"
            autoComplete="off"
            data-1p-ignore="true"
            data-lpignore="true"
            autoFocus={autoFocus}
          />

          {/* Status Indicator */}
          {showStatus ? (
            <Circle
              className={`absolute right-4 h-2 w-2 fill-current ${getRecipientStatusColor(status)}`}
            />
          ) : null}
        </div>
      </div>
    )
  },
)

RecipientInput.displayName = "RecipientInput"

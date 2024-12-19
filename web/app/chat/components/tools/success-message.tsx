import { Check } from "lucide-react"

interface Props {
  message: string
}

export const SuccessMessageResult = (props: Props) => {
  const { message } = props

  if (typeof message !== "string" || message.length === 0) return null

  return (
    <div className="py-3">
      <div className="flex items-center gap-2 text-xs">
        <Check className="size-4 text-green-600 dark:text-green-500" />
        {message}
      </div>
    </div>
  )
}

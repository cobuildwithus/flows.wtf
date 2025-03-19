import { Button } from "@/components/ui/button"

interface Props {
  message: string
}

export const CastPreview = (props: Props) => {
  const { message } = props

  if (typeof message !== "string" || message.length === 0) return null

  return (
    <div className="py-3">
      <div className="mx-auto flex max-w-[75%] flex-col items-center gap-1.5">
        <p className="rounded-xl border bg-background p-5 text-sm">{message}</p>
        <Button>Publish on Farcaster</Button>
      </div>
    </div>
  )
}

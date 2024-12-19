import { Button } from "@/components/ui/button"
import Link from "next/link"

interface Props {
  draftId: number
}

export const SubmitApplicationResult = (props: Props) => {
  const { draftId } = props
  if (isNaN(draftId)) return null

  return (
    <Link href={`/draft/${draftId}`} className="py-3">
      <Button size="lg" variant="default" className="w-fit">
        View your application →
      </Button>
    </Link>
  )
}

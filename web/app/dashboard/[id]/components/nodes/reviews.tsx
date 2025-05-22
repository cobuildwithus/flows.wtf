import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import Image from "next/image"

interface Props {
  reviews: Array<{ url: string; image: string }>
}

export function Reviews(props: Props) {
  const { reviews } = props

  return (
    <ScrollArea className="pointer-events-auto w-full whitespace-nowrap">
      <div className="flex space-x-2.5">
        {reviews.map((review) => (
          <a
            key={review.url}
            className="shrink-0 transition-opacity hover:opacity-80"
            href={review.url}
            target="_blank"
          >
            <Image
              src={review.image}
              alt={review.url}
              className="aspect-[3/4] h-32 rounded-md object-cover"
              width={100}
              height={100}
            />
          </a>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}

import Image from "next/image"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

interface Props {
  products: Array<{ name: string; image: string; url: string }>
}

export function Products(props: Props) {
  const { products } = props

  return (
    <ScrollArea className="pointer-events-auto w-full whitespace-nowrap">
      <div className="flex space-x-2.5">
        {products.map((p) => (
          <a
            key={p.name}
            href={p.url}
            target="_blank"
            className="flex shrink-0 flex-col items-center transition-opacity hover:opacity-80"
          >
            <Image
              src={p.image}
              alt={p.name}
              width={80}
              height={80}
              className="aspect-square w-full rounded-md"
            />
          </a>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}

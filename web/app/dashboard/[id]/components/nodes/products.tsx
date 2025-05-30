import Image from "next/image"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Startup } from "@/lib/onchain-startup/startup"

interface Props {
  products: Array<{ name: string; image: string; url: string }>
  startup: Startup
}

export function Products(props: Props) {
  const { products, startup } = props

  return (
    <div className="pointer-events-auto flex flex-col gap-3">
      <ScrollArea className="w-full whitespace-nowrap">
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

      <Button variant="default" size="lg" asChild>
        <a href={`https://${startup.shopify.url}`} target="_blank" rel="noopener noreferrer">
          Shop
        </a>
      </Button>
    </div>
  )
}

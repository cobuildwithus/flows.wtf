import Image from "next/image"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Startup } from "@/lib/onchain-startup/startup"
import { useRevnetTokenPrice } from "@/lib/revnet/hooks/use-revnet-token-price"
import { useRevnetTokenDetails } from "@/lib/revnet/hooks/use-revnet-token-details"
import { base } from "viem/chains"
import { useState } from "react"
import { Minus, Plus } from "lucide-react"

interface Props {
  products: Array<{ name: string; image: string; url: string }>
  startup: Startup
}

export function Products(props: Props) {
  const { products, startup } = props
  const [quantity, setQuantity] = useState(1)
  const projectId = startup.revnetProjectId
  const { calculateTokensFromEth } = useRevnetTokenPrice(BigInt(projectId), base.id)
  const { data: tokenDetails } = useRevnetTokenDetails(BigInt(projectId), base.id)

  const tokenSymbol = tokenDetails?.symbol || ""
  const ethAmount = (quantity * 0.001).toFixed(3)
  const tokenAmount = calculateTokensFromEth(ethAmount)

  const handleIncrement = () => setQuantity((prev) => prev + 1)
  const handleDecrement = () => setQuantity((prev) => Math.max(1, prev - 1))

  return (
    <div className="pointer-events-auto flex flex-col gap-1">
      <div className="relative flex flex-col">
        {/* Products section */}
        <div className="rounded-lg bg-muted/30 p-2">
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

          <div className="my-2.5 border-t border-muted-foreground/20" />

          <div className="px-1.5">
            <div className="flex h-10 items-center justify-between border-0 p-0 text-sm">
              <div className="flex items-center gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleDecrement}
                  disabled={quantity <= 1}
                  className="h-8 w-8"
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="mx-1 min-w-[1.5rem] text-center">{quantity}</span>
                <Button size="icon" variant="ghost" onClick={handleIncrement} className="h-8 w-8">
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              <div className="flex items-center gap-1">
                <span>{tokenAmount}</span>
                <span className="ml-3 rounded-md bg-background px-3 py-1.5 text-sm font-medium">
                  {tokenSymbol || "TOKEN"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Receive section */}
      </div>

      <Button variant="outline" size="lg" asChild>
        <a href={`https://${startup.shopify.url}`} target="_blank" rel="noopener noreferrer">
          Shop
        </a>
      </Button>
    </div>
  )
}

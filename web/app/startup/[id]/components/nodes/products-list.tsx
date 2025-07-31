import Image from "next/image"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Startup } from "@/lib/onchain-startup/startup"
import { useRevnetTokenPrice } from "@/lib/revnet/hooks/use-revnet-token-price"
import { useRevnetTokenDetails } from "@/lib/revnet/hooks/use-revnet-token-details"
import { useEffect, useState } from "react"
import { Minus, Plus } from "lucide-react"
import { StoreConfig } from "@/lib/shopify/stores"

interface Props {
  changeProductsVolumeEth: (eth: number) => void
  products: Array<{ name: string; image: string; url: string }>
  startup: Startup
  shopify: StoreConfig
  chainId: number
  revnetProjectId: number
}

export function ProductsList(props: Props) {
  const { changeProductsVolumeEth, products, startup, chainId, shopify, revnetProjectId } = props
  const [quantity, setQuantity] = useState("1")
  const [touched, setTouched] = useState(false)
  const { calculateTokensFromEth } = useRevnetTokenPrice(
    revnetProjectId,
    chainId,
    startup.isBackedByFlows,
  )
  const { data: tokenDetails } = useRevnetTokenDetails(revnetProjectId, chainId)

  const tokenSymbol = tokenDetails?.symbol || ""
  const quantityNum = quantity === "" ? 0 : parseInt(quantity)
  const ethAmount = (quantityNum * 0.001).toFixed(3)
  const tokenAmount = calculateTokensFromEth(ethAmount)

  useEffect(() => {
    const timer = setTimeout(() => {
      if (touched) {
        changeProductsVolumeEth(parseFloat(ethAmount))
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [ethAmount, touched])

  const handleIncrement = () => {
    const currentNum = quantity === "" ? 0 : parseInt(quantity)
    setQuantity((currentNum + 1).toString())
    setTouched(true)
  }

  const handleDecrement = () => {
    const currentNum = quantity === "" ? 0 : parseInt(quantity)
    setQuantity(Math.max(1, currentNum - 1).toString())
    setTouched(true)
  }

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTouched(true)
    const value = e.target.value
    if (value === "") {
      setQuantity("")
    } else {
      const numValue = parseInt(value)
      if (!isNaN(numValue) && numValue >= 1) {
        setQuantity(value)
      }
    }
  }

  return (
    <div className="pointer-events-auto flex flex-col gap-1">
      <div className="relative flex flex-col">
        {/* Products section */}
        <div className="rounded-lg bg-muted/30 p-2">
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex space-x-2.5">
              {products.map((p, index) => (
                <a
                  key={p.name}
                  href={p.url}
                  target="_blank"
                  className="relative flex shrink-0 flex-col items-center transition-opacity hover:opacity-80"
                >
                  <Image
                    src={p.image}
                    alt={p.name}
                    width={80}
                    height={80}
                    className="aspect-square w-full rounded-md"
                  />
                  {quantityNum > 0 &&
                    (() => {
                      const productQuantity = calculateProductQuantity(
                        quantityNum,
                        products.length,
                        index,
                      )
                      return productQuantity > 0 ? (
                        <div className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary/40 text-[10px] font-medium text-primary-foreground">
                          {productQuantity}
                        </div>
                      ) : null
                    })()}
                </a>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>

          <div className="my-2.5 border-t border-muted-foreground/20" />

          <div className="px-1.5">
            <div className="flex h-10 items-center justify-between border-0 p-0 text-sm">
              <div className="flex items-center">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleDecrement}
                  disabled={quantityNum <= 1}
                  className="h-8 w-8"
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <Input
                  type="number"
                  onFocus={() => setTouched(true)}
                  value={quantity}
                  onChange={handleQuantityChange}
                  className="mx-1 h-8 w-12 border-0 bg-transparent p-0 text-center text-sm shadow-none focus-visible:ring-0"
                  min="1"
                  placeholder="0"
                />
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
        <a href={`https://${shopify.url}`} target="_blank" rel="noopener noreferrer">
          Shop
        </a>
      </Button>
    </div>
  )
}
// Helper function to calculate product quantities
// First product gets 70% of total, rest split evenly
function calculateProductQuantity(
  totalQuantity: number,
  productCount: number,
  productIndex: number,
): number {
  if (productCount === 0 || totalQuantity === 0) return 0

  if (productIndex === 0) {
    // First product gets 60% (rounded up)
    return Math.ceil(totalQuantity * 0.6)
  }

  // Remaining products split the other 40%
  const remainingQuantity = totalQuantity - Math.ceil(totalQuantity * 0.6)
  const remainingProducts = productCount - 1

  if (remainingProducts === 0) return 0

  const baseQuantity = Math.floor(remainingQuantity / remainingProducts)
  const remainder = remainingQuantity % remainingProducts

  // Distribute remainder to products after the first one
  const adjustedIndex = productIndex - 1
  return baseQuantity + (adjustedIndex < remainder ? 1 : 0)
}

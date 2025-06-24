import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Product } from "@/lib/shopify/products"
import Image from "next/image"

interface Props {
  products: Product[]
}

export async function ProductsTable(props: Props) {
  const { products } = props

  return (
    <Card className="border border-border/40 bg-card/80 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Products</CardTitle>
            <CardDescription className="mt-1.5 text-xs">Currently available</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="py-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Sales</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="truncate p-0">
                  <a
                    href={product.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 pl-0 transition-colors"
                  >
                    <Image
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      width={40}
                      height={40}
                      className="rounded-md object-cover max-sm:size-8"
                    />
                    <div className="flex flex-col gap-1">
                      <h3 className="line-clamp-1 truncate text-xs font-medium leading-tight sm:text-sm">
                        {product.name}
                      </h3>
                      <p className="text-[10px] leading-tight text-muted-foreground">
                        {product.stock} in stock
                      </p>
                    </div>
                  </a>
                </TableCell>
                <TableCell className="text-xs">{product.price}</TableCell>
                <TableCell className="text-xs">
                  <div className="flex flex-col gap-1">
                    <span className="font-medium leading-tight">{product.totalSales}</span>
                    <span className="text-[10px] leading-tight text-muted-foreground">
                      {product.orders} orders
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button asChild size="xs" className="bg-green-600 text-white hover:bg-green-700">
                    <a href={product.url} target="_blank" rel="noopener noreferrer">
                      Order
                    </a>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

import { Badge } from "@/components/ui/badge"
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
            <CardDescription className="mt-1.5 text-xs">
              Currently available items in the store
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Image</TableHead>
              <TableHead>Name</TableHead>
              {/* <TableHead>Launch Date</TableHead> */}
              <TableHead>Stock</TableHead>

              <TableHead>Price</TableHead>
              {/* <TableHead>Orders</TableHead> */}
              <TableHead className="text-right">Total Sales</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    width={40}
                    height={40}
                    className="rounded-md object-cover"
                  />
                </TableCell>
                <TableCell>
                  <h3 className="text-sm font-medium">
                    <a
                      href={product.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      {product.name}
                    </a>
                  </h3>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={product.stock > 50 ? "success" : "warning"}
                    className="text-[10px]"
                  >
                    {product.stock} in stock
                  </Badge>
                </TableCell>
                {/* <TableCell className="text-xs">
                  <DateTime date={new Date(product.launchDate)} relative />
                </TableCell> */}
                <TableCell className="text-xs">{product.price}</TableCell>
                {/* <TableCell className="text-xs">{product.orders}</TableCell> */}
                <TableCell className="text-right text-xs font-medium">
                  {product.totalSales}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

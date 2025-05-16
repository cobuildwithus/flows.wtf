import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { DateTime } from "@/components/ui/date-time"

export const products = [
  {
    id: 1,
    name: "Vrbs Coffee v1",
    image: "https://vrbscoffee.com/cdn/shop/files/2.png",
    category: "Whole Bean",
    price: "$24.99",
    totalSales: "$12,495.00",
    orders: 500,
    stock: 124,
    launchDate: "2024-01-15",
    url: "https://vrbscoffee.com/products/vrbs-coffee-release-001",
  },
  {
    id: 2,
    name: "RUN Coffee",
    image: "https://vrbscoffee.com/cdn/shop/files/RUNPhotos.png",
    category: "Ground",
    price: "$19.99",
    totalSales: "$9,995.00",
    orders: 450,
    stock: 89,
    launchDate: "2024-02-01",
    url: "https://vrbscoffee.com/products/vrbs-coffee-release-001",
  },
  {
    id: 3,
    name: "CoinCoffee",
    image: "https://vrbscoffee.com/cdn/shop/files/RUNPhotos.png",
    category: "Whole Bean",
    price: "$29.99",
    totalSales: "$8,997.00",
    orders: 300,
    stock: 56,
    launchDate: "2024-02-15",
    url: "https://vrbscoffee.com/products/vrbs-coffee-release-001",
  },
  {
    id: 4,
    name: "Espresso Blend",
    image: "https://vrbscoffee.com/cdn/shop/files/RUNPhotos.png",
    category: "Ground",
    price: "$22.99",
    totalSales: "$6,897.00",
    orders: 280,
    stock: 42,
    launchDate: "2024-03-01",
    url: "https://vrbscoffee.com/products/vrbs-coffee-release-001",
  },
  {
    id: 5,
    name: "Decaf Delight",
    image: "https://vrbscoffee.com/cdn/shop/files/RUNPhotos.png",
    category: "Whole Bean",
    price: "$21.99",
    totalSales: "$4,398.00",
    orders: 200,
    stock: 78,
    launchDate: "2024-03-15",
    url: "https://vrbscoffee.com/products/vrbs-coffee-release-001",
  },
  {
    id: 6,
    name: "Morning Brew",
    image: "https://vrbscoffee.com/cdn/shop/files/RUNPhotos.png",
    category: "Ground",
    price: "$18.99",
    totalSales: "$3,798.00",
    orders: 180,
    stock: 103,
    launchDate: "2024-04-01",
    url: "https://vrbscoffee.com/products/vrbs-coffee-release-001",
  },
]

export function ProductsTable() {
  return (
    <Card className="border border-border/40 bg-card/80 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Products</CardTitle>
            <CardDescription className="mt-1.5 text-xs">
              Available items in the store
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
              <TableHead>Launch Date</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Orders</TableHead>
              <TableHead>Total Sales</TableHead>
              <TableHead>Stock</TableHead>
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
                  <h3 className="text-sm font-medium">{product.name}</h3>
                  <span className="mt-1.5 text-xs text-muted-foreground">{product.category}</span>
                </TableCell>
                <TableCell className="text-xs">
                  <DateTime date={new Date(product.launchDate)} relative />
                </TableCell>
                <TableCell className="text-xs">{product.price}</TableCell>
                <TableCell className="text-xs">{product.orders}</TableCell>
                <TableCell className="text-xs font-medium">{product.totalSales}</TableCell>
                <TableCell>
                  <Badge
                    variant={product.stock > 50 ? "success" : "warning"}
                    className="text-[10px]"
                  >
                    {product.stock} in stock
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

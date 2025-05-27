"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Currency } from "@/components/ui/currency"
import { DateTime } from "@/components/ui/date-time"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  getPaginationRange,
} from "@/components/ui/pagination"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Order } from "@/lib/shopify/orders"
import { Product } from "@/lib/shopify/products"
import { ChevronDown } from "lucide-react"
import Image from "next/image"
import { useState } from "react"

interface Props {
  orders: Order[]
  products: Product[]
}

const ORDERS_PER_PAGE = 10

export function OrdersTable(props: Props) {
  const { orders, products } = props

  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  const images: Record<string, string> = {}
  products.forEach((product) => {
    const id = product.id.replace("gid://shopify/Product/", "")
    images[id] = product.image
  })

  const totalPages = Math.ceil(orders.length / ORDERS_PER_PAGE)
  const paginatedOrders = orders.slice((page - 1) * ORDERS_PER_PAGE, page * ORDERS_PER_PAGE)

  function goToPage(newPage: number) {
    if (newPage < 1 || newPage > totalPages) return
    setPage(newPage)
  }

  const range = getPaginationRange(page, totalPages)

  return (
    <Card className="border border-border/40 bg-card/80 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Orders</CardTitle>
            <CardDescription className="mt-1.5 text-xs">All sales from the store</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Products</TableHead>
              <TableHead className="hidden md:table-cell">Country</TableHead>
              <TableHead className="w-24">Payment Status</TableHead>
              <TableHead className="text-right">Total Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="text-xs">
                  <DateTime
                    date={new Date(order.date)}
                    options={{
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    }}
                  />
                </TableCell>

                <TableCell>
                  <Popover
                    open={openPopoverId === order.id}
                    onOpenChange={(open) => setOpenPopoverId(open ? order.id : null)}
                  >
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 text-xs">
                        {order.itemsCount} {order.itemsCount === 1 ? "item" : "items"}
                        <ChevronDown className="ml-1 size-3" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-0">
                      <div className="flex items-center gap-2 border-b p-3">
                        <span className="text-xs font-medium">Products</span>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {order.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center border-b px-4 py-3 last:border-b-0"
                          >
                            <div className="mr-3 flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded bg-muted">
                              <Image
                                src={images[item.productId ?? ""] || "/placeholder.svg"}
                                alt={item.name}
                                width={40}
                                height={40}
                                className="rounded object-cover"
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-xs font-medium">{item.name}</div>
                              <div>
                                <Badge variant="secondary" className="mt-1 text-[10px]">
                                  {item.type}
                                </Badge>
                              </div>
                            </div>
                            <div className="ml-2 text-xs font-medium text-muted-foreground">
                              x {item.quantity}
                            </div>
                          </div>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </TableCell>
                <TableCell className="hidden text-xs md:table-cell">{order.country}</TableCell>

                <TableCell>
                  <Badge
                    variant={
                      order.paymentStatus === "Paid"
                        ? "success"
                        : order.paymentStatus === "Refunded"
                          ? "destructive"
                          : "outline"
                    }
                    className="text-[10px]"
                  >
                    {order.paymentStatus}
                  </Badge>
                </TableCell>
                <TableCell className="text-right text-xs font-medium">
                  <Currency>{order.amount}</Currency>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Pagination className="mt-6 justify-end">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  goToPage(page - 1)
                }}
                aria-disabled={page === 1}
              />
            </PaginationItem>
            {range.map((item, idx) => {
              if (item === "left-ellipsis" || item === "right-ellipsis") {
                return (
                  <PaginationItem key={item + idx}>
                    <PaginationEllipsis />
                  </PaginationItem>
                )
              }
              return (
                <PaginationItem key={item}>
                  <PaginationLink
                    href="#"
                    isActive={page === item}
                    onClick={(e) => {
                      e.preventDefault()
                      goToPage(item as number)
                    }}
                  >
                    {item}
                  </PaginationLink>
                </PaginationItem>
              )
            })}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  goToPage(page + 1)
                }}
                aria-disabled={page === totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </CardContent>
    </Card>
  )
}

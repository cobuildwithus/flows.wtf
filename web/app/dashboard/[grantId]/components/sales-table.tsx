"use client"
import { useState } from "react"
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
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import Image from "next/image"
import { DateTime } from "@/components/ui/date-time"

interface SaleItem {
  name: string
  type: string
  quantity: number
}

interface Sale {
  id: string
  date: string // ISO string with time
  amount: string
  paymentStatus: "Paid" | "Unpaid" | "Refunded"
  deliveryStatus: "Delivered" | "Processing" | "Shipped"
  items: SaleItem[]
  country: string
}

const productImages: Record<string, string> = {
  "Vrbs Coffee v1": "https://vrbscoffee.com/cdn/shop/files/2.png",
  "RUN Coffee": "https://vrbscoffee.com/cdn/shop/files/RUNPhotos.png",
}

const salesData: Sale[] = [
  {
    id: "INV001",
    date: "2023-05-04T14:23:00",
    amount: "$250.00",
    paymentStatus: "Paid",
    deliveryStatus: "Delivered",
    items: [
      { name: "Vrbs Coffee v1", type: "Whole Bean", quantity: 1 },
      { name: "RUN Coffee", type: "Ground", quantity: 1 },
    ],
    country: "United States",
  },
  {
    id: "INV002",
    date: "2023-05-03T09:10:00",
    amount: "$150.00",
    paymentStatus: "Paid",
    deliveryStatus: "Processing",
    items: [{ name: "Vrbs Coffee v1", type: "Ground", quantity: 2 }],
    country: "Canada",
  },
  {
    id: "INV003",
    date: "2023-05-02T16:45:00",
    amount: "$350.00",
    paymentStatus: "Paid",
    deliveryStatus: "Delivered",
    items: [
      { name: "Vrbs Coffee v1", type: "Whole Bean", quantity: 1 },
      { name: "RUN Coffee", type: "Ground", quantity: 2 },
    ],
    country: "United Kingdom",
  },
  {
    id: "INV004",
    date: "2023-05-01T11:30:00",
    amount: "$450.00",
    paymentStatus: "Paid",
    deliveryStatus: "Delivered",
    items: [
      { name: "Vrbs Coffee v1", type: "Whole Bean", quantity: 3 },
      { name: "RUN Coffee", type: "Ground", quantity: 1 },
    ],
    country: "Australia",
  },
  {
    id: "INV005",
    date: "2023-04-30T18:05:00",
    amount: "$550.00",
    paymentStatus: "Refunded",
    deliveryStatus: "Processing",
    items: [{ name: "RUN Coffee", type: "Whole Bean", quantity: 4 }],
    country: "Germany",
  },
  {
    id: "INV006",
    date: "2023-04-29T08:50:00",
    amount: "$120.00",
    paymentStatus: "Paid",
    deliveryStatus: "Delivered",
    items: [{ name: "Vrbs Coffee v1", type: "Ground", quantity: 2 }],
    country: "France",
  },
  {
    id: "INV007",
    date: "2023-04-28T13:15:00",
    amount: "$180.00",
    paymentStatus: "Paid",
    deliveryStatus: "Processing",
    items: [{ name: "Vrbs Coffee v1", type: "Whole Bean", quantity: 3 }],
    country: "Italy",
  },
  {
    id: "INV008",
    date: "2023-04-27T17:40:00",
    amount: "$320.00",
    paymentStatus: "Paid",
    deliveryStatus: "Delivered",
    items: [
      { name: "Vrbs Coffee v1", type: "Ground", quantity: 2 },
      { name: "RUN Coffee", type: "Whole Bean", quantity: 1 },
    ],
    country: "Spain",
  },
  {
    id: "INV009",
    date: "2023-04-26T10:05:00",
    amount: "$90.00",
    paymentStatus: "Paid",
    deliveryStatus: "Delivered",
    items: [{ name: "RUN Coffee", type: "Ground", quantity: 1 }],
    country: "Japan",
  },
  {
    id: "INV010",
    date: "2023-04-25T15:55:00",
    amount: "$410.00",
    paymentStatus: "Paid",
    deliveryStatus: "Delivered",
    items: [
      { name: "Vrbs Coffee v1", type: "Whole Bean", quantity: 2 },
      { name: "RUN Coffee", type: "Ground", quantity: 3 },
    ],
    country: "South Korea",
  },
]

export function SalesTable() {
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null)

  return (
    <Card className="border border-border/40 bg-card/80 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Orders</CardTitle>
            <CardDescription className="mt-1.5 text-xs">
              All sales from the Vrbs Coffee store
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead className="hidden md:table-cell">Country</TableHead>
              <TableHead>Payment Status</TableHead>
              <TableHead>Delivery Status</TableHead>
              <TableHead>Items</TableHead>
              <TableHead className="text-right">Total Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {salesData.map((sale) => (
              <TableRow key={sale.id}>
                <TableCell className="text-xs">
                  <DateTime
                    date={new Date(sale.date)}
                    options={{
                      month: "numeric",
                      day: "numeric",
                      year: "numeric",
                      hour: "numeric",
                      minute: "numeric",
                      hour12: true,
                    }}
                  />
                </TableCell>
                <TableCell className="hidden text-xs md:table-cell">{sale.country}</TableCell>

                <TableCell>
                  <Badge
                    variant={
                      sale.paymentStatus === "Paid"
                        ? "default"
                        : sale.paymentStatus === "Refunded"
                          ? "destructive"
                          : "outline"
                    }
                    className="text-[10px]"
                  >
                    {sale.paymentStatus}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={sale.deliveryStatus === "Delivered" ? "default" : "outline"}
                    className="text-[10px]"
                  >
                    {sale.deliveryStatus}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Popover
                    open={openPopoverId === sale.id}
                    onOpenChange={(open) => setOpenPopoverId(open ? sale.id : null)}
                  >
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 text-xs">
                        {sale.items.length} {sale.items.length === 1 ? "item" : "items"}
                        <ChevronDown className="ml-1 h-3 w-3" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-0">
                      <div className="flex items-center gap-2 border-b p-3">
                        <span className="text-xs font-medium">Products</span>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {sale.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center border-b px-4 py-3 last:border-b-0"
                          >
                            <div className="mr-3 flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded bg-muted">
                              <Image
                                src={productImages[item.name]}
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
                <TableCell className="text-right text-xs font-medium">{sale.amount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex items-center justify-end space-x-2 px-4 py-4">
          <Button variant="outline" size="sm" className="h-7 w-7 p-0">
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous page</span>
          </Button>
          <div className="text-xs">
            Page <span className="font-medium">1</span> of <span className="font-medium">10</span>
          </div>
          <Button variant="outline" size="sm" className="h-7 w-7 p-0">
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next page</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

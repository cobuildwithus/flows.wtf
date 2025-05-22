import { unstable_cache } from "next/cache"
import { queryShopify } from "./client"
import { Store } from "./stores"

export interface Order {
  id: string
  date: string
  amount: string
  paymentStatus: "Paid" | "Unpaid" | "Refunded"
  items: {
    name: string
    type: string
    quantity: number
    productId: string | null
    price: string
  }[]
  itemsCount: number
  country: string
}

async function _getAllOrders(store: Store): Promise<Order[]> {
  let hasNext = true
  let cursor: string | null = null
  const orders: Order[] = []

  type OrdersPage = {
    orders: {
      pageInfo: { hasNextPage: boolean; endCursor: string | null }
      edges: Array<{
        node: {
          id: string
          name: string
          createdAt: string
          totalPriceSet: { presentmentMoney: { amount: string } }
          displayFinancialStatus: string
          lineItems: {
            edges: Array<{
              node: {
                title: string
                variantTitle: string | null
                quantity: number
                product: { id: string | null } | null
                originalTotalSet: { shopMoney: { amount: string } }
              }
            }>
          }
          shippingAddress: { country: string } | null
        }
      }>
    }
  }

  while (hasNext) {
    const data: OrdersPage = await queryShopify<OrdersPage>(
      store,
      `
        query ($first: Int!, $after: String, $q: String!) {
          orders(first: $first, after: $after, query: $q, sortKey: CREATED_AT, reverse: true) {
            pageInfo {
              hasNextPage
              endCursor
            }
            edges {
              node {
                id
                name
                createdAt
                totalPriceSet {
                  presentmentMoney {
                    amount
                  }
                }
                displayFinancialStatus
                lineItems(first: 250) {
                  edges {
                    node {
                      title
                      variantTitle
                      quantity
                      product {
                        id
                      }
                      originalTotalSet {
                        shopMoney {
                          amount
                        }
                      }
                    }
                  }
                }
                shippingAddress {
                  country
                }
              }
            }
          }
        }
      `,
      { variables: { first: 250, after: cursor, q: `financial_status:paid` } },
    )

    data.orders.edges.forEach((edge) => {
      const o = edge.node
      orders.push({
        id: o.name,
        date: o.createdAt,
        amount: o.totalPriceSet.presentmentMoney.amount,
        paymentStatus:
          o.displayFinancialStatus === "PAID"
            ? "Paid"
            : o.displayFinancialStatus === "REFUNDED"
              ? "Refunded"
              : "Unpaid",
        items: o.lineItems.edges.map((i) => ({
          name: i.node.title,
          type: i.node.variantTitle ?? "N/A",
          quantity: i.node.quantity,
          productId: i.node.product?.id
            ? i.node.product.id.replace("gid://shopify/Product/", "")
            : null,
          price: i.node.originalTotalSet.shopMoney.amount,
        })),
        itemsCount: o.lineItems.edges.reduce((acc, i) => acc + i.node.quantity, 0),
        country: o.shippingAddress?.country ?? "—",
      })
    })

    hasNext = data.orders.pageInfo.hasNextPage
    cursor = data.orders.pageInfo.endCursor
  }

  return orders.filter((o) => Number(o.amount) > 0)
}

export const getAllOrders = unstable_cache(_getAllOrders, ["shopify", "all-orders"], {
  revalidate: 600,
})

import { unstable_cache } from "next/cache"
import { queryShopify } from "./client"
import type { Order } from "./orders"
import { Store } from "./stores"

export interface Product {
  id: string
  name: string
  image: string
  category: string
  price: string
  totalSales: string
  orders: number
  stock: number
  launchDate: string
  url: string
}

export const getProducts = unstable_cache(
  async (store: Store, orders: Order[]): Promise<Product[]> => {
    const data = await queryShopify<{
      products: {
        nodes: Array<{
          id: string
          title: string
          handle: string
          productType: string
          publishedAt: string
          images: { edges: Array<{ node: { src: string } }> }
          variants: { edges: Array<{ node: { price: string; inventoryQuantity: number } }> }
          status: string
        }>
      }
    }>(
      store,
      `
        {
          products(first: 250, sortKey: CREATED_AT, reverse: true) {
            nodes {
            id
            title
            handle
            productType
            publishedAt
            images(first: 1) {
              edges {
                node {
                  src
                }
              }
            }
            variants(first: 1) {
              edges {
                node {
                  price
                  inventoryQuantity
                }
              }
            }
            status
          }
        }
      }
    `,
    )

    if (!data) return []

    const products = data.products.nodes.filter(
      (p) => p.status === "ACTIVE" && p.images.edges.length > 0,
    )

    const statsMap: Record<string, { sales: number; orders: number }> = {}

    for (const order of orders) {
      const seen = new Set<string>()
      for (const item of order.items) {
        const pid = item.productId
        if (!pid) continue
        const price = Number(item.price)
        if (!statsMap[pid]) statsMap[pid] = { sales: 0, orders: 0 }
        statsMap[pid].sales += price
        seen.add(pid)
      }
      seen.forEach((pid) => {
        statsMap[pid].orders += 1
      })
    }

    return products.map(
      (p: {
        id: string
        title: string
        handle: string
        productType: string
        publishedAt: string
        images: { edges: Array<{ node: { src: string } }> }
        variants: { edges: Array<{ node: { price: string; inventoryQuantity: number } }> }
        status: string
      }) => {
        const image = p.images.edges[0]?.node.src ?? "/placeholder.svg"
        const variant = p.variants.edges[0]?.node
        const stats = statsMap[p.id.replace("gid://shopify/Product/", "")]
        return {
          id: p.id,
          name: p.title,
          image,
          category: p.productType ?? "Unknown",
          price: variant ? `$${variant.price}` : "$0.00",
          totalSales: stats ? `$${Number(stats.sales).toFixed(2)}` : "$0.00",
          orders: stats ? Number(stats.orders) : 0,
          stock: variant?.inventoryQuantity ?? 0,
          launchDate: p.publishedAt,
          url: `https://vrbscoffee.com/products/${p.handle}`,
        }
      },
    )
  },
  ["shopify", "products"],
  { revalidate: 60 * 60 },
)

import { unstable_cache } from "next/cache"
import { queryShopify } from "./client"
import type { Order } from "./orders"
import { StoreConfig } from "./stores"

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
  variantId?: string
  description: string
  cartLink?: string
  stats: { sales: number; orders: number }
}

export const getProducts = unstable_cache(
  async (store: StoreConfig, orders: Order[]): Promise<Product[]> => {
    const storeUrl = store.url.startsWith("https://") ? store.url : `https://${store.url}`
    const data = await queryShopify<{
      products: {
        nodes: Array<{
          id: string
          title: string
          handle: string
          productType: string
          publishedAt: string
          description: string
          images: { edges: Array<{ node: { src: string } }> }
          variants: {
            edges: Array<{ node: { id: string; price: string; inventoryQuantity: number } }>
          }
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
            description
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
                  id
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

    return products.map((p) => {
      const image = p.images.edges[0]?.node.src ?? "/placeholder.svg"
      const variant = p.variants.edges[0]?.node

      /** `gid://shopify/ProductVariant/45779434701121` → `45779434701121` */
      const variantIdNumeric = variant?.id?.split("/").pop() ?? undefined

      /** Build the one-click "add & go to checkout" link */
      const cartLink = variantIdNumeric ? `${storeUrl}/cart/${variantIdNumeric}:1` : undefined

      const stats = statsMap[p.id.replace("gid://shopify/Product/", "")]

      return {
        id: p.id,
        name: p.title,
        image,
        category: p.productType || "Unknown",
        price: variant ? `$${variant.price}` : "$0.00",
        totalSales: stats ? `$${Number(stats.sales).toFixed(2)}` : "$0.00",
        orders: stats ? Number(stats.orders) : 0,
        stock: variant?.inventoryQuantity ?? 0,
        launchDate: p.publishedAt,
        url: `${storeUrl}/products/${p.handle}`,
        variantId: variantIdNumeric,
        cartLink,
        description: p.description,
        stats,
      }
    })
  },
  ["shopify", "products_v6"],
  { revalidate: 60 * 60 },
)

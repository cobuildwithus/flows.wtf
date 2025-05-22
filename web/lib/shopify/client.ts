import { GraphqlClient, LATEST_API_VERSION, shopifyApi } from "@shopify/shopify-api"
import "@shopify/shopify-api/adapters/node"
import { getStore, StoreConfig } from "./stores"

const hostName = (process.env.VERCEL_PROJECT_PRODUCTION_URL ?? "localhost").replace(
  /^https?:\/\//,
  "",
)

const clients: Record<string, GraphqlClient> = {}

function getShopifyClient(store: StoreConfig) {
  if (clients[store.url]) return clients[store.url]

  const { url, adminApiAccessToken } = getStore(store)

  const shopify = shopifyApi({
    apiKey: `${process.env.SHOPIFY_API_KEY}`,
    apiSecretKey: `${process.env.SHOPIFY_API_SECRET_KEY}`,
    adminApiAccessToken,
    hostName,
    isCustomStoreApp: true,
    isEmbeddedApp: false,
    apiVersion: LATEST_API_VERSION,
  })

  const session = shopify.session.customAppSession(url)

  const client = new shopify.clients.Graphql({ session })
  clients[store.url] = client

  return client
}

export async function queryShopify<T>(
  store: StoreConfig,
  query: string,
  options?: { variables?: Record<string, unknown> },
): Promise<T> {
  const client = getShopifyClient(store)
  const result = await client.request<T>(query, { variables: options?.variables })

  if (result.errors) {
    throw new Error(result.errors.message)
  }

  return result.data as T
}

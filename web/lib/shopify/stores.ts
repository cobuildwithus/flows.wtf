export type StoreConfig = { url: string; adminApiAccessToken: string }

export function getStore(store: StoreConfig) {
  if (!store.adminApiAccessToken) throw new Error(`Missing token for the ${store.url}`)

  return store
}

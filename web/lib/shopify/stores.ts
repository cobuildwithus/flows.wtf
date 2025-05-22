const stores = {
  "vrbs-coffee": {
    url: "8fab74-1b.myshopify.com",
    adminApiAccessToken: `${process.env.SHOPIFY_VRBS_COFFEE}`,
  },
} as const

export function getStore(storeName: keyof typeof stores) {
  const store = stores[storeName]

  if (!store.adminApiAccessToken) throw new Error(`Missing token for ${storeName} store`)

  return store
}

export type Store = keyof typeof stores

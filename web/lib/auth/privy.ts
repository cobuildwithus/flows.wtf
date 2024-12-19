import { PrivyClient } from "@privy-io/server-auth"
import "server-only"

export const privy = new PrivyClient(
  `${process.env.NEXT_PUBLIC_PRIVY_APP_ID}`,
  `${process.env.PRIVY_APP_SECRET}`,
)

import "server-only"

import * as jose from "jose"
import { cookies } from "next/headers"
import { cache } from "react"
import { getEthAddress } from "../utils"

const verificationKey = `-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEB1GUPYZCvCfMHfxcHwUb6rtzdp4LtC7V8tjdHA+l9y2YIzNmA1PyaQDDMNH9xz4bL5hDDsjuFriGzH4ODS4ZGQ==
-----END PUBLIC KEY-----`

export const getUserAddressFromCookie = cache(async () => {
  const token = (await cookies()).get("privy-id-token")
  if (!token) return undefined

  try {
    const { payload } = await jose.jwtVerify(
      token.value,
      await jose.importSPKI(verificationKey, "ES256"),
      {
        issuer: "privy.io",
        audience: process.env.NEXT_PUBLIC_PRIVY_APP_ID,
      },
    )

    if (!payload || !payload.sub) return undefined

    const linkedAccounts = JSON.parse(payload.linked_accounts as string) as {
      type: string
      address: string
    }[]

    if (!linkedAccounts.length) return undefined

    return getEthAddress(linkedAccounts[0].address)
  } catch (error) {
    console.error(error)
    return undefined
  }
})

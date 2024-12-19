"use client"

import { addRpcUrlOverrideToChain, PrivyProvider } from "@privy-io/react-auth"
import { WagmiProvider } from "@privy-io/wagmi"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useTheme } from "next-themes"
import { PropsWithChildren } from "react"
import { base } from "viem/chains"
import { chains, config, getRpcUrl } from "./config"

const queryClient = new QueryClient()

export default function Wagmi({ children }: PropsWithChildren) {
  const { resolvedTheme } = useTheme()

  return (
    <PrivyProvider
      appId={`${process.env.NEXT_PUBLIC_PRIVY_APP_ID}`}
      clientId={`${process.env.NEXT_PUBLIC_PRIVY_CLIENT_ID}`}
      config={{
        appearance: {
          theme: resolvedTheme === "dark" ? "dark" : "light",
          logo: "https://flows.wtf/noggles.svg",
          showWalletLoginFirst: true,
        },
        defaultChain: base,
        supportedChains: chains.map((chain) =>
          addRpcUrlOverrideToChain(chain, getRpcUrl(chain, "http")),
        ),
        embeddedWallets: {
          createOnLogin: "users-without-wallets",
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={config}>{children}</WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  )
}

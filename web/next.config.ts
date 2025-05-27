import type { NextConfig } from "next"
import { imageDomains } from "./image-domains"

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/flows", "@prisma/farcaster", "@prisma/juicebox"],
  images: {
    remotePatterns: imageDomains.map((hostname) => ({
      protocol: "https",
      hostname,
      pathname: "/**",
    })),
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
}

export default nextConfig
export { imageDomains }

import type { NextConfig } from "next"
import { imageDomains } from "./image-domains"

const nextConfig: NextConfig = {
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
  experimental: {
    optimizePackageImports: ["lucide-react", "date-fns"],
  },
}

export default nextConfig
export { imageDomains }

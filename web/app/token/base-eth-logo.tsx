import Image from "next/image"
import { TokenLogo } from "./token-logo"

export const BaseEthLogo = ({ size = 21, className }: { size?: number; className?: string }) => (
  <div className={`${className} flex items-center`}>
    <TokenLogo src="/eth.png" alt="ETH" size={size} />
    <div className="z-10 -ml-2 mt-4 rounded-[6px] bg-white p-[3px] dark:bg-black">
      <Image src="/base.png" alt="Base" className="rounded-[2px]" width={12} height={12} />
    </div>
  </div>
)

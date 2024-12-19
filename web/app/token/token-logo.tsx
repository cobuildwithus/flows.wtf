import Image from "next/image"

export const TokenLogo = ({
  src,
  alt,
  className = "",
  size = 21,
}: {
  src: string
  alt: string
  className?: string
  size?: number
}) => (
  <div
    className={`relative overflow-hidden rounded-full ${className}`}
    style={{ width: `${size}px`, height: `${size}px` }}
  >
    <Image src={src} alt={alt} className="object-cover" fill />
  </div>
)

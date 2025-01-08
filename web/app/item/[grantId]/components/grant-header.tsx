import { getIpfsUrl } from "@/lib/utils"
import Link from "next/link"

export function GrantHeader({ grant }: { grant: { id: string; image: string; title: string } }) {
  return (
    <div className="flex items-center justify-center gap-4">
      <Link
        href={`/item/${grant.id}`}
        className="group flex items-center gap-4 transition-opacity hover:opacity-80"
      >
        <div className="size-10 shrink-0 overflow-hidden rounded-full border bg-muted/10 shadow-sm">
          <img
            src={getIpfsUrl(grant.image)}
            alt={grant.title}
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <h3 className="text-2xl font-semibold tracking-tight">{grant.title}</h3>
      </Link>
    </div>
  )
}

import { Grant } from "@/lib/database/types"
import { getIpfsUrl } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"

interface Props {
  grants: Pick<Grant, "id" | "title" | "image">[]
}

export function ImpactGrants({ grants }: Props) {
  return (
    <div className="flex flex-col space-y-4">
      {grants.length > 0 ? (
        grants.map((grant) => (
          <Link
            href={`/item/${grant.id}`}
            key={grant.id}
            className="group pointer-events-auto flex items-center gap-2.5 transition-opacity hover:opacity-80"
          >
            <Image
              src={getIpfsUrl(grant.image)}
              alt={grant.title}
              width={40}
              height={40}
              className="size-10 shrink-0 rounded-md object-cover"
            />
            <span className="line-clamp-2 text-sm text-muted-foreground">{grant.title}</span>
          </Link>
        ))
      ) : (
        <div className="text-pretty text-sm text-muted-foreground">Coming soon</div>
      )}
    </div>
  )
}

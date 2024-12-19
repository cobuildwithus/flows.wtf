import { TableCell } from "@/components/ui/table"
import { getIpfsUrl } from "@/lib/utils"
import Image from "next/image"

export const GrantLogoCell = ({ image, title }: { image: string; title: string }) => {
  return (
    <TableCell className="w-8 pr-0 md:w-12 md:pr-0">
      <div className="size-8 md:size-12">
        <Image
          src={getIpfsUrl(image)}
          alt={title}
          width={48}
          height={48}
          className="size-full rounded-full object-cover"
        />
      </div>
    </TableCell>
  )
}

import { TableCell } from "@/components/ui/table"
import Link from "next/link"

export const GrantTitleCell = ({ title, href }: { title: string; href: string }) => {
  return (
    <TableCell className="max-w-64 overflow-hidden text-ellipsis max-sm:truncate">
      <Link
        href={href}
        className="text-sm font-medium duration-100 ease-out hover:text-primary md:whitespace-normal"
      >
        {title}
      </Link>
    </TableCell>
  )
}

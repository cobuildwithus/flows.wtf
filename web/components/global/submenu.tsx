import { cn } from "@/lib/utils"
import Link from "next/link"

interface LinkItem {
  label: string
  href?: string
  onClick?: () => void
  isActive?: boolean
  badge?: number
  replace?: boolean
  scroll?: boolean
}

interface Props {
  links: LinkItem[]
  className?: string
}

export function Submenu(props: Props) {
  const { links, className } = props

  return (
    <div
      className={cn(
        "flex min-h-9 items-center space-x-5 overflow-x-auto pb-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-secondary md:space-x-7",
        className,
      )}
    >
      {links.map((link) => {
        const common = {
          className: "group flex items-center space-x-1 text-base font-medium md:text-xl",
          replace: link.replace,
          scroll: link.scroll,
        }

        const inner = (
          <span
            className={cn({
              "opacity-50 duration-100 ease-in-out group-hover:opacity-100": !link.isActive,
            })}
          >
            {link.label}
          </span>
        )

        const badgeElement =
          Number(link.badge) > 0 ? (
            <span className="ml-1 inline-flex size-[18px] items-center justify-center rounded-full bg-secondary text-xs font-medium text-secondary-foreground">
              {link.badge}
            </span>
          ) : null

        if (link.href) {
          return (
            <Link key={link.label} href={link.href} {...common}>
              {inner}
              {badgeElement}
            </Link>
          )
        }

        return (
          <button key={link.label} type="button" onClick={link.onClick} {...common}>
            {inner}
            {badgeElement}
          </button>
        )
      })}
    </div>
  )
}

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const ai = [
  "relative overflow-hidden",
  "before:absolute before:inset-0 before:rounded-[calc(var(--radius)+4px)] before:p-px",
  "before:bg-gradient-to-r before:from-blue-500 before:via-purple-600 before:via-indigo-500 before:to-orange-400",
  "before:animate-gradient-x before:pointer-events-none",
  "after:pointer-events-none after:absolute after:inset-[2px] after:rounded-[calc(var(--radius)+3px)]",
  "hover:before:animate-none hover:before:from-blue-500 hover:before:via-purple-500 hover:before:to-orange-300",
]

const buttonVariants = cva(
  "inline-flex items-center tracking-tight justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        "ai-primary": [...ai, "after:bg-primary text-primary-foreground"],
        "ai-secondary": [...ai, "after:bg-secondary text-secondary-foreground"],
      },
      size: {
        default: "h-9 px-4 py-2 max-sm:h-8 max-sm:px-3",
        xs: "h-7 px-3 py-1 text-xs",
        sm: "h-8 rounded-md px-3 text-xs max-sm:h-7 max-sm:px-2.5",
        md: "h-9 rounded-md px-5 text-sm",
        lg: "h-10 rounded-md px-6 text-base",
        xl: "h-12 rounded-md px-8 text-base",
        icon: "h-9 w-9",
      },
      loading: {
        true: "animate-pulse",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props}>
        {variant?.startsWith("ai") ? <span className="relative z-10">{children}</span> : children}
      </Comp>
    )
  },
)
Button.displayName = "Button"

export { Button, buttonVariants }

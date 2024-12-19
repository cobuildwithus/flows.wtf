import dynamic from "next/dynamic"
import { LucideProps, Info } from "lucide-react"
import dynamicIconImports from "lucide-react/dynamicIconImports"

interface IconProps extends LucideProps {
  name: keyof typeof dynamicIconImports | (string & {})
}

export const Icon = ({ name, ...props }: IconProps) => {
  if (!dynamicIconImports[name as keyof typeof dynamicIconImports]) {
    console.warn(`Icon ${name} not found`)
    return <Info {...props} />
  }

  const LucideIcon = dynamic(dynamicIconImports[name as keyof typeof dynamicIconImports])

  return <LucideIcon {...props} />
}

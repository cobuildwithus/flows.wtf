import { CSSProperties } from "react"

export interface Gradient {
  light: {
    gradientStart: string
    gradientEnd: string
    text: string
  }
  dark: {
    gradientStart: string
    gradientEnd: string
    text: string
  }
}

interface Props {
  gradient: Gradient
  children: React.ReactNode
  className?: string
}

export function GradientCard(props: Props) {
  const { gradient, children, className } = props

  return (
    <div
      style={getGradientVariables(gradient)}
      className={`rounded-xl bg-gradient-to-br from-[var(--gradient-start-light)] to-[var(--gradient-end-light)] dark:from-[var(--gradient-start-dark)] dark:to-[var(--gradient-end-dark)] ${className}`}
    >
      <div className="flex h-full flex-col text-[var(--text-light)] dark:text-[var(--text-dark)]">
        {children}
      </div>
    </div>
  )
}

function getGradientVariables(gradient: Gradient) {
  const { light, dark } = gradient
  return {
    "--gradient-start-light": light.gradientStart,
    "--gradient-end-light": light.gradientEnd,
    "--gradient-start-dark": dark.gradientStart,
    "--gradient-end-dark": dark.gradientEnd,
    "--text-light": light.text,
    "--text-dark": dark.text,
  } as CSSProperties
}

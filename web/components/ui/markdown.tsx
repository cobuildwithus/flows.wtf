import { cn } from "@/lib/utils"
import MarkdownJsx, { MarkdownToJSX } from "markdown-to-jsx"
import { Fragment } from "react"
import { VideoPlayer } from "./video-player"

interface Props {
  children: string
  options?: MarkdownToJSX.Options
  links?: "underline" | "pill"
}

export const Markdown = (props: Props) => {
  const { children = "", options, links = "underline" } = props

  return (
    <MarkdownJsx
      options={{
        overrides: {
          a: {
            props: {
              target: "_blank",
              className: cn({
                "underline break-words hover:text-primary transition-colors underline-offset-4":
                  links === "underline",
                "items-center rounded-full transition-colors font-medium py-1 px-2 text-[10px] uppercase bg-secondary text-secondary-foreground dark:bg-accent dark:text-accent-foreground hover:bg-primary hover:text-primary-foreground dark:hover:bg-primary dark:hover:text-primary-foreground":
                  links === "pill",
              }),
            },
            component: (props) => {
              const { href = "" } = props
              if (href.startsWith("https://stream.mux.com/") && href.endsWith(".m3u8")) {
                return (
                  <VideoPlayer
                    url={href}
                    controls
                    width="auto"
                    height="auto"
                    style={{
                      maxHeight: "90vh",
                      minWidth: "320px",
                      minHeight: "240px",
                      maxWidth: "100%",
                    }}
                  />
                )
              }
              return <a {...props} />
            },
          },
          ul: { props: { className: "list-disc ml-6 space-y-4" } },
          ol: { props: { className: "list-decimal ml-6 space-y-4" } },
          li: { props: { className: "leading-relaxed pl-2" } },
          h1: { props: { className: "text-[1.25em] font-medium tracking-tight" } },
          h2: { props: { className: "text-[1.15em] font-medium tracking-tight" } },
          h3: { props: { className: "font-medium tracking-tight" } },
          p: { props: { className: "leading-relaxed" } },
        },
        wrapper: Fragment,
        ...options,
      }}
    >
      {children}
    </MarkdownJsx>
  )
}

import { Markdown } from "@/components/ui/markdown"
import { Metadata } from "next"
import { TERMS_CONTENT } from "./terms-content"

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of Service for Flows.wtf platform",
}

export default function TermsOfServicePage() {
  const lastModified = "July 11, 2025"

  return (
    <main>
      <div className="container my-20 max-w-4xl">
        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-3xl font-medium tracking-tight">Terms of Service</h1>
            <p className="text-sm text-muted-foreground">Last modified: {lastModified}</p>
          </div>

          <Markdown>{TERMS_CONTENT}</Markdown>
        </div>
      </div>
    </main>
  )
}

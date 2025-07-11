import { Markdown } from "@/components/ui/markdown"
import { Metadata } from "next"
import { PRIVACY_CONTENT } from "./privacy-content"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for Flows.wtf platform",
}

export default function PrivacyPolicyPage() {
  const lastModified = "July 11, 2025"

  return (
    <main>
      <div className="container my-20 max-w-4xl">
        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-3xl font-medium tracking-tight">Privacy Policy</h1>
            <p className="text-sm text-muted-foreground">Last modified: {lastModified}</p>
          </div>

          <Markdown>{PRIVACY_CONTENT}</Markdown>
        </div>
      </div>
    </main>
  )
}

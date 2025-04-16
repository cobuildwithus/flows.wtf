import { InfoIcon, AlertTriangle, Clock, XCircle } from "lucide-react"

export function formatEvidence(evidence: string) {
  if (!evidence.includes(" || ")) {
    return <span className="text-muted-foreground">{evidence}</span>
  }

  const groups = evidence.split(" || ")
  const [type, ...comments] = groups
  return (
    <>
      {comments.length > 0 && (
        <span className="text-base text-muted-foreground">{comments.join(" ")}</span>
      )}
    </>
  )
}

export function getRemovalType(evidence: string, cancelledByBuilder: boolean): string {
  if (cancelledByBuilder) {
    return "Cancelled"
  }

  if (!evidence.includes(" || ")) {
    return "Other"
  }

  const type = evidence.split(" || ")[0]

  if (type === "values-misalignment") {
    return "Values"
  }
  return type.replaceAll("-", " ")
}

export function getRemovalTypeIcon(type: string) {
  switch (type.toLowerCase()) {
    case "inactive":
      return <Clock className="h-3 w-3" />
    case "low quality":
      return <AlertTriangle className="h-3 w-3" />
    case "other":
    case "cancelled":
      return <InfoIcon className="h-3 w-3" />
    default:
      return <XCircle className="h-3 w-3" />
  }
}

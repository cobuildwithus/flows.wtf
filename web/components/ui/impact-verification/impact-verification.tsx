"use client"

import type { Cast } from "@prisma/farcaster"
import OpenAI from "@/public/openai.svg"
import ClaudeColor from "@/public/claude-color.svg"
import Image from "next/image"
import { CircleCheckBig, CircleX } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../collapsible"
import { ZeroState } from "./zero-state"
import { Tooltip, TooltipContent, TooltipTrigger } from "../tooltip"

interface Props {
  cast: Pick<Cast, "impact_verifications" | "id">
}

export const ImpactVerification = ({ cast }: Props) => {
  if (
    !cast.impact_verifications ||
    !Array.isArray(cast.impact_verifications) ||
    cast.impact_verifications.length === 0
  ) {
    return <ZeroState cast={cast} />
  }

  const verification = cast.impact_verifications[0]
  const isGrantUpdate = verification.is_grant_update

  return (
    <Collapsible>
      <div className="rounded-b-md border bg-muted/50 px-7 pb-1.5 pt-2">
        <CollapsibleTrigger className="w-full focus:outline-none">
          <div className="flex items-center justify-between">
            <VerificationStatus isGrantUpdate={isGrantUpdate} verification={verification} />
            <ModelInfo model={verification.model} />
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="pb-2 pt-1">
            <p className="text-xs text-muted-foreground">{verification.reason}</p>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}

const getModelLogo = (modelId: string) => {
  const model = modelId.toLowerCase()
  if (
    model.includes("gpt") ||
    model.includes("openai") ||
    model.includes("o1") ||
    model.includes("o3") ||
    model.includes("o4")
  )
    return OpenAI
  if (model.includes("claude")) return ClaudeColor
  return OpenAI // Default to OpenAI logo
}

const formatModelId = (modelId: string) => {
  // Remove any date suffixes (e.g. -2025-01-31 or -20241022)
  const dateSuffixRemoved = modelId.replace(/-(?:\d{4}-\d{2}-\d{2}|\d{8})$/, "")

  // Remove any version suffixes (e.g. -0125)
  const versionSuffixRemoved = dateSuffixRemoved.replace(/-\d{4}$/, "")

  return versionSuffixRemoved
}

const VerificationStatus = ({
  isGrantUpdate,
  verification,
}: {
  isGrantUpdate: boolean
  verification: PrismaJson.ImpactVerification
}) => {
  return (
    <div className="group flex items-center gap-2">
      {isGrantUpdate ? (
        <>
          <CircleCheckBig className="size-4 text-green-400/75" />
          <span className="text-xs font-medium text-muted-foreground">
            {verification.score}%
            <span className="opacity-0 transition-opacity group-hover:opacity-100"> confident</span>
          </span>
        </>
      ) : (
        <>
          <CircleX className="size-4 text-red-400/75" />
          <span className="text-xs font-medium text-muted-foreground">Not update</span>
        </>
      )}
    </div>
  )
}
const ModelInfo = ({ model }: { model: string }) => (
  <Tooltip>
    <TooltipTrigger>
      <Image src={getModelLogo(model)} alt="OpenAI" className="h-3 w-auto opacity-50" />
    </TooltipTrigger>
    <TooltipContent>
      <span className="font-mono text-xs">Checked by {formatModelId(model)}</span>
    </TooltipContent>
  </Tooltip>
)

"use client"

import type { AiModelOutput, Cast } from "@prisma/farcaster"
import OpenAI from "@/public/openai.svg"
import ClaudeColor from "@/public/claude-color.svg"
import Image from "next/image"
import { CircleCheckBig, CircleX } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../collapsible"
import { ZeroState } from "./zero-state"
import { Tooltip, TooltipContent, TooltipTrigger } from "../tooltip"
import { useParams } from "next/navigation"
import { cn } from "@/lib/utils"
import { CheckUpdateButton } from "./check-update-button"

interface Props {
  cast: Pick<Cast, "impact_verifications" | "hash"> & {
    ai_model_outputs?: Pick<AiModelOutput, "output" | "model" | "created_at" | "rule_id">[]
  }
}

const AiModelVerificationContent = ({
  aiOutput,
  castHash,
  grantId,
}: {
  aiOutput: Pick<AiModelOutput, "output" | "model" | "created_at" | "rule_id">
  castHash: string
  grantId: string
}) => {
  const rawOutput = aiOutput.output as PrismaJson.AiModelOutputResult | null
  const output = rawOutput && typeof rawOutput === "object" ? rawOutput : { pass: false, reasoning: "" }
  const isGrantUpdate = output.pass === true

  return (
    <Collapsible>
      <div className="rounded-b-md border bg-muted/50 px-7 pb-1.5 pt-2">
        <CollapsibleTrigger className="w-full focus:outline-none">
          <div className="flex items-center justify-between">
            <div className="group flex items-center gap-2">
              {isGrantUpdate ? (
                <>
                  <CircleCheckBig className="size-4 text-green-400/75" />
                  <span className="text-xs font-medium text-muted-foreground">Verified update</span>
                </>
              ) : (
                <>
                  <CircleX className="size-4 text-red-400/75" />
                  <span className="text-xs font-medium text-muted-foreground">Not verified</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div onClick={(e) => e.stopPropagation()}>
                <CheckUpdateButton text="Re-check" castHash={castHash} grantId={grantId} />
              </div>
              <ModelInfo model={aiOutput.model} />
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="pb-2 pt-1">
            <p className="text-xs text-muted-foreground">{output.reasoning}</p>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}

export const ImpactVerification = ({ cast }: Props) => {
  const { grantId } = useParams()
  const castHash = `0x${Buffer.from(new Uint8Array(cast.hash)).toString("hex")}`

  // Prefer new AI model outputs if available
  if (cast.ai_model_outputs && cast.ai_model_outputs.length > 0) {
    const latestOutput = cast.ai_model_outputs[0]
    return (
      <AiModelVerificationContent
        aiOutput={latestOutput}
        castHash={castHash}
        grantId={grantId as string}
      />
    )
  }

  // Fall back to legacy impact_verifications
  if (
    !cast.impact_verifications ||
    !Array.isArray(cast.impact_verifications) ||
    cast.impact_verifications.length === 0
  ) {
    return <ZeroState cast={cast} grantId={grantId as string} />
  }

  const numVerifications = cast.impact_verifications.length
  const verification =
    cast.impact_verifications.find((v) => v.is_grant_update && v.grant_id === grantId) ||
    cast.impact_verifications[numVerifications - 1]

  return (
    <LegacyVerificationContent
      verification={verification}
      grantId={grantId as string}
      castHash={castHash}
    />
  )
}

const LegacyVerificationContent = ({
  verification,
  grantId,
  castHash,
}: {
  verification: PrismaJson.ImpactVerification
  grantId?: string
  castHash: string
}) => {
  const verificationGrantId = verification.grant_id
  const isForDifferentGrant =
    !!grantId &&
    verificationGrantId !== grantId &&
    verificationGrantId.startsWith("0x") &&
    verificationGrantId !== "0x0000"
  const isGrantUpdate = verification.is_grant_update && !isForDifferentGrant

  return (
    <Collapsible>
      <div className="rounded-b-md border bg-muted/50 px-7 pb-1.5 pt-2">
        <CollapsibleTrigger className="w-full focus:outline-none">
          <div className="flex items-center justify-between">
            <VerificationStatus
              isGrantUpdate={isGrantUpdate}
              verification={verification}
              isForDifferentGrant={isForDifferentGrant}
            />
            {isForDifferentGrant ? (
              <div onClick={(e) => e.stopPropagation()}>
                <CheckUpdateButton text="Re-check" castHash={castHash} grantId={grantId as string} />
              </div>
            ) : (
              <ModelInfo model={verification.model} />
            )}
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="pb-2 pt-1">
            {isForDifferentGrant && (
              <span className="text-xs font-medium">This update is for another grant.</span>
            )}
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
    model.includes("o4") ||
    model.includes("o5")
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
  isForDifferentGrant,
}: {
  isGrantUpdate: boolean
  verification: PrismaJson.ImpactVerification
  isForDifferentGrant: boolean
}) => {
  let { score } = verification
  // hot fix for bad AI data
  if (score > 0 && score < 1) score = score * 100

  return (
    <div className="group flex items-center gap-2">
      {isGrantUpdate ? (
        <>
          <CircleCheckBig className="size-4 text-green-400/75" />
          <span className="text-xs font-medium text-muted-foreground">
            {score}%
            <span className="opacity-0 transition-opacity group-hover:opacity-100"> confident</span>
          </span>
        </>
      ) : (
        <>
          <CircleX
            className={cn("size-4 text-red-400/75", {
              "text-red-400/75": !isForDifferentGrant,
              "text-muted-foreground": isForDifferentGrant,
            })}
          />
          <span className="max-w-[200px] truncate text-ellipsis text-xs font-medium text-muted-foreground">
            {isForDifferentGrant ? "For another grant" : "Not verified"}
          </span>
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

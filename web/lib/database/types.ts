export {}

declare global {
  namespace PrismaJson {
    type ImpactMetric = {
      name: string
      units: string
      value: string
      description: string
      reasoning: string
    }

    type ImpactMetricDefinition = {
      id: string
      name: string
      units: string
      description: string
      weight: number
      showOnChart: boolean
    }

    type DeliverablesCompletionRate = {
      completionRate: number
      reason: string
    }

    type ImpactSummary = {
      timeUnit: "weeks" | "months"
      metricSummaries: {
        value: number
        units: string
        metricId: string
        aggregationType: "total" | "average"
        explanation: string
      }[]
    }
    type ImpactMonthly = {
      date: string
      summary: string
    }

    type ImpactVerification = {
      model: string
      score: number
      reason: string
      grant_id: string
      prompt_version: string
      is_grant_update: boolean
      date_verified: Date | undefined
    }

    type Beneficiary = {
      description: string
      id: string
    }

    type ImpactResult = {
      headline: string
      details: string
    }

    interface Proof {
      type: ProofType
      url: string
      cast: FarcasterCast | null
      description: string
      images: Media[]
      videos: Media[]
      createdAt: Date
      updatedAt: Date
      author: ProofAuthor
      mentionedFids: number[]
    }

    interface FarcasterCast {
      id: number
      url: string
    }

    type ProofType = "image" | "video" | "farcaster.cast"

    interface ProofAuthor {
      fid: number
    }

    type Media = {
      url: string
      description: string | null
      faces: GoodFace[]
    }

    interface GoodFace {
      Face: any
      FaceDetail: any
      headshotUrl: string
      quality: number
      originalImageUrl: string
      userId?: string
    }

    type BestImage = {
      type: "illustration" | "raw-image" | "none"
      width: number
      height: number
      url: string
      urlFromBuilder: string | null
      illustration: ImageWithUrl | null
      rawImage: (ImageWithUrl & { transparent: string }) | null
      cloudinaryPublicId?: string
      square?: {
        raw: string
        transparent: string
      }
      vertical?: {
        raw: string
        transparent: string
      }
      horizontal?: {
        raw: string
        transparent: string
      }
    }

    type ImageWithUrl = {
      url: string
      width: number
      height: number
    }

    interface InvolvedPerson {
      userId: string
      headshotUrl: string
      wideHeadshotUrl: string
      images: string[]
      age: {
        low: number
        high: number
      }
      beneficiary: {
        isBeneficiary: boolean
        reason: string
      }
      impacted: {
        isPositivelyImpacted: boolean
        reason: string
      }
      gender: string
    }

    type GrantBuilder = {
      bio: string
      links: Array<{ title: string; url: string; icon: string }>
    }

    type Gradient = {
      light: { text: string; gradientStart: string; gradientEnd: string }
      dark: { text: string; gradientStart: string; gradientEnd: string }
    }

    type GrantGradients = {
      mission: Gradient
      beneficiaries: Gradient
      deliverables: Gradient
    }
  }
}

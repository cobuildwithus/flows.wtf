export {}

declare global {
  namespace PrismaJson {
    type Media = {
      url: string
      description: string | null
      peopleActivities: PersonAndActivities[]
    }

    type ImpactUnit = {
      name: string
      units: string
      value: string
      description: string
    }

    type MediaAnalysis = {
      uniquePeople: number
      activities: PersonAndActivities[]
    }

    type PersonAndActivities = {
      personDescription: string
      gender: "male" | "female"
      activities: string[]
    }

    type BestImage = {
      type: "illustration" | "raw-image" | "none"
      width: number
      height: number
      url: string
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
  }
}

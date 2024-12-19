import { z } from "zod"

const gradient = z.object({
  light: z.object({ text: z.string(), gradientStart: z.string(), gradientEnd: z.string() }),
  dark: z.object({ text: z.string(), gradientStart: z.string(), gradientEnd: z.string() }),
})

export const grantPageSchema = z.object({
  title: z.string().describe("Title of the grant in normal case"),
  tagline: z.string(),
  coverImage: z.object({
    url: z.string(),
    position: z
      .enum(["top", "center", "bottom"])
      .describe("Vertical position of the focal point or main subject in the image"),
    alt: z.string(),
  }),
  why: z.object({
    text: z.string().describe("One sentence explaining the grant's main goal (max 10 words)"),
    image: z.string().describe("URL of the image that will be used in the background"),
  }),
  how: z.object({
    text: z.string().describe("Explain how the goal will be achieved"),
    icon: z.string(),
    gradient,
  }),
  who: z.object({
    text: z.string().describe("Short introduction of grant recipient(s), including name"),
    gradient,
  }),
  focus: z.object({
    text: z
      .string()
      .describe("Describe what's the current focus of builder(s) in context of the grant"),
    gradient,
  }),
  metrics: z
    .array(
      z.object({
        label: z.string().describe("Make it clear what the value means (what is the unit)"),
        value: z.string().max(6),
      }),
    )
    .min(4),
  builder: z.object({
    bio: z
      .string()
      .describe(
        `2-3 paragraphs, each 130 characters or less, separated by "\n\n" (400 characters total max)`,
      ),
    links: z.array(z.object({ title: z.string(), url: z.string(), icon: z.string() })),
    tags: z
      .array(z.string().describe("Tag that characterizes the builder"))
      .describe(`3 tags, each max 15 characters.`),
  }),
  media: z.array(z.object({ url: z.string(), alt: z.string() })).min(2),
  plan: z.array(z.object({ title: z.string(), description: z.string() })),
  timeline: z
    .array(z.object({ date: z.string(), title: z.string().describe("Short copy (5-12 words)") }))
    .describe("Significant events"),
  cards: z.array(z.object({ title: z.string(), description: z.string(), icon: z.string() })),
})

export type GrantPageData = z.infer<typeof grantPageSchema>

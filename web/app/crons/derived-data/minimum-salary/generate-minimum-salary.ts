import { createAnthropic } from "@ai-sdk/anthropic"
import { generateObject } from "ai"
import { z } from "zod"

const anthropic = createAnthropic({ apiKey: `${process.env.ANTHROPIC_API_KEY}` })

export async function generateMinimumSalary(description: string) {
  const { object } = await generateObject({
    model: anthropic("claude-3-5-sonnet-20241022"),
    schema: z.object({
      minimumSalary: z
        .string()
        .describe("The minimum monthly salary amount in USDC, extracted from the description"),
    }),
    messages: [
      {
        role: "system",
        content: `You are a helpful assistant that extracts the minimum monthly salary amount from grant program descriptions.

The description will contain a "Payment Structure" section that specifies the minimum monthly payment amount in USDC.

Look for text like:
- "Each approved project/creator gets at least ~$X USDC per month"
- "Minimum monthly payment of $X USDC"

Return just the number without the $ or "USDC". For example, if the minimum is "$100 USDC per month", return "100".

If no minimum salary is specified, return "0". Do not make up a number, or include any other text.`,
      },
      {
        role: "user",
        content: [{ type: "text", text: `\n\nDescription: ${description}` }],
      },
    ],
    maxTokens: 100,
  })

  return object
}

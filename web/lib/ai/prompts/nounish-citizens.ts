import { getAllNounishCitizens } from "@/lib/farcaster/get-all-channel-members"

export async function getAllNounishCitizensPrompt() {
  const citizens = await getAllNounishCitizens()

  if (!citizens || citizens.length === 0) return ""

  const prompt = `
# Nounish Citizens
The following users are members of Nounish channels (/nouns, /yellow, /vrbs, /flows, /gnars):

${citizens.map((citizen) => `- ${citizen.fname} (fid: ${citizen.fid})`).join("\n")}

These users are active participants in the Nouns ecosystem. You can use their fids to pass to the tools as the users parameter.
Eg: if a user asks about a specific user, you can use their FID here to pass to the queryEmbeddingsTool as the users parameter.
`

  return prompt
}

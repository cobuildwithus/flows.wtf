import { handleUpload, type HandleUploadBody } from "@vercel/blob/client"
import { NextResponse } from "next/server"
import { getUser } from "@/lib/auth/user"

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody

  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        // Verify user is still authenticated when generating upload token
        const user = await getUser()
        if (!user) {
          throw new Error("Unauthorized")
        }

        return {
          allowedContentTypes: ["image/*"],
          clientPayload,
          tokenPayload: JSON.stringify({
            userId: user.address,
            username: user.username,
          }),
        }
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        try {
          if (!tokenPayload) throw new Error("No token payload")
          const { userId, username } = JSON.parse(tokenPayload)
          console.log(`Upload completed for user ${username} (${userId}):`, blob.url)

          // Additional user-specific file handling could go here
        } catch (error) {
          console.error("Error processing upload:", error)
          throw new Error("Could not process upload")
        }
      },
    })

    return NextResponse.json(jsonResponse)
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 })
  }
}

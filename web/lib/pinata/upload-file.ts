import { upload } from "@vercel/blob/client"

export async function uploadFile(file: File) {
  const blob = await upload(file.name, file, {
    access: "public",
    handleUploadUrl: "/api/upload-image",
  })
  return blob.url
}

"use client"

import { useState } from "react"
import { toast } from "sonner"
import { compressImage } from "./compress-image"
import { uploadFile } from "./upload-file"

interface UploadedFile {
  url: string
  name: string
  contentType: string
}

export function useFileUploads() {
  const [isUploading, setIsUploading] = useState(false)
  const [queue, setQueue] = useState<string[]>([])

  const uploadFiles = async (files: File[]): Promise<UploadedFile[]> => {
    try {
      if (!files.length) throw new Error("Please select files to upload")

      setIsUploading(true)
      setQueue(files.map((file) => file.name))

      const uploads = await Promise.all(
        files.map(async (file) => {
          try {
            const fileToUpload = file.type.startsWith("image/") ? await compressImage(file) : file

            const result = await uploadFile(fileToUpload)
            return { url: result, name: file.name, contentType: file.type }
          } catch (error) {
            console.error("Upload error:", error)
            return { error }
          }
        }),
      )

      const uploadedFiles = uploads.filter((result): result is UploadedFile => "url" in result)

      const failedUploads = uploads.filter(
        (result): result is { error: unknown } => result.error !== undefined,
      )

      if (failedUploads.length > 0) {
        console.error("Some files failed to upload:", failedUploads)
        toast.error(`${failedUploads.length} file(s) failed to upload`)
      }

      if (uploadedFiles.length > 0) {
        toast.success(`Uploaded ${uploadedFiles.length} file(s)`, { duration: 500 })
      }

      return uploadedFiles
    } catch (error) {
      console.error("Upload error:", error)
      toast.error((error as Error).message || "Couldn't upload files")
      return []
    } finally {
      setIsUploading(false)
      setQueue([])
    }
  }

  return {
    isUploading,
    uploadQueue: queue,
    uploadFiles,
  }
}

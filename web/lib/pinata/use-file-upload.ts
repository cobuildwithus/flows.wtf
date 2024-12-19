"use client"

import { useState } from "react"
import { toast } from "sonner"
import { uploadFile } from "./upload-file"
import Compressor from "compressorjs"

const compressImage = (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    new Compressor(file, {
      quality: 0.6,
      maxWidth: 2000,
      maxHeight: 2000,
      success: (result) => resolve(result as File),
      error: reject,
    })
  })
}

export function useFileUpload() {
  const [isUploading, setIsUploading] = useState<boolean>(false)

  return {
    isUploading,
    uploadFile: async (file: File) => {
      try {
        if (!file) throw new Error("Please upload file")
        setIsUploading(true)

        // Compress only image files
        const fileToUpload = file.type.startsWith("image/") ? await compressImage(file) : file

        return await uploadFile(fileToUpload)
      } catch (error) {
        console.error("Upload error:", error)
        toast.error((error as Error).message || "Couldn't upload file")
        return null
      } finally {
        setIsUploading(false)
      }
    },
  }
}

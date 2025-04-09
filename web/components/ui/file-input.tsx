"use client"

import { Input } from "@/components/ui/input"
import { useFileUpload } from "@/lib/file-upload/use-file-upload"
import { cn } from "@/lib/utils"
import { UpdateIcon } from "@radix-ui/react-icons"
import { Upload } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import { toast } from "sonner"

interface Props {
  name: string
  accept: string
  onSuccess?: (hash: string) => void
  maxFileSizeMB?: number
  className?: string
  existingImage?: string
}

export function FileInput({
  name,
  accept,
  onSuccess,
  maxFileSizeMB = 5,
  className,
  existingImage,
}: Props) {
  const { isUploading, uploadFile } = useFileUpload()
  const [url, setUrl] = useState<string>(existingImage || "")

  return (
    <div className="flex flex-row items-start gap-3">
      <div className="relative flex-1">
        <Input
          type="file"
          onChange={async (e) => {
            const file = e.target.files?.[0]
            if (!file) return

            if (file.size > maxFileSizeMB * 1024 * 1024) {
              toast.error(`Max file size is ${maxFileSizeMB}MB`)
              return
            }

            const blobUrl = await uploadFile(file)

            if (blobUrl) {
              setUrl(blobUrl)
              if (onSuccess) onSuccess(blobUrl)
            }
          }}
          accept={accept}
          disabled={isUploading}
          className={className}
        />

        <input type="hidden" name={name} value={url || ""} />
        {isUploading && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <UpdateIcon className="size-4 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>
      {url && (
        <Image
          src={url}
          alt=" "
          width={48}
          height={48}
          className="h-[48px] w-[48px] rounded-lg object-cover"
        />
      )}
    </div>
  )
}

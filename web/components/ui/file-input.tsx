"use client"

import { Input } from "@/components/ui/input"
import { useFileUpload } from "@/lib/pinata/use-file-upload"
import { UpdateIcon } from "@radix-ui/react-icons"
import Image from "next/image"
import { useState } from "react"
import { toast } from "sonner"

interface Props {
  name: string
  accept: string
  onSuccess?: (hash: string) => void
  maxFileSizeMB?: number
}

export function FileInput({ name, accept, onSuccess, maxFileSizeMB = 5 }: Props) {
  const { isUploading, uploadFile } = useFileUpload()
  const [url, setUrl] = useState<string>()

  return (
    <div className="relative">
      <Input
        type="file"
        onChange={async (e) => {
          const file = e.target.files?.[0]
          if (!file) return

          if (file.size > maxFileSizeMB * 1024 * 1024) {
            toast.error(`Max file size is ${maxFileSizeMB}MB`)
            return
          }

          const ipfsUrl = await uploadFile(file)

          if (ipfsUrl) {
            setUrl(ipfsUrl)
            if (onSuccess) onSuccess(ipfsUrl)
          }
        }}
        accept={accept}
        disabled={isUploading}
        className="pr-10"
      />
      <input type="hidden" name={name} value={url || ""} />
      <div className="absolute inset-y-0 right-0 flex items-center pl-3">
        {url && (
          <Image
            src={url}
            alt=" "
            width={32}
            height={32}
            className="aspect-square size-[32px] h-full rounded-lg object-cover"
          />
        )}
        {isUploading && <UpdateIcon className="mr-3 size-4 animate-spin text-muted-foreground" />}
      </div>
    </div>
  )
}

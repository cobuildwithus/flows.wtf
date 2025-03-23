/* eslint-disable @next/next/no-img-element */
import type { UploadedFile } from "@/lib/file-upload/use-file-uploads"
import { Loader2, Video } from "lucide-react"

interface Props {
  attachment: UploadedFile
  isUploading?: boolean
}

export const PreviewAttachment = (props: Props) => {
  const { attachment, isUploading = false } = props
  const { name, imageUrl, videoUrl, contentType } = attachment

  return (
    <div className="flex size-16">
      <div className="relative flex aspect-video w-full items-center justify-center rounded-md bg-secondary">
        {contentType?.startsWith("image") && (
          <img
            key={imageUrl}
            src={imageUrl}
            alt={name ?? " "}
            className="aspect-square size-full rounded-md object-cover"
          />
        )}
        {contentType?.startsWith("video") && (
          <div className="relative flex size-full items-center justify-center">
            <img
              src={imageUrl}
              alt={name ?? " "}
              className="aspect-square size-full rounded-md object-cover"
            />
            <Video className="absolute inset-0 m-auto size-8 text-white" />
          </div>
        )}

        {isUploading && (
          <div className="animate-spin text-muted-foreground">
            <Loader2 className="size-8" />
          </div>
        )}
      </div>
    </div>
  )
}

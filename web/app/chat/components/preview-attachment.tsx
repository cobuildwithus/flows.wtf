/* eslint-disable @next/next/no-img-element */
import type { UploadedFile } from "@/lib/file-upload/use-file-uploads"
import { Loader2, Video } from "lucide-react"

interface Props {
  attachment: UploadedFile
  isUploading?: boolean
  progress?: number
}

export const PreviewAttachment = (props: Props) => {
  const { attachment, isUploading = false, progress } = props
  const { name, imageUrl, videoUrl } = attachment

  return (
    <div className="flex size-16">
      <div className="relative flex aspect-square w-full items-center justify-center rounded-md bg-secondary">
        {imageUrl && (
          <img
            src={imageUrl}
            alt={name ?? " "}
            className="aspect-square size-full rounded-md object-cover"
          />
        )}
        {videoUrl && <Video className="absolute inset-0 m-auto size-8 text-white" />}

        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-md bg-primary text-secondary-foreground">
            <Loader2 className="size-12 animate-spin text-white" />
            {progress !== undefined && (
              <span className="absolute text-xs text-white">{progress}%</span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

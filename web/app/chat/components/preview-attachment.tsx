/* eslint-disable @next/next/no-img-element */
import { Attachment } from "ai"
import { Loader2, Video } from "lucide-react"

interface Props {
  attachment: Attachment
  isUploading?: boolean
}

export const PreviewAttachment = (props: Props) => {
  const { attachment, isUploading = false } = props
  const { name, url, contentType } = attachment

  return (
    <div className="flex w-20 shrink-0 flex-col md:w-28">
      <div className="relative flex aspect-video w-full items-center justify-center rounded-md bg-secondary">
        {contentType?.startsWith("image") && (
          <img
            key={url}
            src={url}
            alt={name ?? " "}
            className="aspect-video size-full rounded-md object-cover"
          />
        )}

        {contentType?.startsWith("video") && (
          <div className="flex size-full items-center justify-center">
            <Video className="size-6 text-secondary-foreground" />
          </div>
        )}

        {isUploading && (
          <div className="animate-spin text-muted-foreground">
            <Loader2 className="size-4" />
          </div>
        )}
      </div>
      {/* <div className="mt-1.5 max-w-full text-xs text-muted-foreground">{name}</div> */}
    </div>
  )
}

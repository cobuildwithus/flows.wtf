"use client"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useLogin } from "@/lib/auth/use-login"
import useWindowSize from "@/lib/hooks/use-window-size"
import { type UploadedFile, useFileUploads } from "@/lib/file-upload/use-file-uploads"
import { cn } from "@/lib/utils"
import { ArrowUp, Paperclip, StopCircle } from "lucide-react"
import { type ChangeEvent, useCallback, useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { useAgentChat } from "./agent-chat"
import { PreviewAttachment } from "./preview-attachment"

const maxFileSizes = {
  image: 15 * 1024 * 1024, // 15MB for images
  video: 200 * 1024 * 1024, // 200MB for videos
}

interface Props {
  rows?: number
  placeholder?: string
  className?: string
  onSubmit?: () => void
  autoFocus?: boolean
}

export function MultimodalInput(props: Props) {
  const { rows = 1, placeholder = "Ask anything", className, onSubmit, autoFocus = false } = props
  const { input, setInput, isLoading, stop, attachments, setAttachments, handleSubmit, user } =
    useAgentChat()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { width } = useWindowSize()
  const { login } = useLogin()
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const { uploadQueue, uploadFiles, progressMap, uploadingMap } = useFileUploads()

  useEffect(() => {
    if (textareaRef.current && input.trim()) adjustHeight()
  }, [input])

  const disabled = !user

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }

  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value)
    adjustHeight()
  }

  const fileInputRef = useRef<HTMLInputElement>(null)

  const submitForm = useCallback(() => {
    if (!input.trim() && uploadedFiles.length === 0) return

    handleSubmit(undefined, { experimental_attachments: attachments })

    setAttachments([])
    setUploadedFiles([])

    if (width && width > 768) {
      textareaRef.current?.focus()
    }

    onSubmit?.()
  }, [uploadedFiles, handleSubmit, setAttachments, width, input, onSubmit, attachments])

  return (
    <form
      className={cn("relative z-10 mx-auto flex w-full md:max-w-3xl", className)}
      onSubmit={(e) => {
        e.preventDefault()
        submitForm()
      }}
    >
      {!user && (
        <div className="absolute inset-0 z-20 cursor-pointer bg-transparent" onClick={login} />
      )}

      <div className="relative flex w-full flex-col gap-4">
        <input
          type="file"
          disabled={disabled}
          className="pointer-events-none fixed -left-4 -top-4 size-0.5 opacity-0"
          ref={fileInputRef}
          multiple
          onChange={async (event: ChangeEvent<HTMLInputElement>) => {
            const files = Array.from(event.target.files || [])

            const validFiles: File[] = []

            for (const file of files) {
              const fileType = file.type.startsWith("image/")
                ? "image"
                : file.type.startsWith("video/")
                  ? "video"
                  : null
              const maxAllowedSize = fileType ? maxFileSizes[fileType] : null

              if (!maxAllowedSize) {
                toast.error(`Unsupported file type: ${file.name}`, { duration: 3000 })
                continue
              }

              if (file.size > maxAllowedSize) {
                toast.error(
                  `Max file size for ${fileType === "image" ? "images" : "videos"} (${file.name}) is ${maxAllowedSize / 1024 / 1024}MB`,
                  { duration: 3000 },
                )
                continue
              }

              validFiles.push(file)
            }

            if (validFiles.length === 0) return

            const uploadedAttachments = await uploadFiles(validFiles, (uploadedFile) => {
              setUploadedFiles((current) => [...current, uploadedFile])
              setAttachments((current) => [
                ...current,
                {
                  ...uploadedFile,
                  url: uploadedFile.videoUrl ? uploadedFile.videoUrl : uploadedFile.imageUrl,
                },
              ])
            })

            if (fileInputRef.current) fileInputRef.current.value = ""
          }}
          tabIndex={-1}
          accept="image/*,video/*"
        />

        {(uploadedFiles.length > 0 || uploadQueue.length > 0) && (
          <div className="flex space-x-2.5 overflow-x-auto">
            {uploadedFiles.map((attachment) => (
              <PreviewAttachment
                key={attachment.imageUrl}
                attachment={attachment}
                progress={progressMap[attachment.name]}
                isUploading={uploadingMap[attachment.name]}
              />
            ))}

            {uploadQueue.map((filename) => (
              <PreviewAttachment
                key={filename}
                attachment={{ imageUrl: "", name: filename, contentType: "", videoUrl: "" }}
                isUploading={uploadingMap[filename]}
                progress={progressMap[filename]}
              />
            ))}
          </div>
        )}

        <div className="flex flex-col rounded-3xl border-none bg-card p-2 pb-0 text-sm focus-visible:ring-0 focus-visible:ring-offset-0 disabled:opacity-100 dark:bg-secondary">
          <Textarea
            autoFocus={autoFocus}
            ref={textareaRef}
            placeholder={placeholder}
            value={input}
            disabled={disabled}
            onChange={handleInput}
            className="max-h-32 min-h-6 resize-none overflow-scroll rounded-xl border-none bg-card p-4 text-sm shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 disabled:opacity-100 dark:bg-secondary"
            rows={rows}
            style={{ height: "auto" }}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault()

                if (isLoading) {
                  toast.error("Please wait for the model to finish its response!")
                } else if (!input.trim()) {
                  return
                } else {
                  submitForm()
                }
              }
            }}
          />
          <div className="flex w-full items-center justify-end gap-2 p-4 pt-0">
            <Button
              className="h-fit rounded-full p-2"
              onClick={(event) => {
                event.preventDefault()
                fileInputRef.current?.click()
              }}
              variant="outline"
              disabled={isLoading || disabled}
              type="button"
            >
              <Paperclip size={18} />
            </Button>

            {isLoading ? (
              <Button
                className="h-fit rounded-full p-2"
                type="button"
                disabled={disabled}
                onClick={(event) => {
                  event.preventDefault()
                  stop()
                }}
              >
                <StopCircle size={18} />
              </Button>
            ) : (
              <Button
                className="h-fit rounded-full p-2"
                onClick={(event) => {
                  event.preventDefault()
                  submitForm()
                }}
                disabled={!input.trim() || uploadQueue.length > 0 || disabled}
                type="submit"
              >
                <ArrowUp size={18} />
              </Button>
            )}
          </div>
        </div>
      </div>
    </form>
  )
}

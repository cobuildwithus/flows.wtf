interface Props {
  image?: string | null
}

export function TimelineIndicator({ image }: Props) {
  return (
    <div className="relative flex size-6 flex-none items-center justify-center">
      {!image && <div className="size-1.5 rounded-full bg-muted-foreground ring-1 ring-border" />}
      {image && (
        <img
          src={image}
          alt=" "
          className="size-6 rounded-full object-cover ring-1 ring-border"
          width={24}
          height={24}
        />
      )}
    </div>
  )
}

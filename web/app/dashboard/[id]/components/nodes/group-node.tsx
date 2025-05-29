import { cn, getIpfsUrl } from "@/lib/utils"
import { Handle, HandleType, Node, NodeProps, Position } from "@xyflow/react"
import Image from "next/image"
import { memo } from "react"

export type IGroupNode = Node<
  {
    label?: string
    image?: string
    handles?: Array<{ type: HandleType; position: Position; id?: string }>
    className?: string
    content?: React.ReactNode
    contentHeight?: number
  },
  "group"
>

function GroupNode(props: NodeProps<IGroupNode>) {
  const { data, width, height } = props
  const { label, image, className, content } = data

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border border-dashed border-primary/50 bg-primary/5 text-primary",
        className,
      )}
      style={{ width, height }}
    >
      {label && (
        <div className="mt-4 flex h-8 items-center justify-center gap-2 px-2">
          {image && (
            <Image
              src={getIpfsUrl(image)}
              alt={label}
              width={28}
              className="size-7 rounded-full"
              height={28}
            />
          )}
          <span className="text-[15px] font-medium">{label}</span>
        </div>
      )}
      {content}
    </div>
  )
}

export type IGroupAnchorNode = Node<
  { handles?: Array<{ type: HandleType; position: Position; id?: string }> },
  "groupAnchor"
>

export function GroupAnchorNode(props: NodeProps<IGroupNode>) {
  const { width, height, data } = props
  const { handles = [] } = data

  return (
    <div style={{ width, height }} className="pointer-events-none -z-10">
      {handles.map((handle) => (
        <Handle
          key={`${handle.type}-${handle.id}-${handle.position}`}
          type={handle.type}
          position={handle.position}
          id={handle.id}
          isConnectable={false}
        />
      ))}
    </div>
  )
}

export default memo(GroupNode)

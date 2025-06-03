import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Handle, HandleType, Node, NodeProps, Position } from "@xyflow/react"
import { memo, ReactNode } from "react"

export type IDashboardNode = Node<
  {
    title?: ReactNode | string[]
    content?: ReactNode
    handles?: Array<{ type: HandleType; position: Position; id?: string }>
    className?: string
  },
  "dashboard"
>

function DashboardNode(props: NodeProps<IDashboardNode>) {
  const { data, width, height } = props

  const { title, content, className = "", handles = [] } = data

  return (
    <div
      className={cn(
        "pointer-events-auto space-y-3 rounded-lg bg-background p-4 shadow dark:border dark:bg-background/40 dark:shadow-none",
        className,
      )}
      style={{ width, height }}
    >
      {title && (
        <div className="flex justify-between text-base font-medium">
          {Array.isArray(title) ? (
            <>
              <span>{title[0]}</span>
              <Badge className="text-sm" variant="secondary">
                {title[1]}
              </Badge>
            </>
          ) : (
            title
          )}
        </div>
      )}
      {content}
      {handles.map((handle) => (
        <Handle
          key={handle.type}
          type={handle.type}
          position={handle.position}
          id={handle.id}
          isConnectable={false}
        />
      ))}
    </div>
  )
}

export default memo(DashboardNode)

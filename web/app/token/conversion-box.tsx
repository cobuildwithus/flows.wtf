import { Label } from "@/components/ui/label"

export const ConversionBox = ({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) => (
  <div className="rounded-2xl bg-gray-100 p-4 dark:bg-gray-900">
    <Label
      htmlFor={label.toLowerCase()}
      className="text-sm font-normal text-gray-500 dark:text-white"
    >
      {label}
    </Label>
    <div className="mt-1">{children}</div>
  </div>
)

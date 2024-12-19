export const CurrencyInput = ({
  id,
  name,
  value,
  onChange,
  disabled = false,
  className = "",
}: {
  id: string
  name: string
  value: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  disabled?: boolean
  className?: string
}) => (
  <input
    id={id}
    name={name}
    value={value}
    type="number"
    autoComplete="off"
    onChange={onChange}
    autoFocus={false}
    disabled={disabled}
    className={`flex h-[40px] w-full appearance-none rounded-md border-none bg-transparent px-0 py-0 text-4xl font-medium leading-none tracking-tighter text-black shadow-none transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus:ring-0 focus-visible:outline-none disabled:cursor-not-allowed dark:text-white ${className}`}
  />
)

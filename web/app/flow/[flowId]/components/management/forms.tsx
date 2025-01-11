import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"

interface FormFieldProps {
  title: string
  functionName: string
  buttonText: string
  onSubmit: (e: React.FormEvent) => Promise<void>
  isSubmitting: boolean
  children: React.ReactNode
}

export const FormField = ({
  title,
  functionName,
  buttonText,
  onSubmit,
  isSubmitting,
  children,
}: FormFieldProps) => {
  return (
    <div>
      <p className="mb-2 text-xs font-medium text-muted-foreground">
        <code>{functionName}</code>
      </p>
      <form className="space-y-2" onSubmit={onSubmit}>
        {children}
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? `${title}...` : buttonText}
        </Button>
      </form>
    </div>
  )
}

interface NumberFormProps {
  title: string
  functionName: string
  placeholder: string
  buttonText: string
  onSubmit: (value: number) => Promise<void>
  prefill?: number
}

export const NumberForm = ({
  title,
  functionName,
  placeholder,
  buttonText,
  onSubmit,
  prefill,
}: NumberFormProps) => {
  const [number, setNumber] = useState<string>(prefill?.toString() || "")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await onSubmit(Number(number))
    } catch (error) {
      console.error(error)
    }
    setIsSubmitting(false)
  }

  return (
    <FormField
      title={title}
      functionName={functionName}
      buttonText={buttonText}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
    >
      <Input
        type="number"
        value={number}
        onChange={(e) => setNumber(e.target.value)}
        placeholder={placeholder}
        className="text-sm"
        disabled={isSubmitting}
      />
    </FormField>
  )
}

interface AddressFormProps {
  title: string
  functionName: string
  placeholder: string
  prefill?: string
  buttonText: string
  onSubmit: (address: `0x${string}`) => Promise<void>
}

export const AddressForm = ({
  title,
  functionName,
  placeholder,
  buttonText,
  onSubmit,
  prefill,
}: AddressFormProps) => {
  const [address, setAddress] = useState<string>(prefill || "")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await onSubmit(address as `0x${string}`)
    } catch (error) {
      console.error(error)
    }
    setIsSubmitting(false)
  }

  return (
    <FormField
      title={title}
      functionName={functionName}
      buttonText={buttonText}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
    >
      <Input
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder={placeholder}
        className="text-sm"
        disabled={isSubmitting}
      />
    </FormField>
  )
}

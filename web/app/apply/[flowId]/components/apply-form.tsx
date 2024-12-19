"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { FileInput } from "@/components/ui/file-input"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MarkdownInput } from "@/components/ui/markdown-input"
import { useLogin } from "@/lib/auth/use-login"
import { MAX_GRANTS_PER_USER } from "@/lib/config"
import { meetsMinimumSalary } from "@/lib/database/helpers"
import { getShortEthAddress } from "@/lib/utils"
import { DerivedData, Grant } from "@prisma/flows"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useFormStatus } from "react-dom"
import { toast } from "sonner"
import { useAccount } from "wagmi"
import { saveDraft } from "./save-draft"
import { useRecipientExists } from "./useRecipientExists"

interface Props {
  flow: Grant & { derivedData: DerivedData | null }
  isFlow: boolean
  template: string
  userActiveGrants: number
}

export function ApplyForm(props: Props) {
  const { flow, isFlow, template, userActiveGrants } = props
  const { isConnected, address } = useAccount()
  const { login } = useLogin()

  const router = useRouter()
  const [isGuest, setIsGuest] = useState(true)

  useEffect(() => {
    setIsGuest(!isConnected)
  }, [isConnected])

  const recipientExists = useRecipientExists(flow.recipient, address)

  const isMaxGrantsReached = !isFlow && userActiveGrants >= MAX_GRANTS_PER_USER

  async function handleSubmit(formData: FormData) {
    if (!isConnected) {
      toast.error("You need to sign in to submit the application")
      return
    }

    if (recipientExists) {
      toast.error("You have already applied to this flow")
      return
    }

    if (isMaxGrantsReached) {
      toast.error("You have reached the maximum number of active grants")
      return
    }

    const result = await saveDraft(formData, address)
    if (result.error) {
      toast.error(result.error)
    } else {
      router.push(`/draft/${result.id}`)
      toast.success("Draft saved!")
    }
  }

  return (
    <form action={handleSubmit} className="flex grow flex-col space-y-6">
      {recipientExists && (
        <Alert variant="destructive">
          <AlertTitle className="text-base">You have already applied to this flow</AlertTitle>
          <AlertDescription>
            User {getShortEthAddress(address!)} already exists as a recipient in the &quot;
            {flow.title}&quot; flow.
            <br />
            Only one application per user is allowed.
          </AlertDescription>
        </Alert>
      )}

      {isMaxGrantsReached && (
        <Alert variant="destructive">
          <AlertTitle className="text-base">
            You have reached the maximum number of active grants
          </AlertTitle>
          <AlertDescription>You can&apos;t apply for another grant</AlertDescription>
        </Alert>
      )}

      {isGuest && (
        <Alert variant="warning" className="flex items-center justify-between space-x-4">
          <div>
            <AlertTitle className="text-base">Connect your wallet</AlertTitle>
            <AlertDescription>You need to sign in to submit the application.</AlertDescription>
          </div>
          <Button onClick={() => login()} type="button">
            Connect Wallet
          </Button>
        </Alert>
      )}

      {!isFlow && !meetsMinimumSalary(flow) && (
        <Alert variant="warning">
          <AlertTitle className="text-base">This flow is not accepting new grants</AlertTitle>
          <AlertDescription>
            &quot;{flow.title}&quot; cannot accept any more grants at this time. You can still
            create a new draft, but you won&apos;t be able to publish it until new spots open up.
          </AlertDescription>
        </Alert>
      )}

      {isFlow && (
        <Alert variant="warning">
          <AlertTitle className="text-base">This is not a grant application!</AlertTitle>
          <AlertDescription>
            You&apos;re about to suggest new flow (budget category) to add to the platform.
            You&apos;re not applying for a grant and you won&apos;t earn any salary upon succesful
            application. Return to the apply page to create a grant that fits within a specific
            flow.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <input type="hidden" name="flowId" value={flow.id} />
        <input type="hidden" name="isFlow" value={isFlow ? "1" : "0"} />
        <div className="space-y-1.5">
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" />
        </div>

        <div className="space-y-1.5">
          <Label>Image (square)</Label>
          <FileInput name="image" accept="image/jpeg,image/png,image/webp,image/svg+xml" />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="tagline">Tagline</Label>
        <Input placeholder="Short and sweet" id="tagline" name="tagline" />
      </div>

      <div className="flex grow flex-col space-y-1.5">
        <Label>Description</Label>
        <MarkdownInput
          name="description"
          initialValue={template}
          minHeight={320}
          className="grow"
        />
      </div>

      <div className="flex flex-col max-sm:space-y-4 md:flex-row md:items-center md:justify-between md:space-x-2.5">
        <div className="items-top flex space-x-2">
          <Checkbox id="requirements" name="requirements" />
          <div className="grid gap-1.5 leading-none">
            <label
              htmlFor="requirements"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Accept terms and conditions
            </label>
            <p className="text-sm text-muted-foreground">
              My application matches the flow requirements and guidelines
            </p>
          </div>
        </div>

        <SubmitButton disabled={recipientExists || isGuest || isMaxGrantsReached} />
      </div>
    </form>
  )
}

function SubmitButton(props: { disabled: boolean }) {
  const { disabled } = props
  const { pending } = useFormStatus()

  return (
    <Button type="submit" size="lg" disabled={pending || disabled}>
      Save draft
    </Button>
  )
}

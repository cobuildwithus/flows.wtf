import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function BuyToken() {
  return (
    <form className="pointer-events-auto flex flex-col gap-3">
      <fieldset className="space-y-1">
        <Label htmlFor="pay" className="text-sm text-muted-foreground">
          Pay
        </Label>

        <div className="relative flex items-center gap-2.5">
          <Input id="pay" className="h-11 text-base" type="number" min={1} defaultValue={50} />
          <span className="absolute right-3 text-sm">USD</span>
        </div>
      </fieldset>
      <fieldset className="space-y-1">
        <Label htmlFor="receive" className="text-sm text-muted-foreground">
          Receive
        </Label>
        <div className="relative flex items-center gap-2.5">
          <Input
            id="receive"
            className="h-11 text-base"
            type="number"
            min={1}
            defaultValue={2000}
          />
          <span className="absolute right-3 text-sm">$BEANS</span>
        </div>
      </fieldset>
      <Button variant="default" size="lg">
        Buy $BEANS
      </Button>
    </form>
  )
}

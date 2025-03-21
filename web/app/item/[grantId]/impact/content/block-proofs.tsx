import type { Impact } from "@prisma/flows"
import { BlockCasts } from "./block-casts"
import { BlockMedia } from "./block-media"

interface Props {
  proofs: Impact["proofs"]
  name: string
}

export function BlockProofs(props: Props) {
  const { proofs, name } = props

  const hasMedia = proofs.some((proof) => proof.images.length > 0 || proof.videos.length > 0)

  return (
    <>
      <h3 className="pb-4 text-xs font-medium uppercase tracking-wide opacity-85 md:hidden">
        {hasMedia ? "Media" : "Proof"}
      </h3>
      {hasMedia ? <BlockMedia proofs={proofs} name={name} /> : <BlockCasts proofs={proofs} />}
    </>
  )
}

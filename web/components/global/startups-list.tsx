import { LimitedGrant } from "@/lib/database/types"
import { getStartupsForAccelerator } from "@/app/(custom-flow)/get-startups-for-accelerator"
import { StartupsTable } from "../homepage/startups-table"

interface Props {
  flow: LimitedGrant
}

export default async function StartupsList(props: Props) {
  const { flow } = props

  const startups = await getStartupsForAccelerator(flow.id)

  return <StartupsTable startups={startups} />
}

import { Dialog, DialogTrigger, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Stat } from "@/app/item/[grantId]/cards/stats"
import { Grant } from "@prisma/flows"
import { InfoIcon } from "lucide-react"
import Link from "next/link"
export function TotalUsersExplainerDialog({
  users,
  flow,
}: {
  users: { uniqueUsers: number; numCurators: number; numVoters: number; numRecipients: number }
  flow: Omit<Grant, "description">
}) {
  const { uniqueUsers, numCurators, numVoters, numRecipients } = users

  return (
    <Dialog>
      <DialogTrigger className="group relative col-span-full text-left duration-200 hover:scale-[1.02] xl:col-span-3">
        <div className="col-span-full xl:col-span-3">
          <Stat label="Onchain users">
            {uniqueUsers}
            <InfoIcon className="absolute right-4 top-4 size-6 opacity-0 transition-opacity duration-200 group-hover:opacity-75" />
          </Stat>
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Onchain users</DialogTitle>
        <div className="mt-4 space-y-2 text-sm text-muted-foreground">
          <p>
            <Badge variant="outline">Onchain users</Badge> represents the total number of unique
            addresses that have interacted with this flow ({uniqueUsers}).
          </p>
          <p>This includes:</p>
          <ul className="list-inside list-disc pl-2">
            <li>
              <strong>Curators:</strong> {numCurators} token holders
            </li>
            <li>
              <strong>Voters:</strong> {numVoters} addresses voted on grants
            </li>
            <li>
              <strong>Grantees:</strong> {numRecipients} wallets received funds
            </li>
          </ul>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <p className="w-full text-sm text-muted-foreground">Relevant contracts:</p>
          {flow.erc20 && <ContractLink address={flow.erc20} label="ERC20" />}
          <ContractLink address={flow.recipient} label="Flow" />
          {flow.tokenEmitter && <ContractLink address={flow.tokenEmitter} label="Token Emitter" />}
          {flow.arbitrator && <ContractLink address={flow.arbitrator} label="Arbitrator" />}
          {flow.bonusPool && <ContractLink address={flow.bonusPool} label="Bonus Pool" />}
          {flow.baselinePool && <ContractLink address={flow.baselinePool} label="Baseline Pool" />}
          {flow.tcr && <ContractLink address={flow.tcr} label="TCR" />}
          {flow.managerRewardPool && (
            <ContractLink address={flow.managerRewardPool} label="Manager Reward Pool" />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function ContractLink({ address, label }: { address: string; label: string }) {
  return (
    <Link
      href={`https://basescan.org/address/${address}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      <Badge variant="secondary" className="cursor-pointer hover:opacity-80">
        {label}
      </Badge>
    </Link>
  )
}

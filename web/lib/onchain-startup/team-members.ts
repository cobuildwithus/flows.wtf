import { getUserProfile, Profile } from "@/components/user-profile/get-user-profile"
import database from "@/lib/database/flows-db"
import { getStartupBudgets } from "./budgets"

export type TeamMember = {
  recipient: string
  monthlyIncomingFlowRate: number
  totalEarned: number
  tagline: string
} & Profile

export async function getTeamMembers(id: string): Promise<TeamMember[]> {
  const budgets = await getStartupBudgets(id)

  const [recipients, founder] = await Promise.all([
    database.grant.findMany({
      select: {
        recipient: true,
        monthlyIncomingFlowRate: true,
        totalEarned: true,
        tagline: true,
      },
      where: { parentContract: { in: budgets.map((b) => b.id) }, isActive: true },
    }),
    getUserProfile("0xa5dd97000e0f5311B4dDc71f3a1E6A5b0C74aCE3"),
  ])

  const uniqueMembers = Object.values(
    recipients.reduce(
      (acc, { recipient, monthlyIncomingFlowRate, totalEarned, tagline }) => {
        acc[recipient] ??= {
          recipient,
          monthlyIncomingFlowRate: 0,
          totalEarned: 0,
          tagline: tagline || "",
        }
        acc[recipient].monthlyIncomingFlowRate += Number(monthlyIncomingFlowRate)
        acc[recipient].totalEarned += Number(totalEarned)
        return acc
      },
      {} as Record<string, Omit<TeamMember, keyof Profile>>,
    ),
  )

  const members = await Promise.all(
    uniqueMembers.map(async (member) => {
      const profile = await getUserProfile(member.recipient as `0x${string}`)
      return { ...member, ...profile }
    }),
  )

  return members
}

import { UserProfile } from "@/components/user-profile/user-profile"

export async function Challenger({ address }: { address: `0x${string}` }) {
  return (
    <li>
      <span className="text-yellow-500">Challenged by</span>{" "}
      <UserProfile address={address}>
        {(profile) => <span className="font-medium text-primary">{profile.display_name}</span>}
      </UserProfile>
    </li>
  )
}

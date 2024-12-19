import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import database from "@/lib/database/edge"
import { getPool } from "@/lib/database/queries/pool"
import {
  AngleIcon,
  EyeOpenIcon,
  GlobeIcon,
  LayersIcon,
  LightningBoltIcon,
  MagnifyingGlassIcon,
  StarFilledIcon,
  TargetIcon,
  TokensIcon,
} from "@radix-ui/react-icons"
import { Metadata } from "next"
import Image from "next/image"
import { SwapTokenButton } from "../token/swap-token-button"
import Illustration from "./curate.svg"

export async function generateMetadata(): Promise<Metadata> {
  const pool = await getPool()
  return {
    title: `Curate and Earn | ${pool.title}`,
    description:
      "Join our community of curators to manage the flows list and ensure the highest quality projects are funded.",
  }
}

export default async function CurateAndEarnPage() {
  const pool = await getPool()

  const flows = await database.grant.findMany({
    where: { isFlow: true, isActive: true, isTopLevel: false },
    orderBy: { title: "asc" },
  })

  return (
    <>
      <div className="container">
        <section className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between space-y-8 pt-8 sm:pb-16 md:pt-16 lg:flex-row lg:space-x-4 lg:space-y-0">
          <div className="max-w-lg">
            <h2 className="text-base font-semibold text-primary lg:leading-7">Curate and Earn</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Become a Curator
            </p>
            <p className="mt-4 text-base text-muted-foreground lg:mt-6 lg:text-lg lg:leading-8">
              Join our community of curators to manage the flows list and ensure the highest quality
              projects are funded.
            </p>
            <p className="mt-4 text-base text-muted-foreground lg:text-lg">
              As a Curator you have two jobs that you will be rewarded for:
            </p>
            <dl className="mt-6 space-y-8 text-base text-muted-foreground lg:mt-10 lg:leading-7">
              {[
                {
                  name: "Review Applications",
                  description: "Evaluate new flows, challenge if needed, and vote on acceptance",
                  icon: MagnifyingGlassIcon,
                },
                {
                  name: "Monitor Projects",
                  description:
                    "Track progress of funded flows. Challenge inactive or declining projects",
                  icon: EyeOpenIcon,
                },
              ].map((job) => (
                <div key={job.name} className="relative pl-9">
                  <dt className="inline font-semibold text-foreground">
                    <job.icon
                      aria-hidden="true"
                      className="absolute left-1 top-1 size-5 text-primary"
                    />
                    {job.name}
                  </dt>
                  {". "}
                  <dd className="inline">{job.description}</dd>
                </div>
              ))}
            </dl>
          </div>
          <Image
            alt="Curator illustration"
            src={Illustration}
            width={500}
            className="lg:shrink-0"
          />
        </section>
      </div>

      <div className="bg-white/75 py-8 dark:bg-secondary/25 lg:py-16">
        <section className="container">
          <div className="mx-auto w-full max-w-6xl">
            <div className="mx-auto max-w-3xl">
              <h2 className="text-center text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Curation process
              </h2>
              <p className="mt-6 text-center text-muted-foreground lg:leading-8">
                Our decentralized & permissionless grants system is based on{" "}
                <a
                  href="https://medium.com/@ilovebagels/token-curated-registries-1-0-61a232f8dac7"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Token Curated Registries (TCR)
                </a>
                . It&apos;s fully up to the community to curate flow recipients.
              </p>
            </div>
            <div className="mx-auto mt-12 max-w-2xl sm:mt-20 lg:max-w-none">
              <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-12 lg:max-w-none lg:grid-cols-3 lg:gap-y-16">
                {[
                  {
                    name: "Open to Everyone",
                    description: (
                      <>
                        Anyone can become a curator, regardless of background or experience. We
                        value diverse perspectives and expertise.
                      </>
                    ),
                    icon: GlobeIcon,
                  },
                  {
                    name: "Choose Your Category",
                    description: (
                      <>
                        Curate flows that align with your interests and expertise:
                        <ul className="mt-2 list-inside list-disc">
                          {flows.slice(0, 6).map((flow) => (
                            <li key={flow.id}>{flow.title}</li>
                          ))}
                          {flows.length > 6 && (
                            <li>
                              <Tooltip>
                                <TooltipTrigger className="cursor-help">
                                  and <u>{flows.length - 6} more</u>...
                                </TooltipTrigger>
                                <TooltipContent>
                                  <ul className="list-inside list-disc">
                                    {flows.slice(6).map((flow) => (
                                      <li key={flow.id}>{flow.title}</li>
                                    ))}
                                  </ul>
                                </TooltipContent>
                              </Tooltip>
                            </li>
                          )}
                        </ul>
                      </>
                    ),
                    icon: LayersIcon,
                  },
                  {
                    name: "Flow Token",
                    description: (
                      <>
                        Each flow has its own ERC20 token. Purchasing these tokens makes you a
                        curator for that specific flow.
                      </>
                    ),
                    icon: TokensIcon,
                  },
                ].map((feature) => (
                  <div key={feature.name} className="flex flex-col">
                    <dt className="text-base font-semibold text-foreground lg:leading-7">
                      <div className="mb-6 flex size-10 items-center justify-center rounded-lg bg-primary">
                        <feature.icon
                          aria-hidden="true"
                          className="size-6 text-primary-foreground"
                        />
                      </div>
                      {feature.name}
                    </dt>
                    <dd className="mt-1 flex flex-auto flex-col text-pretty text-base text-muted-foreground lg:leading-7">
                      {feature.description}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>
      </div>

      <div className="bg-white py-8 dark:bg-secondary/50 lg:py-16">
        <section className="container">
          <div className="mx-auto w-full max-w-5xl">
            <div className="mx-auto max-w-2xl lg:text-center">
              <h2 className="text-base font-semibold text-primary lg:leading-7">
                Curation rewards
              </h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                How can you earn?
              </p>
              <p className="mt-6 text-base text-muted-foreground lg:text-lg">
                As a curator, you have multiple opportunities to earn rewards in USDC and Flow
                Tokens (ERC 20)
              </p>
            </div>
            <div className="mx-auto mt-16 sm:mt-20">
              <dl className="grid grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
                {[
                  {
                    icon: TargetIcon,
                    name: "Challenge Rewards",
                    description:
                      "Earn flow tokens by successfully challenging flow applications. When an application is rejected after your challenge, you receive the applicant's token fee.",
                  },
                  {
                    icon: StarFilledIcon,
                    name: "Voting Rewards",
                    description:
                      "Participate in voting and earn tokens for voting for correct outcomes. Arbitrator cost tokens are split among voters who choose the winning side.",
                  },
                  {
                    icon: LightningBoltIcon,
                    name: "Pool Rewards",
                    description: (
                      <>
                        10% of flow budgets is distributed to all token holders, rewarding your
                        participation in the ecosystem.
                      </>
                    ),
                  },
                  {
                    icon: AngleIcon,
                    name: "Token Appreciation",
                    description:
                      "If you make an effort to curate a flow that allocates its budget effectively, the token price might reflect this success. This all assumes that you do a good job participating in curation.",
                  },
                ].map((feature) => (
                  <div key={feature.name} className="relative pl-16">
                    <dt className="text-base font-semibold text-foreground lg:leading-7">
                      <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                        <feature.icon
                          aria-hidden="true"
                          className="h-6 w-6 text-primary-foreground"
                        />
                      </div>
                      {feature.name}
                    </dt>
                    <dd className="mt-2 text-base text-muted-foreground lg:leading-7">
                      {feature.description}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          <div className="mx-auto mt-16 w-full max-w-6xl rounded-xl bg-primary/10 lg:mt-24">
            <div className="px-6 py-6 lg:flex lg:items-center lg:justify-between lg:px-12 lg:py-16">
              <div className="mb-8 lg:mb-0">
                <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                  Want to become a curator?
                </h2>
                <h3 className="mt-2.5 text-lg text-foreground/75">
                  Buy tokens and curate to earn rewards.
                </h3>
              </div>
              <div className="flex flex-col items-start gap-y-4 lg:flex-row lg:items-center lg:gap-x-4">
                <SwapTokenButton
                  text="Become curator"
                  size="lg"
                  defaultTokenAmount={BigInt(1e18)}
                  flow={pool}
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}

import { StartupData } from "./interface"

export const straystrong = {
  slug: "straystrong",
  acceleratorId: "vrbs",
  title: "Stray Strong",
  image:
    "https://revolution.mypinata.cloud/ipfs/bafybeigmeh2oqgbkeenfl7lbx6pajmqebhx23scanjw6qb3awnzseppy6e",
  shortMission: "Feeding strays for life",
  longMission: `
  We turn recycled plastic into playful feeders that spark care on every corner. Fueling a forever cycle of street art, animal love and return for the initiatives that support us.`,
  // shopify: {
  //   url: "8fab74-1b.myshopify.com",
  //   adminApiAccessToken: `${process.env.SHOPIFY_STRAY_STRONG}`,
  // },
  // impactFlowId: "0x5a0b34e575c46b657d0dba5c87f74380987204c8",
  socialUsernames: {
    x: "FOUNSSSS",
    farcasterChannel: "straystrong",
  },
  reviews: [
    {
      url: "https://farcaster.xyz/nickhaaz/0x92ccfe42",
      image:
        "https://wrpcd.net/cdn-cgi/imagedelivery/BXluQx4ige9GuW0Ia56BHw/b1f260f3-6bef-4249-9c0f-1dbb41b05000/rectcontain3",
    },
    {
      url: "https://farcaster.xyz/nickhaaz/0x0c960885",
      image:
        "https://wrpcd.net/cdn-cgi/imagedelivery/BXluQx4ige9GuW0Ia56BHw/551f230d-ffd4-4eb1-790e-c60c58039000/rectcontain3",
    },
    {
      url: "https://farcaster.xyz/nickhaaz/0x95d06fe2",
      image:
        "https://wrpcd.net/cdn-cgi/imagedelivery/BXluQx4ige9GuW0Ia56BHw/054585df-2f1d-47ce-fa73-fa50ffa2e200/rectcontain3",
    },
    {
      url: "https://farcaster.xyz/nickhaaz/0x9fc015e2",
      image:
        "https://wrpcd.net/cdn-cgi/imagedelivery/BXluQx4ige9GuW0Ia56BHw/c3314210-21cb-4475-6466-1fbd664faa00/rectcontain3",
    },
  ],
  diagram: {
    action: { name: "Order feeder" },
    receive: {
      name: "Recycled feeders",
      description: "Playful feeders that spark care on every corner",
    },
  },
  revnetProjectId: 108,
} as StartupData

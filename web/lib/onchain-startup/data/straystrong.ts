import { StartupData } from "./interface"

export const straystrong = {
  acceleratorId: "vrbs",
  title: "Stray Strong",
  image:
    "https://revolution.mypinata.cloud/ipfs/bafybeigmeh2oqgbkeenfl7lbx6pajmqebhx23scanjw6qb3awnzseppy6e",
  shortMission: "Feeding strays for life.",
  longMission: `
  We turn recycled plastic into playful feeders that spark care on every corner. Fueling a forever cycle of street art, animal love and return for the initiatives that support us.`,
  // shopify: {
  //   url: "8fab74-1b.myshopify.com",
  //   adminApiAccessToken: `${process.env.SHOPIFY_STRAY_STRONG}`,
  // },
  // impactFlowId: "0x5a0b34e575c46b657d0dba5c87f74380987204c8",
  socialUsernames: {
    x: "FOUNSSSS",
    farcasterChannel: "nickhaaz",
  },
  reviews: [
    {
      url: "https://farcaster.xyz/coolbeans1r/0x084e82f6",
      image:
        "https://wrpcd.net/cdn-cgi/imagedelivery/BXluQx4ige9GuW0Ia56BHw/3097ea4c-a919-4f0a-3738-8f1ecdef5000/rectcontain3",
    },
    {
      url: "https://farcaster.xyz/rocketman/0x136e36aa",
      image:
        "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/cc70cf70-395c-4937-cfca-15618fe0d900/original",
    },
    {
      url: "https://farcaster.xyz/coolbeans1r.eth/0x5ef9a347",
      image:
        "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/1c6f7f8b-a8c2-49d0-14ca-3b434c0aed00/original",
    },
    {
      url: "https://farcaster.xyz/rocketman/0x139bb055",
      image:
        "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/a85b8da4-b246-4ae2-175c-e14539c46500/original",
    },
    {
      url: "https://farcaster.xyz/coolbeans1r.eth/0x64ad0e4e",
      image:
        "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/5e973b20-0817-4da4-2c35-2ca29e89d000/original",
    },
  ],
  diagram: {
    action: { name: "Order feeder" },
    receive: {
      name: "Recycled plastic feeder",
      description: "Playful feeders that spark care on every corner",
    },
  },
} as StartupData

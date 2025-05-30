import { StartupData } from "./interface"

export const vrbscoffee = {
  accelerator: "vrbs", // path: /vrbs
  revnetProjectId: 3,
  title: "VRBS Coffee",
  tagline: "Good Coffee for a Good Cause",
  image:
    "https://imagedelivery.net/BXluQx4ige9GuW0Ia56BHw/716dbbeb-c537-4b65-a843-6f96f39a7200/original",
  mission: "To make the best coffee in the world",
  deliverables: ["Ground coffee", "Community", "Positive impact"],
  shopify: {
    url: "8fab74-1b.myshopify.com",
    adminApiAccessToken: `${process.env.SHOPIFY_VRBS_COFFEE}`,
  },
  supports: [
    "0x1ebcea729ab7e71b363fda3c57b75d9e39845ddd26e20421394d96f4fe31c991",
    "0x734975caced090388c6f507733a4c2ec4ca33acf8c72e94386bed35f805c24db",
  ],
  socialUsernames: {
    x: "vrbscoffee",
    instagram: "vrbscoffee",
    tiktok: "vrbscoffee",
    farcasterChannel: "vrbscoffee",
  },
  reviews: [
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
    action: { name: "Order coffee" },
    receive: {
      name: "Fresh roasted coffee",
      description: "Beans ready for your cup of espresso or pour over",
    },
  },
  splits: {
    team: 0.8,
    support: 0.1,
    treasury: 0.1,
    costs: [],
  },
} as StartupData

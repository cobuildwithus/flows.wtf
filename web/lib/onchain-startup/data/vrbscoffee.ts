import { StartupData } from "./interface"

export const vrbscoffee = {
  accelerator: "vrbs", // path: /vrbs
  title: "VRBS Coffee",
  tagline: "The best coffee in the world",
  image:
    "https://wrpcd.net/cdn-cgi/imagedelivery/BXluQx4ige9GuW0Ia56BHw/6b5db00e-b79a-422a-0a51-3f0abe50e000/original",
  mission: "To make the best coffee in the world",
  deliverables: ["Ground coffee", "Coffee beans", "Coffee accessories"],
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
  gradients: {
    mission: {
      light: { gradientStart: "#FFF6D5", gradientEnd: "#C2A878", text: "#2D1B00" },
      dark: { gradientStart: "#4B2E05", gradientEnd: "#BFA76A", text: "#FFF6D5" },
    },
    deliverables: {
      light: { gradientStart: "#B6E388", gradientEnd: "#FFF6D5", text: "#1A3A1A" },
      dark: { gradientStart: "#295C2F", gradientEnd: "#BFA76A", text: "#FFFDEB" },
    },
  },
  ticker: "$BEANS",
  diagram: {
    action: { name: "Order coffee" },
    receive: {
      name: "Fresh roasted coffee",
      description: "Beans ready for your cup of espresso or pour over",
    },
  },
  splits: {
    team: 0.4,
    support: 0.1,
    treasury: 0.1,
    costs: [
      {
        name: "Farmers & Roasting",
        amount: 0.4,
        image:
          "https://images.unsplash.com/photo-1746623691157-c4c7a3bad0c4?q=80&w=1750&auto=format&fit=crop",
        description: "Plantation X in Peru",
      },
    ],
  },
} satisfies StartupData

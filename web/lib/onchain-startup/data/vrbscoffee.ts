import { StartupData } from "./interface"

export const vrbscoffee = {
  accelerator: "vrbs", // path: /vrbs
  revnetProjectId: 3,
  title: "VRBS Coffee",
  tagline: "Good Coffee for a Good Cause",
  image:
    "https://scontent-ber1-1.cdninstagram.com/v/t51.29350-15/468108864_571413815753192_1418108689951560966_n.jpg?stp=dst-jpg_e35_p480x480_tt6&efg=eyJ2ZW5jb2RlX3RhZyI6IkZFRUQuaW1hZ2VfdXJsZ2VuLjE0NDB4MTgwMC5zZHIuZjI5MzUwLmRlZmF1bHRfaW1hZ2UifQ&_nc_ht=scontent-ber1-1.cdninstagram.com&_nc_cat=108&_nc_oc=Q6cZ2QHYcnrbJ92cLhoiBEMHlt29MXWirXPBIC5_RPaaLWtKQD4B4BdpTPo2B1_Cdld4yaHy8HTuEkK8yv1LdUj2DBtE&_nc_ohc=45WmE6DHEOQQ7kNvwH3MP8f&_nc_gid=wPGQCEGNRxryJphplmhULw&edm=APoiHPcBAAAA&ccb=7-5&ig_cache_key=MzUwODkxNDkyODEyNTkzNDM5MQ%3D%3D.3-ccb7-5&oh=00_AfKLXIuRsoteihqts40Yu8kb5qbJqSViF3He24y0pqBViQ&oe=6843A4C7&_nc_sid=22de04",
  mission: "Caffeinate your calling",
  longMission: `
  Vrbs Coffee exists to fuel people on a mission. Whether that's chasing a creative idea, training for a race, or giving back to the world.
  We craft great coffee that powers purpose, and we use our profits to support causes that matter.`,
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
  },
} as StartupData

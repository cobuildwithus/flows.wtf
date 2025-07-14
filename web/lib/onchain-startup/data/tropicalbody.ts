import { StartupData } from "./interface"

export const tropicalbody = {
  slug: "tropicalbody",
  acceleratorId: "vrbs",
  title: "Tropicalbody",
  image:
    "https://dmo9tcngmx442k9p.public.blob.vercel-storage.com/IMG_5140-Jdvg0kWVkBH9y5MmOl8KkALAoBIlz3.jpeg",
  shortMission: "Move to live better",
  longMission: `
  We seek to encourage people to move, thus helping to combat chronic diseases caused by a sedentary lifestyle, improve mobility to reduce the number of falls and consequently the need for hospitals, and bring together the community.`,
  // shopify: {
  //   url: "8fab74-1b.myshopify.com",
  //   adminApiAccessToken: `${process.env.SHOPIFY_TROPICAL_BODY}`,
  // },
  // impactFlowId: "0x5a0b34e575c46b657d0dba5c87f74380987204c8",
  socialUsernames: {
    instagram: "tropicalbodybrasil",
    farcasterChannel: "tropicalbody",
  },
  reviews: [
    {
      url: "https://farcaster.xyz/tropicalbody/0x029ca2d7",
      image:
        "https://wrpcd.net/cdn-cgi/imagedelivery/BXluQx4ige9GuW0Ia56BHw/b168f80d-32b6-44da-6387-2db02c5e4000/rectcontain3",
    },
    {
      url: "https://farcaster.xyz/tropicalbody/0x71de05c1",
      image:
        "https://wrpcd.net/cdn-cgi/imagedelivery/BXluQx4ige9GuW0Ia56BHw/1dc0783d-e15a-4161-57e2-1aa21c466e00/rectcontain3",
    },
  ],
  diagram: {
    action: { name: "Book pilates class" },
    receive: {
      name: "Pilates session",
      description: "Movement classes to improve mobility and combat sedentary lifestyle",
    },
  },
} as StartupData

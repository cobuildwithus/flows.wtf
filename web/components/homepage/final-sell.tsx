import { Button } from "@/components/ui/button"
import Image from "next/image"
import Flows from "@/public/logo.png"

export function FinalSell() {
  return (
    <section className="relative overflow-hidden">
      {/* Gradient background */}
      <div
        className="bg-gradient-radial absolute inset-0 from-emerald-600 via-teal-700 to-blue-900 dark:from-emerald-800 dark:via-teal-900 dark:to-blue-950"
        style={{
          background:
            "radial-gradient(circle at center, rgb(5 150 105), rgb(15 118 110), rgb(30 58 138))",
          ...(typeof window !== "undefined" &&
            window.matchMedia("(prefers-color-scheme: dark)").matches && {
              background:
                "radial-gradient(circle at center, rgb(6 95 70), rgb(19 78 74), rgb(23 37 84))",
            }),
        }}
      />

      <div className="container relative z-10 mx-auto px-4 py-24 text-center text-white">
        {/* Flows Logo */}
        <div className="mb-12 flex justify-center">
          <Image src={Flows} alt="Flows" className="h-20 w-auto drop-shadow-2xl md:h-40" />
        </div>

        {/* Heading */}
        <h2 className="mb-6 text-4xl font-semibold leading-normal md:text-5xl lg:text-6xl">
          Fund What Matters.
          <br />
          Maximize Growth.
        </h2>

        {/* Description */}
        <p className="mx-auto mb-10 max-w-3xl text-lg text-white/90 md:text-xl">
          We help you efficiently fund 1000s of top builders in real time to maximize the growth of
          your ecosystem.
        </p>
        {/* CTA Button */}
        <Button
          size="lg"
          className="bg-white px-8 py-6 text-lg font-medium text-blue-900 hover:bg-white/90"
          asChild
        >
          <a href="mailto:rocketman@justco.build?subject=I%20want%20to%20run%20a%20grants%20program%20for%20my%20project">
            Partner with Flows
          </a>
        </Button>
      </div>
    </section>
  )
}

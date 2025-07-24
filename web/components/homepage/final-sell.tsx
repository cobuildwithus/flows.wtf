import { Button } from "@/components/ui/button"
import Image from "next/image"
import Flows from "@/public/logo.png"

export function FinalSell() {
  return (
    <section className="relative overflow-hidden">
      <div className="container relative z-10 mx-auto px-4 py-24 text-center">
        {/* Flows Logo */}
        <div className="mb-12 flex justify-center">
          <Image src={Flows} alt="Flows" className="h-20 w-auto drop-shadow-2xl md:h-40" />
        </div>

        {/* Heading */}
        <h2 className="mb-6 text-3xl font-semibold leading-normal md:text-5xl lg:text-6xl">
          Fund What Matters.
          <br />
          Maximize Growth.
        </h2>

        {/* Description */}
        <p className="mx-auto mb-10 max-w-3xl text-base md:text-xl">
          We help you efficiently fund 1000s of top builders in real time to maximize the growth of
          your ecosystem.
        </p>
        {/* CTA Button */}
        <Button
          size="lg"
          className="bg-white px-8 py-6 font-medium text-blue-900 hover:bg-white/90 md:text-lg"
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

"use client" // Error components must be Client Components

import Image from "next/image"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="container flex min-h-[calc(100vh-200px)] flex-col items-center justify-center">
      <div className="mx-auto flex max-w-md flex-col items-center space-y-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Oops!</h1>
        <p className="text-lg text-muted-foreground">
          Sorry about that. Something went wrong on our end.
        </p>

        <div className="relative aspect-square w-64 overflow-hidden rounded-lg">
          <Image
            src="https://media.giphy.com/media/13CoXDiaCcCoyk/giphy.gif"
            alt="Dancing cat"
            fill
            className="object-cover"
            priority
          />
        </div>
        <Button asChild size="lg" className="min-w-[200px]">
          <Link href="/">Go home</Link>
        </Button>
      </div>
    </div>
  )
}

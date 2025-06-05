"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { TrendingUp, Coins, Shield, Users } from "lucide-react"
import { DAOInfoDialog } from "./dao-info-dialog"

interface AnimatedBenefitsProps {
  startupTitle: string
  projectId: bigint
  chainId: number
}

export function AnimatedBenefits({ startupTitle, projectId, chainId }: AnimatedBenefitsProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const benefits = [
    {
      icon: TrendingUp,
      text: "Support the network's growth",
      color: "text-green-500",
    },
    {
      icon: Coins,
      text: `Become a member of ${startupTitle}`,
      color: "text-yellow-500",
    },
    {
      icon: Shield,
      text: "Vote on how money is spent",
      color: "text-blue-500",
    },
    {
      icon: Users,
      text: "Join a tight-knit community",
      color: "text-purple-500",
    },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % benefits.length)
    }, 3000) // Change every 3 seconds

    return () => clearInterval(interval)
  }, [benefits.length])

  const currentBenefit = benefits[currentIndex]
  const Icon = currentBenefit.icon

  return (
    <>
      <div
        className="mt-3 cursor-pointer rounded-md bg-muted/30 p-3 backdrop-blur-sm transition-opacity hover:bg-muted/40"
        onClick={() => setIsDialogOpen(true)}
      >
        <div
          className="flex items-center gap-2.5 text-xs transition-all duration-500"
          key={currentIndex}
        >
          <Icon className={cn("h-4 w-4 shrink-0", currentBenefit.color)} />
          <span className="text-foreground/80 duration-500 animate-in fade-in slide-in-from-bottom-1">
            {currentBenefit.text}
          </span>
        </div>
      </div>

      <DAOInfoDialog
        startupTitle={startupTitle}
        projectId={projectId}
        chainId={chainId}
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </>
  )
}

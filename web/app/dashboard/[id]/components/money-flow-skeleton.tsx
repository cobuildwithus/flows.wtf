"use client"

import { Skeleton } from "@/components/ui/skeleton"

export function MoneyFlowSkeleton() {
  return (
    <>
      {/* Desktop Layout */}
      <div className="hidden md:block">
        <div className="relative">
          <Background />
          <div className="relative mb-7 flex gap-[135px] p-12 px-16 pb-16">
            {/* Column 1 */}
            <div className="w-[561px] space-y-4 rounded-lg bg-background p-4">
              {/* Header */}
              <Skeleton height={32} />

              {/* Products Section */}
              <div className="rounded-lg border p-4">
                <div className="mb-3 flex items-center justify-between">
                  <Skeleton height={20} width="115px" />
                  <Skeleton height={20} width="77px" />
                </div>
                <Skeleton height={194} />
              </div>

              {/* Buy Token Section */}
              <div className="rounded-lg border p-4">
                <div className="mb-3 flex items-center justify-between">
                  <Skeleton height={20} width="115px" />
                  <Skeleton height={20} width="77px" />
                </div>
                <Skeleton height={141} />
              </div>
            </div>

            {/* Column 2 */}
            <div className="w-[561px] space-y-4 rounded-lg bg-background p-4">
              {/* Startup Header */}
              <div className="relative h-[149px] overflow-hidden rounded-lg">
                <Skeleton height={149} className="absolute inset-0" />
                <div className="absolute bottom-5 left-5 space-y-2">
                  <Skeleton height={32} width="130px" />
                  <Skeleton height={16} width="207px" />
                </div>
              </div>

              {/* Team Section */}
              <div className="rounded-lg border p-4">
                <div className="mb-3 flex items-center justify-between">
                  <Skeleton height={20} width="115px" />
                  <Skeleton height={20} width="77px" />
                </div>
                <Skeleton height={27} />
              </div>

              {/* Public Good Section */}
              <div className="rounded-lg border p-4">
                <div className="mb-3 flex items-center justify-between">
                  <Skeleton height={20} width="115px" />
                  <Skeleton height={20} width="77px" />
                </div>
                <Skeleton height={23} />
              </div>

              {/* Treasury Section */}
              <div className="rounded-lg border p-4">
                <div className="mb-3 flex items-center justify-between">
                  <Skeleton height={20} width="115px" />
                  <Skeleton height={20} width="77px" />
                </div>
                <Skeleton height={23} />
              </div>
            </div>

            {/* Column 3 */}
            <div className="w-[561px] space-y-4 rounded-lg bg-background p-4">
              {/* Header */}
              <Skeleton height={32} />

              {/* Reviews Section */}
              <div className="rounded-lg border p-4">
                <div className="mb-3">
                  <Skeleton height={20} width="115px" />
                </div>
                <Skeleton height={104} />
              </div>

              {/* Impact Section */}
              <div className="rounded-lg border p-4">
                <div className="mb-3">
                  <Skeleton height={20} width="144px" />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-2.5">
                    <Skeleton height={40} width="48px" className="rounded-md" />
                    <Skeleton height={16} className="flex-1" />
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Skeleton height={40} width="48px" className="rounded-md" />
                    <Skeleton height={16} className="flex-1" />
                  </div>
                </div>
              </div>

              {/* Token Rewards Section */}
              <div className="rounded-lg border p-4">
                <div className="mb-3">
                  <Skeleton height={20} width="115px" />
                </div>
                <Skeleton height={26} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="block md:hidden">
        <div className="mt-4 space-y-4">
          {/* Column 1 Header */}
          <div className="px-4">
            <Skeleton height={32} />
          </div>

          {/* Column 1 Items */}
          <div className="space-y-4 px-4">
            {/* Products Section */}
            <div className="rounded-lg border p-4">
              <div className="mb-3 flex items-center justify-between">
                <Skeleton height={20} width="96px" />
                <Skeleton height={20} width="64px" />
              </div>
              <Skeleton height={195} />
            </div>

            {/* Buy Token Section */}
            <div className="rounded-lg border p-4">
              <div className="mb-3 flex items-center justify-between">
                <Skeleton height={20} width="96px" />
                <Skeleton height={20} width="64px" />
              </div>
              <Skeleton height={143} />
            </div>
          </div>

          {/* Column 2 Header */}
          <div className="px-4">
            <div className="relative h-[150px] overflow-hidden rounded-lg">
              <Skeleton height={150} className="absolute inset-0" />
              <div className="absolute bottom-5 left-5 space-y-2">
                <Skeleton height={32} width="192px" />
                <Skeleton height={16} width="256px" />
              </div>
            </div>
          </div>

          {/* Column 2 Items */}
          <div className="space-y-4 px-4">
            {/* Team Section */}
            <div className="rounded-lg border p-4">
              <div className="mb-3 flex items-center justify-between">
                <Skeleton height={20} width="96px" />
                <Skeleton height={20} width="64px" />
              </div>
              <Skeleton height={27} />
            </div>

            {/* Public Good Section */}
            <div className="rounded-lg border p-4">
              <div className="mb-3 flex items-center justify-between">
                <Skeleton height={20} width="96px" />
                <Skeleton height={20} width="64px" />
              </div>
              <Skeleton height={23} />
            </div>

            {/* Treasury Section */}
            <div className="rounded-lg border p-4">
              <div className="mb-3 flex items-center justify-between">
                <Skeleton height={20} width="96px" />
                <Skeleton height={20} width="64px" />
              </div>
              <Skeleton height={23} />
            </div>
          </div>

          {/* Column 3 Header */}
          <div className="px-4">
            <Skeleton height={32} />
          </div>

          {/* Column 3 Items */}
          <div className="space-y-4 px-4">
            {/* Reviews Section */}
            <div className="rounded-lg border p-4">
              <div className="mb-3">
                <Skeleton height={20} width="96px" />
              </div>
              <Skeleton height={105} />
            </div>

            {/* Impact Section */}
            <div className="rounded-lg border p-4">
              <div className="mb-3">
                <Skeleton height={20} width="120px" />
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-2.5">
                  <Skeleton height={40} width="40px" className="rounded-md" />
                  <Skeleton height={16} className="flex-1" />
                </div>
                <div className="flex items-center gap-2.5">
                  <Skeleton height={40} width="40px" className="rounded-md" />
                  <Skeleton height={16} className="flex-1" />
                </div>
              </div>
            </div>

            {/* Token Rewards Section */}
            <div className="rounded-lg border p-4">
              <div className="mb-3">
                <Skeleton height={20} width="96px" />
              </div>
              <Skeleton height={26} />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function Background() {
  return (
    <div
      className="absolute inset-0"
      style={{
        backgroundImage: "radial-gradient(circle, #e0e0e0 0.25px, transparent 0.25px)",
        backgroundSize: "1.7rem 1.7rem",
      }}
    />
  )
}

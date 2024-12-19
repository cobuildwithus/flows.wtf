"use client"

import { useRouter } from "next/navigation"
import { HTMLProps, useEffect, useState } from "react"

interface Props extends Omit<HTMLProps<HTMLTimeElement>, "dateTime"> {
  date: Date
  locale?: Intl.LocalesArgument
  options?: Intl.DateTimeFormatOptions
  relative?: boolean
  short?: boolean
}

export function DateTime(props: Props) {
  const { date, locale = "en-US", options, relative = false, short = false, ...rest } = props
  const [currentDate, setCurrentDate] = useState(new Date())
  const router = useRouter()

  useEffect(() => {
    if (!relative) return

    const diff = date.getTime() - currentDate.getTime()
    const isWithinFiveMinutes = Math.abs(diff) <= 5 * 60 * 1000

    if (isWithinFiveMinutes) {
      const interval = setInterval(() => {
        const newCurrentDate = new Date()
        setCurrentDate(newCurrentDate)

        // Refresh when the date is reached
        if (Math.abs(date.getTime() - newCurrentDate.getTime()) < 1000) {
          router.refresh()
          clearInterval(interval)
        }
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [relative, date, currentDate, router])

  return (
    <time dateTime={date.toISOString()} title={date.toString()} suppressHydrationWarning {...rest}>
      {relative
        ? getRelativeTime(date, currentDate, locale, short)
        : date.toLocaleString(locale, options)}
    </time>
  )
}

function getRelativeTime(
  date: Date,
  currentDate: Date,
  locale: Intl.LocalesArgument = "en-US",
  short = false,
) {
  const diff = date.getTime() - currentDate.getTime()
  const formatter = new Intl.RelativeTimeFormat(locale, {
    numeric: "auto",
    style: short ? "narrow" : "long",
  })

  const absDiff = Math.abs(diff)
  const seconds = Math.floor(absDiff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  const sign = diff >= 0 ? 1 : -1

  if (days !== 0) return formatter.format(sign * days, "day")
  if (hours !== 0) return formatter.format(sign * hours, "hour")
  if (minutes !== 0) return formatter.format(sign * minutes, "minute")
  return formatter.format(sign * seconds, "second")
}

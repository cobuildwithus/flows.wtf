import { getPool } from "@/lib/database/queries/pool"
import { Metadata } from "next"
import AboutSections from "./AboutSections"

export async function generateMetadata(): Promise<Metadata> {
  const pool = await getPool()
  return {
    title: `About | ${pool.title}`,
    description: "Learn more about the flows program and how to apply for funding.",
  }
}

export default function AboutPage() {
  return <AboutSections />
}

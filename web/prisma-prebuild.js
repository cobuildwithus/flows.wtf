const fs = require("fs-extra")
const path = require("path")

require("dotenv").config()

const schemaPath = path.join(__dirname, "lib/database/schema.prisma")

function processSchema() {
  try {
    if (process.env.NODE_ENV !== "production") {
      console.debug("Skipping schema modification in non-production environment")
      return
    }

    const commitSha = process.env.VERCEL_GIT_COMMIT_SHA

    if (!commitSha) {
      console.warn("Warning: VERCEL_GIT_COMMIT_SHA not found, skipping schema modification")
      return
    }

    console.debug(`Changing onchain schema to ${commitSha}`)

    let schemaContent = fs.readFileSync(schemaPath, "utf8")

    schemaContent = schemaContent.replace(
      /schemas\s*=\s*\["web",\s*"onchain"\]/,
      `schemas = ["web", "${commitSha}"]`,
    )

    schemaContent = schemaContent.replace(/@@schema\("onchain"\)/g, `@@schema("${commitSha}")`)

    fs.writeFileSync(schemaPath, schemaContent, "utf8")
    console.debug(`Successfully updated schema with commit SHA: ${commitSha}`)
  } catch (error) {
    console.error("Error processing schema file:", error)
    process.exit(1)
  }
}

processSchema()

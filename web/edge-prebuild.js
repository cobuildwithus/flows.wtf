const fs = require("fs-extra")
const { glob } = require("glob")
const path = require("path")

// Define the pattern to match files (e.g., all .ts and .tsx files)
const pattern = "**/*.{ts,tsx}"

// Define the search and replacement strings
const searchStrings = [
  {
    search: 'export const runtime = "nodejs"',
    replace: 'export const runtime = "edge"',
  },
  {
    search: 'import { PrismaClient } from "@prisma/flows"',
    replace: 'import { PrismaClient } from "@prisma/flows/edge"',
  },
]

// Function to process each file
const processFile = (file) => {
  const filePath = path.resolve(file)
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error(`Error reading file ${filePath}:`, err)
      return
    }

    let result = data
    let updated = false

    searchStrings.forEach(({ search, replace }) => {
      if (data.includes(search)) {
        result = result.replace(search, replace)
        updated = true
      }
    })

    if (updated) {
      fs.writeFile(filePath, result, "utf8", (err) => {
        if (err) {
          console.error(`Error writing file ${filePath}:`, err)
        } else {
          console.log(`Updated ${filePath}`)
        }
      })
    }
  })
}

// Execute the script
glob(pattern)
  .then((files) => {
    files.forEach(processFile)
  })
  .catch((err) => {
    console.error("Error finding files:", err)
  })

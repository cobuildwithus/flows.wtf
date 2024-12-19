export const getContentHash = async (content: string, type: string): Promise<string> => {
  const encoder = new TextEncoder()
  const data = encoder.encode(`${type}-${content}`)
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
  return hashHex
}

export const cleanTextForEmbedding = (text: string) => {
  return (
    text
      // Remove actual newline and carriage return characters
      .replace(/(\r\n|\n|\r)/g, " ")
      // Replace escaped newline and carriage return sequences with a space
      .replace(/\\n|\\r/g, " ")
      // Remove markdown images
      .replace(/!\[[^\]]*\]\([^\)]*\)/g, "")
      // Remove markdown headings
      .replace(/^#+\s/gm, "")
      // Remove markdown list markers (- or *)
      .replace(/^[-*]\s/gm, "")
      // Remove HTML tags if any
      .replace(/<[^>]+>/g, " ")
      // Normalize multiple spaces to a single space
      .replace(/\s+/g, " ")
      // Remove unnecessary characters like # and *
      .replace(/[#*]/g, " ")
      // Trim leading and trailing whitespace
      .trim()
      // Convert to lowercase
      .toLowerCase()
  )
}

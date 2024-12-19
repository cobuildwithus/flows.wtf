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

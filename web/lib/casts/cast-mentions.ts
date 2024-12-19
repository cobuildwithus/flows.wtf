const encoder = new TextEncoder()

// Precompute byte to code unit position mapping
function createByteToCodeUnitMap(text: string): number[] {
  const byteToCodeUnitMap: number[] = []
  let codeUnitPos = 0
  let bytePos = 0

  while (codeUnitPos < text.length) {
    const codePoint = text.codePointAt(codeUnitPos)
    if (codePoint === undefined) break

    const codePointStr = String.fromCodePoint(codePoint)
    const codeUnitLength = codePointStr.length
    const encodedBytes = encoder.encode(codePointStr)
    const byteLength = encodedBytes.length

    for (let i = 0; i < byteLength; i++) {
      byteToCodeUnitMap[bytePos + i] = codeUnitPos
    }

    bytePos += byteLength
    codeUnitPos += codeUnitLength
  }

  return byteToCodeUnitMap
}

// Optimized helper function to map byte position to code unit position
function bytePositionToCodeUnitPosition(byteToCodeUnitMap: number[], bytePosition: number): number {
  if (bytePosition < 0) {
    return 0
  } else if (bytePosition >= byteToCodeUnitMap.length) {
    return byteToCodeUnitMap[byteToCodeUnitMap.length - 1]
  } else {
    return byteToCodeUnitMap[bytePosition]
  }
}

// Helper function to insert mentions into the text
export function insertMentionsIntoText(
  originalText: string,
  mentionPositions: number[],
  mentionedFids: number[],
  fidToFname: Map<string, string>,
): string {
  if (
    !Array.isArray(mentionPositions) ||
    !Array.isArray(mentionedFids) ||
    mentionPositions.length !== mentionedFids.length
  ) {
    console.warn(`${typeof mentionPositions}, ${typeof mentionedFids}`)
    console.warn(`mentionPositions: ${mentionPositions}, mentionedFids: ${mentionedFids}`)
    throw new Error("Mismatched or invalid mentions data")
  }

  // Precompute the byte to code unit mapping once
  const byteToCodeUnitMap = createByteToCodeUnitMap(originalText)

  // Map byte positions to code unit positions
  const mentionsData = mentionPositions
    .map((bytePosition, index) => {
      const fid = mentionedFids[index]
      const codeUnitPosition = bytePositionToCodeUnitPosition(byteToCodeUnitMap, bytePosition)

      if (codeUnitPosition < 0 || codeUnitPosition > originalText.length) {
        throw new Error(
          `Invalid byte position ${bytePosition} for fid ${fid} in cast "${originalText}"`,
        )
      }

      return {
        position: codeUnitPosition,
        fid,
      }
    })
    .filter((mention) => mention !== null)
    // Sort mentions by position
    .sort((a, b) => a!.position - b!.position)

  let modifiedText = originalText

  let lastIndex = 0
  const segments: string[] = []

  for (const mention of mentionsData) {
    if (!mention) throw new Error("Mention is null")

    const fidString = mention.fid.toString()
    const fname = fidToFname.get(fidString) || fidString
    const mentionText = `@${fname} `
    const position = mention.position

    // Append the text before the mention
    segments.push(modifiedText.slice(lastIndex, position))
    // Append the mention
    segments.push(mentionText)

    lastIndex = position
  }

  // Append any remaining text after the last mention
  segments.push(modifiedText.slice(lastIndex))

  // Join all segments
  return segments.join("")
}

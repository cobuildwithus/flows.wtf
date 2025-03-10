// helpful for things that we only want to run one time eg: embeddings or chain queries
export function isNewEvent(blockTimestamp: number) {
  const FIVE_MINUTES = 5 * 60
  const currentTime = Math.floor(Date.now() / 1000)
  return currentTime - blockTimestamp < FIVE_MINUTES
}

export function getScoreColor(score: number): string {
  if (score >= 80) return "bg-green-500 dark:bg-green-400"
  if (score >= 60) return "bg-yellow-500 dark:bg-yellow-400"
  return "bg-red-500 dark:bg-red-400"
}

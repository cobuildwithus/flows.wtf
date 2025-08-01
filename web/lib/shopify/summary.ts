export interface MonthlySales {
  /** Short month label – e.g. "Jan", "Feb" */
  month: string
  /** Combined sales amount for the month (USD) */
  sales: number
  /** Number of individual sales / orders in the month */
  orders: number
  /** First day of the month (midnight UTC) – used for accurate sorting */
  date: Date
}

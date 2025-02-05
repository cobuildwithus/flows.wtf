export interface ImpactBlock {
  id: string
  title: string
  impactUnits: ImpactUnit[]
}

export interface ImpactUnit {
  date: string
  name: string
  rationale: string
  confidence: number
  sources: string[]
  unit: string
  value: number
}

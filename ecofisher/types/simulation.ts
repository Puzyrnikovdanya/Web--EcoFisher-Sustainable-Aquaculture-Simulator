export type Difficulty = 'normal' | 'hard'
export type PopulationStatus = 'stable' | 'overloaded' | 'extinct'

export interface ModelParameters {
  difficulty: Difficulty
  r: number
  k: number
  mu: number
  g: number
  delta: number
  q: number
  effort: number
  stock: number
  price: number
  effortCost: number
  stockCost: number
  predatorMortality: number
  predatorGrowth: number
  predation: number
  minPredatorPopulation: number
  foodThreshold: number
  initialJuvenile: number
  initialAdult: number
  initialPredator: number
  initialCapital: number
  dt: number
  speed: number
}

export interface SimulationState {
  time: number
  juvenile: number
  adult: number
  predator: number
  harvest: number
  profit: number
  cash: number
  populationStatus: PopulationStatus
}

export interface HistoryPoint {
  time: number
  juvenile: number
  adult: number
  predator: number
  populationStatus: PopulationStatus
  profit: number
  cash: number
  harvest: number
}

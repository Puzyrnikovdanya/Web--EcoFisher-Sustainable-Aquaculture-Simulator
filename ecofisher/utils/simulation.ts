import type { HistoryPoint, ModelParameters, PopulationStatus, SimulationState } from '~/types/simulation'

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function enforceFishCapacity(juvenile: number, adult: number, capacity: number) {
  let nextJuvenile = Math.max(0, juvenile)
  let nextAdult = Math.max(0, adult)
  const totalFish = nextJuvenile + nextAdult
  let overloaded = false

  if (totalFish > capacity) {
    overloaded = true
    const excess = totalFish - capacity
    const survivalRatio = (totalFish - excess) / totalFish
    nextJuvenile *= survivalRatio
    nextAdult *= survivalRatio
  }

  return {
    juvenile: nextJuvenile,
    adult: nextAdult,
    overloaded
  }
}

function getPopulationStatus(juvenile: number, adult: number, overloaded: boolean): PopulationStatus {
  const totalFish = juvenile + adult
  if (adult <= 0 || totalFish <= 0) return 'extinct'
  if (overloaded) return 'overloaded'
  return 'stable'
}

export function createInitialState(params?: ModelParameters): SimulationState {
  const initialJuvenile = params?.initialJuvenile ?? 160
  const initialAdult = Math.max(1, params?.initialAdult ?? 430)
  const initialCapital = params?.initialCapital ?? 1800
  const capacity = params?.k ?? 900
  const boundedFish = enforceFishCapacity(initialJuvenile, initialAdult, capacity)
  let initialPredator = 0

  if (params?.difficulty === 'hard') {
    initialPredator = clamp(params.initialPredator, 0, 550)
    if (boundedFish.adult > params.foodThreshold) {
      initialPredator = clamp(Math.max(initialPredator, params.minPredatorPopulation), 0, 550)
    }
  }

  return {
    time: 0,
    juvenile: boundedFish.juvenile,
    adult: boundedFish.adult,
    predator: initialPredator,
    harvest: 0,
    profit: 0,
    cash: initialCapital,
    populationStatus: getPopulationStatus(boundedFish.juvenile, boundedFish.adult, boundedFish.overloaded)
  }
}

export function createPoint(state: SimulationState): HistoryPoint {
  return {
    time: Number(state.time.toFixed(2)),
    juvenile: state.juvenile,
    adult: state.adult,
    predator: state.predator,
    populationStatus: state.populationStatus,
    profit: state.profit,
    cash: state.cash,
    harvest: state.harvest
  }
}

export function simulateStep(state: SimulationState, params: ModelParameters): SimulationState {
  if (state.populationStatus === 'extinct') {
    return { ...state }
  }

  const availableAdult = Math.max(0, state.adult)
  const harvest = Math.min(params.q * params.effort * availableAdult, availableAdult)
  const reproduction = params.r * state.adult * (1 - state.adult / params.k)
  const maturation = params.g * state.juvenile

  let dJuvenile = 0
  let dAdult = 0
  let dPredator = 0

  if (params.difficulty === 'normal') {
    dJuvenile = reproduction - params.mu * state.juvenile - maturation + params.stock
    dAdult = maturation - harvest - params.delta * state.adult
  }

  if (params.difficulty === 'hard') {
    const predationLoss = params.predation * state.adult * state.predator
    dJuvenile = reproduction - params.mu * state.juvenile - maturation + params.stock
    dAdult = maturation - predationLoss - harvest - params.delta * state.adult
    dPredator = -params.predatorMortality * state.predator + params.predatorGrowth * state.adult * state.predator
  }

  const boundedFish = enforceFishCapacity(
    state.juvenile + dJuvenile * params.dt,
    state.adult + dAdult * params.dt,
    params.k
  )
  let nextPredator = 0
  if (params.difficulty === 'hard') {
    nextPredator = clamp(state.predator + dPredator * params.dt, 0, 550)
    if (boundedFish.adult > params.foodThreshold) {
      nextPredator = clamp(Math.max(nextPredator, params.minPredatorPopulation), 0, 550)
    }
  }

  const profit = params.price * harvest - params.effortCost * params.effort - params.stockCost * params.stock
  const populationStatus = getPopulationStatus(boundedFish.juvenile, boundedFish.adult, boundedFish.overloaded)

  return {
    time: state.time + params.dt,
    juvenile: boundedFish.juvenile,
    adult: boundedFish.adult,
    predator: nextPredator,
    harvest,
    profit,
    cash: state.cash + profit * params.dt,
    populationStatus
  }
}

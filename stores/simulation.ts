import { defineStore } from 'pinia'
import { computed, reactive, ref, watch } from 'vue'
import type { Difficulty, HistoryPoint, ModelParameters, SimulationState } from '~/types/simulation'
import { clamp, createInitialState, createPoint, simulateStep } from '~/utils/simulation'

const defaultParameters: ModelParameters = {
  difficulty: 'normal',
  r: 0.42,
  k: 900,
  mu: 0.05,
  g: 0.16,
  delta: 0.035,
  q: 0.0018,
  effort: 145,
  stock: 24,
  price: 5.4,
  effortCost: 1.75,
  stockCost: 2.1,
  predatorMortality: 0.19,
  predatorGrowth: 0.00045,
  predation: 0.00075,
  minPredatorPopulation: 8,
  foodThreshold: 20,
  initialJuvenile: 160,
  initialAdult: 430,
  initialPredator: 24,
  initialCapital: 1800,
  dt: 1,
  speed: 1
}

export const useSimulationStore = defineStore('simulation', () => {
  const params = reactive<ModelParameters>({ ...defaultParameters })
  const state = reactive<SimulationState>(createInitialState(defaultParameters))
  const history = ref<HistoryPoint[]>([])
  const running = ref(false)

  let timer: ReturnType<typeof window.setInterval> | null = null
  let monthAccumulator = 0

  const isExtinct = computed(() => state.populationStatus === 'extinct')
  const harvest = computed(() => state.harvest)
  const populationView = computed(() => {
    const totalFish = state.juvenile + state.adult
    const recent = history.value.slice(-4)
    const previous = recent.length >= 2 ? recent[recent.length - 2] : null
    const previousTotal = previous ? previous.juvenile + previous.adult : totalFish
    const totalChange = totalFish - previousTotal
    const changeRate = previousTotal > 0 ? totalChange / previousTotal : 0
    const predationPressure = params.predation * state.adult * state.predator
    const maturationPressure = params.g * state.juvenile
    const predatorRatio = state.adult > 0 ? state.predator / state.adult : 0

    if (state.populationStatus === 'extinct') {
      return {
        key: 'extinct',
        label: 'Популяция истреблена',
        tone: 'red'
      }
    }

    if (
      totalFish <= params.k * 0.12 ||
      state.adult <= Math.max(params.foodThreshold, params.k * 0.04) ||
      changeRate <= -0.22
    ) {
      return {
        key: 'critical_extinction_risk',
        label: 'Критическая угроза вымирания',
        tone: 'dark-red'
      }
    }

    if (state.populationStatus === 'overloaded') {
      return {
        key: 'overstocked_lake',
        label: 'Перенаселение озера',
        tone: 'yellow'
      }
    }

    if (
      params.difficulty === 'hard' &&
      state.predator > 0 &&
      (predationPressure >= maturationPressure * 0.45 || predatorRatio >= 0.18)
    ) {
      return {
        key: 'predator_dominance',
        label: 'Доминирование хищников',
        tone: 'purple'
      }
    }

    if (recent.length >= 2 && changeRate <= -0.035) {
      return {
        key: 'population_decline',
        label: 'Сокращение популяции',
        tone: 'orange'
      }
    }

    if (recent.length >= 2 && changeRate >= 0.08) {
      return {
        key: 'rapid_growth',
        label: 'Активный рост популяции',
        tone: 'light-green'
      }
    }

    return {
      key: 'sustainable_equilibrium',
      label: 'Устойчивое равновесие',
      tone: 'green'
    }
  })
  const economicStatus = computed(() => {
    if (state.time === 0) return 'Ожидает запуска'
    if (state.cash <= 0) return 'Капитал исчерпан'
    if (state.profit < 0) return 'Экономические убытки'

    const recent = history.value.slice(-4)
    if (recent.length >= 4) {
      const profits = recent.map((point) => point.profit)
      const revenues = recent.map((point) => point.harvest * params.price)
      const averageProfit = profits.reduce((sum, value) => sum + value, 0) / profits.length
      const averageRevenue = revenues.reduce((sum, value) => sum + value, 0) / revenues.length
      const profitRange = Math.max(...profits) - Math.min(...profits)
      const revenueRange = Math.max(...revenues) - Math.min(...revenues)
      const profitTolerance = Math.max(8, Math.abs(averageProfit) * 0.06)
      const revenueTolerance = Math.max(8, Math.abs(averageRevenue) * 0.06)

      if (revenueRange <= revenueTolerance) return 'Выручка стабилизировалась'
      if (profitRange <= profitTolerance) return 'Прибыль стабилизировалась'

      const previousProfit = profits[profits.length - 2] ?? state.profit
      if (state.profit > previousProfit + profitTolerance) return 'Прибыль растет'
      if (state.profit < previousProfit - profitTolerance) return 'Прибыль снижается'
    }

    return 'Положительная прибыль'
  })
  function pushHistory() {
    history.value.push(createPoint(state))
  }

  function syncInitialState() {
    const next = createInitialState(params)
    Object.assign(state, next)
    history.value = []
    pushHistory()
  }

  function canSyncInitialState() {
    return !running.value && state.time === 0 && history.value.length <= 1
  }

  watch(
    () => [
      params.initialJuvenile,
      params.initialAdult,
      params.initialPredator,
      params.initialCapital,
      params.difficulty,
      params.k
    ],
    () => {
      if (canSyncInitialState()) {
        syncInitialState()
      }
    }
  )

  function tick() {
    if (isExtinct.value) return false
    if (canSyncInitialState()) {
      syncInitialState()
    }

    const next = simulateStep(state, params)
    state.time = next.time
    state.juvenile = next.juvenile
    state.adult = next.adult
    state.predator = next.predator
    state.harvest = next.harvest
    state.profit = next.profit
    state.cash = next.cash
    state.populationStatus = next.populationStatus
    pushHistory()

    if (state.populationStatus === 'extinct') {
      stop()
    }

    return true
  }

  function runTimedStep() {
    monthAccumulator += clamp(params.speed, 0.25, 10)
    const steps = Math.floor(monthAccumulator)
    monthAccumulator -= steps

    for (let index = 0; index < steps; index += 1) {
      if (!tick()) break
    }
  }

  function start() {
    if (isExtinct.value) return
    if (running.value) return
    if (canSyncInitialState()) {
      syncInitialState()
    }
    running.value = true
    timer = window.setInterval(runTimedStep, 1000)
  }

  function stop() {
    running.value = false
    if (timer) {
      window.clearInterval(timer)
      timer = null
    }
  }

  function toggleRunning() {
    if (running.value) {
      stop()
    } else {
      start()
    }
  }

  function setDifficulty(difficulty: Difficulty) {
    if (isExtinct.value) return

    params.difficulty = difficulty
    if (difficulty === 'normal') {
      state.predator = 0
    }
    if (canSyncInitialState()) {
      syncInitialState()
      return
    }
    pushHistory()
  }

  function applyPredatorShock(value: number) {
    if (isExtinct.value) return

    const amount = Number.isFinite(value) ? value : 0

    params.difficulty = 'hard'
    state.predator = clamp(state.predator + amount, 0, 500)

    pushHistory()
  }

  function reset() {
    stop()
    Object.assign(params, defaultParameters)
    Object.assign(state, createInitialState(params))
    history.value = []
    monthAccumulator = 0
    pushHistory()
  }

  return {
    params,
    state,
    history,
    running,
    isExtinct,
    harvest,
    populationView,
    economicStatus,
    tick,
    start,
    stop,
    toggleRunning,
    reset,
    setDifficulty,
    applyPredatorShock
  }
})

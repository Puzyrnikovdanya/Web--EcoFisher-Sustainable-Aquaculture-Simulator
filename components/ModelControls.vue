<script setup lang="ts">
import { ChevronDown, CircleDollarSign, Fish, Gauge, RotateCcw, Sprout, Zap } from '@lucide/vue'
import { useSimulationStore } from '~/stores/simulation'
import type { Difficulty } from '~/types/simulation'

const simulation = useSimulationStore()

const difficulties: Array<{ value: Difficulty; label: string }> = [
  { value: 'normal', label: 'Normal' },
  { value: 'hard', label: 'Hard' }
]

const expandedGroups = reactive({
  start: false,
  model: false,
  biology: false,
  business: false,
  predator: false
})

const predatorAmount = ref(32)

const biologicalControls = computed(() => [
  { key: 'r', label: 'Рост рыбы (r)', min: 0.05, max: 0.9, step: 0.01, digits: 2 },
  { key: 'k', label: 'Вместимость озера (K)', min: 250, max: 7000, step: 10, digits: 0 },
  { key: 'mu', label: 'Смертность мальков (μ)', min: 0.01, max: 0.2, step: 0.005, digits: 3 },
  { key: 'g', label: 'Взросление (g)', min: 0.02, max: 0.36, step: 0.01, digits: 2 },
  { key: 'delta', label: 'Смертность взрослых (δ)', min: 0.005, max: 0.13, step: 0.005, digits: 3 }
])

const businessControls = computed(() => [
  {
    key: 'effort',
    label: 'Усилие вылова (E)',
    min: 0,
    max: 320,
    step: 1,
    digits: 0,
    hint: 'Большее усилие увеличивает вылов, но может снизить будущую прибыль, если популяция рыбы уменьшится.'
  },
  {
    key: 'stock',
    label: 'Зарыбление (S)',
    min: 0,
    max: 120,
    step: 1,
    digits: 0,
    hint: 'В озеро добавляются мальки. Они должны повзрослеть, прежде чем пополнить взрослую популяцию.'
  },
  { key: 'price', label: 'Цена рыбы (p)', min: 1, max: 12, step: 0.1, digits: 1 },
  { key: 'effortCost', label: 'Стоимость вылова (c)', min: 0.2, max: 5, step: 0.05, digits: 2 },
  { key: 'stockCost', label: 'Стоимость зарыбления (s)', min: 0.2, max: 6, step: 0.05, digits: 2 }
])

const predatorControls = computed(() => [
  { key: 'predation', label: 'Хищничество (b)', min: 0.0001, max: 0.003, step: 0.00005, digits: 4 },
  { key: 'predatorGrowth', label: 'Рост хищника (d)', min: 0.00005, max: 0.0012, step: 0.00005, digits: 4 },
  { key: 'predatorMortality', label: 'Смертность хищника (m)', min: 0.04, max: 0.45, step: 0.01, digits: 2 },
  { key: 'minPredatorPopulation', label: 'Минимум хищников', min: 0, max: 80, step: 1, digits: 0 },
  { key: 'foodThreshold', label: 'Порог кормовой базы', min: 0, max: 160, step: 1, digits: 0 }
])

function formatControl(key: string, digits: number) {
  const value = Number(simulation.params[key as keyof typeof simulation.params])
  return value.toFixed(digits)
}

const formattedSpeed = computed(() => `${simulation.params.speed.toFixed(2).replace(/\.?0+$/, '')}x`)
const initialControlsDisabled = computed(() => simulation.running || simulation.state.time > 0)
const isHardMode = computed(() => simulation.params.difficulty === 'hard')

function applyPredatorShock() {
  simulation.applyPredatorShock(predatorAmount.value)
}
</script>

<template>
  <aside class="panel controls-panel">
    <h2 class="section-title">Параметры модели</h2>
    <div class="section-rule" />

    <div class="difficulty" aria-label="Уровень сложности">
      <button
        v-for="item in difficulties"
        :key="item.value"
        type="button"
        :disabled="simulation.isExtinct"
        :class="{ selected: simulation.params.difficulty === item.value }"
        @click="simulation.setDifficulty(item.value)"
      >
        {{ item.label }}
      </button>
    </div>

    <section class="control-group accordion-group">
      <button
        class="group-title accordion-trigger"
        type="button"
        :aria-expanded="expandedGroups.start"
        @click="expandedGroups.start = !expandedGroups.start"
      >
        <span class="title-main">
          <Fish :size="18" />
          <span>Старт</span>
        </span>
        <ChevronDown :class="{ open: expandedGroups.start }" :size="18" />
      </button>
      <div v-show="expandedGroups.start" class="accordion-content">
        <label class="slider-card">
          <span class="field-label">
            <span>Начальные мальки</span>
            <span class="value">{{ simulation.params.initialJuvenile.toFixed(0) }} J</span>
          </span>
          <input
            v-model.number="simulation.params.initialJuvenile"
            type="range"
            min="0"
            max="2000"
            step="1"
            :disabled="initialControlsDisabled"
          >
        </label>

        <label class="slider-card">
          <span class="field-label">
            <span>Начальная взрослая рыба</span>
            <span class="value">{{ simulation.params.initialAdult.toFixed(0) }} F</span>
          </span>
          <input
            v-model.number="simulation.params.initialAdult"
            type="range"
            min="1"
            max="2000"
            step="1"
            :disabled="initialControlsDisabled"
          >
        </label>

        <label class="slider-card">
          <span class="field-label">
            <span>Начальный капитал</span>
            <span class="value">{{ simulation.params.initialCapital.toFixed(0) }} у.е.</span>
          </span>
          <input
            v-model.number="simulation.params.initialCapital"
            type="range"
            min="0"
            max="10000"
            step="100"
            :disabled="initialControlsDisabled"
          >
        </label>

        <label v-if="simulation.params.difficulty === 'hard'" class="slider-card">
          <span class="field-label">
            <span>Начальные хищники</span>
            <span class="value">{{ simulation.params.initialPredator.toFixed(0) }} P</span>
          </span>
          <input
            v-model.number="simulation.params.initialPredator"
            type="range"
            min="0"
            max="500"
            step="1"
            :disabled="initialControlsDisabled"
          >
        </label>
      </div>
    </section>

    <section class="control-group accordion-group">
      <button
        class="group-title accordion-trigger"
        type="button"
        :aria-expanded="expandedGroups.model"
        @click="expandedGroups.model = !expandedGroups.model"
      >
        <span class="title-main">
          <Gauge :size="18" />
          <span>Модель</span>
        </span>
        <ChevronDown :class="{ open: expandedGroups.model }" :size="18" />
      </button>
      <div v-show="expandedGroups.model" class="accordion-content">
        <article class="equation-card">
          <div class="equation-head">
            <span>Активная система</span>
            <strong>{{ isHardMode ? 'Hard' : 'Normal' }}</strong>
          </div>
          <section class="equation-section">
            <h3>Система динамики</h3>
            <div class="equation-system" :class="isHardMode ? 'equation-system-hard' : 'equation-system-normal'">
              <span class="system-brace" aria-hidden="true">
                <svg viewBox="0 0 18 100" preserveAspectRatio="none">
                  <path d="M15 2 C7 2 7 12 7 21 V36 C7 43 4 47 1 50 C4 53 7 57 7 64 V79 C7 88 7 98 15 98" />
                </svg>
              </span>
              <div class="system-lines">
                <div class="formula-line">dJ/dt = rF(1 - F/K) - μJ - gJ + S</div>
                <div class="formula-line">
                  dF/dt = gJ - H - δF<span v-if="isHardMode"> - bFP</span>
                </div>
                <div v-if="isHardMode" class="formula-line">dP/dt = -mP + dFP</div>
              </div>
            </div>
          </section>

          <section v-if="isHardMode" class="equation-section">
            <h3>Ограничение</h3>
            <div class="formula-box">P ≥ P<sub>min</sub>, если F &gt; F<sub>food</sub></div>
          </section>

          <section class="equation-section">
            <h3>Расчетные формулы</h3>
            <div class="formula-box">H = min(qEF, F)</div>
            <div class="formula-box">Прибыль = pH - cE - sS</div>
            <div class="formula-box">Капитал<sub>t+1</sub> = Капитал<sub>t</sub> + Прибыль · dt</div>
          </section>
        </article>
      </div>
    </section>

    <section class="control-group accordion-group">
      <button
        class="group-title accordion-trigger"
        type="button"
        :aria-expanded="expandedGroups.biology"
        @click="expandedGroups.biology = !expandedGroups.biology"
      >
        <span class="title-main">
          <Sprout :size="18" />
          <span>Биология</span>
        </span>
        <ChevronDown :class="{ open: expandedGroups.biology }" :size="18" />
      </button>
      <div v-show="expandedGroups.biology" class="accordion-content">
        <label v-for="control in biologicalControls" :key="control.key" class="slider-card">
          <span class="field-label">
            <span>{{ control.label }}</span>
            <span class="value">{{ formatControl(control.key, control.digits) }}</span>
          </span>
          <input
            v-model.number="simulation.params[control.key as keyof typeof simulation.params]"
            type="range"
            :disabled="simulation.isExtinct"
            :min="control.min"
            :max="control.max"
            :step="control.step"
          >
        </label>
      </div>
    </section>

    <section class="control-group accordion-group">
      <button
        class="group-title accordion-trigger"
        type="button"
        :aria-expanded="expandedGroups.business"
        @click="expandedGroups.business = !expandedGroups.business"
      >
        <span class="title-main">
          <CircleDollarSign :size="18" />
          <span>Бизнес</span>
        </span>
        <ChevronDown :class="{ open: expandedGroups.business }" :size="18" />
      </button>
      <div v-show="expandedGroups.business" class="accordion-content">
        <label v-for="control in businessControls" :key="control.key" class="slider-card">
          <span class="field-label">
            <span :title="control.hint">{{ control.label }}</span>
            <span class="value">{{ formatControl(control.key, control.digits) }}</span>
          </span>
          <input
            v-model.number="simulation.params[control.key as keyof typeof simulation.params]"
            type="range"
            :disabled="simulation.isExtinct"
            :min="control.min"
            :max="control.max"
            :step="control.step"
          >
        </label>
      </div>
    </section>

    <section class="control-group accordion-group predator" :class="{ disabled: simulation.params.difficulty !== 'hard' }">
      <button
        class="group-title accordion-trigger"
        type="button"
        :aria-expanded="expandedGroups.predator"
        @click="expandedGroups.predator = !expandedGroups.predator"
      >
        <span class="title-main">
          <Fish :size="18" />
          <span>Хищник</span>
        </span>
        <ChevronDown :class="{ open: expandedGroups.predator }" :size="18" />
      </button>

      <div v-show="expandedGroups.predator" class="accordion-content predator-content">
        <label v-for="control in predatorControls" :key="control.key" class="slider-card">
          <span class="field-label">
            <span title="Хищники потребляют взрослую рыбу и могут дестабилизировать систему.">{{ control.label }}</span>
            <span class="value">{{ formatControl(control.key, control.digits) }}</span>
          </span>
          <input
            v-model.number="simulation.params[control.key as keyof typeof simulation.params]"
            type="range"
            :disabled="simulation.isExtinct || simulation.params.difficulty !== 'hard'"
            :min="control.min"
            :max="control.max"
            :step="control.step"
          >
        </label>

        <section class="predator-card">
          <label>
            <span>Количество добавляемых хищников</span>
            <input
              v-model.number="predatorAmount"
              type="number"
              min="0"
              max="500"
              step="1"
              :disabled="simulation.isExtinct"
              title="Хищники потребляют взрослую рыбу и могут дестабилизировать систему."
            >
          </label>
        </section>

        <div class="predator-actions">
          <button class="button button-primary" type="button" :disabled="simulation.isExtinct" @click="applyPredatorShock">
            <Zap :size="18" />
            <span>Добавить хищника</span>
          </button>
          <button class="button button-muted" type="button" @click="simulation.reset">
            <RotateCcw :size="18" />
            <span>Сброс</span>
          </button>
        </div>
      </div>
    </section>

    <section class="control-group compact">
      <label class="slider-card">
        <span class="field-label">
          <span>Скорость симуляции</span>
          <span class="value">{{ formattedSpeed }}</span>
        </span>
        <input
          v-model.number="simulation.params.speed"
          type="range"
          min="0.25"
          max="10"
          step="0.25"
          :disabled="simulation.isExtinct"
        >
      </label>
    </section>
  </aside>
</template>

<style scoped>
.controls-panel {
  padding: 20px;
  box-shadow: 0 16px 38px rgba(31, 55, 63, 0.06);
}

.section-title {
  color: #17334a;
  font-size: 18px;
  line-height: 1.15;
}

.section-rule {
  margin: 12px 0 14px;
}

.difficulty {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;
  margin-bottom: 14px;
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 4px;
  background: #f7fafb;
}

.difficulty button {
  min-height: 36px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--muted);
  font-weight: 800;
}

.difficulty button.selected {
  background: var(--blue);
  color: #ffffff;
}

.difficulty button:disabled,
input:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.control-group {
  display: grid;
  gap: 10px;
  padding-top: 12px;
}

.control-group + .control-group {
  margin-top: 14px;
  border-top: 1px solid var(--border-soft);
}

.group-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #18384f;
  font-size: 15px;
  font-weight: 850;
}

.accordion-trigger {
  justify-content: space-between;
  width: 100%;
  min-height: 46px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: #ffffff;
  padding: 0 12px;
  text-align: left;
}

.accordion-trigger svg:last-child {
  flex: 0 0 auto;
  color: var(--muted);
  transition: transform 160ms ease;
}

.accordion-trigger svg:last-child.open {
  transform: rotate(180deg);
}

.title-main {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.accordion-content {
  display: grid;
  gap: 10px;
}

.slider-card {
  display: grid;
  gap: 10px;
  min-height: 72px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: #ffffff;
  padding: 12px 14px 11px;
}

.predator.disabled {
  opacity: 1;
}

.predator.disabled .slider-card {
  opacity: 0.56;
}

.predator-card {
  border: 1px solid var(--border);
  border-radius: 8px;
  background: #ffffff;
  padding: 14px;
}

.predator-card label {
  display: grid;
  gap: 12px;
  color: #17334a;
  font-weight: 800;
}

.predator-actions {
  display: grid;
  gap: 10px;
}

.predator-actions .button {
  width: 100%;
}

.equation-card {
  border: 1px solid var(--border);
  border-radius: 8px;
  background: #ffffff;
  padding: 14px;
}

.equation-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 10px;
}

.equation-head span {
  color: var(--muted);
  font-size: 12px;
  font-weight: 850;
  text-transform: uppercase;
}

.equation-head strong {
  border-radius: 6px;
  background: #e9f6ed;
  color: var(--blue-strong);
  padding: 5px 8px;
  font-size: 12px;
  font-weight: 850;
}

.equation-section {
  display: grid;
  gap: 8px;
}

.equation-section + .equation-section {
  margin-top: 14px;
}

.equation-section h3 {
  margin: 0;
  color: #18384f;
  font-size: 13px;
  line-height: 1.25;
}

.equation-system {
  display: flex;
  align-items: center;
  gap: 7px;
  overflow-x: auto;
  border: 1px solid #b8ddc2;
  border-radius: 8px;
  background: #f8fcf9;
  padding: 14px 12px;
}

.system-brace {
  display: flex;
  flex: 0 0 16px;
  align-items: stretch;
  color: #18344a;
}

.system-brace svg {
  width: 16px;
  overflow: visible;
}

.equation-system-normal .system-brace svg {
  height: 66px;
}

.equation-system-hard .system-brace svg {
  height: 94px;
}

.system-brace path {
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.7;
}

.system-lines {
  display: grid;
  gap: 8px;
  min-width: max-content;
}

.formula-line,
.formula-box {
  color: #18344a;
  font-family: "Cascadia Mono", "Fira Code", Consolas, monospace;
  font-size: 13px;
  line-height: 1.6;
}

.formula-box {
  overflow-x: auto;
  border: 1px solid #b8ddc2;
  border-radius: 8px;
  background: #f8fcf9;
  padding: 10px 12px;
  white-space: nowrap;
}

.compact .slider-card {
  min-height: 68px;
}

@media (max-width: 1180px) {
  .controls-panel {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
  }

  .controls-panel > .section-title,
  .controls-panel > .section-rule,
  .difficulty {
    grid-column: 1 / -1;
  }

  .control-group + .control-group {
    margin-top: 0;
  }
}

@media (max-width: 760px) {
  .controls-panel {
    grid-template-columns: 1fr;
  }
}
</style>

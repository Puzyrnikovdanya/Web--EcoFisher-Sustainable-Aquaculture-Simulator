<script setup lang="ts">
import { AlertTriangle, CircleDollarSign, Clock, Fish, TrendingUp, Waves } from '@lucide/vue'
import { useSimulationStore } from '~/stores/simulation'

const simulation = useSimulationStore()

const metrics = computed(() => [
  {
    label: 'Мальки',
    value: simulation.state.juvenile.toFixed(0),
    suffix: 'J',
    icon: Fish,
    tone: 'teal'
  },
  {
    label: 'Взрослая рыба',
    value: simulation.state.adult.toFixed(0),
    suffix: 'F',
    icon: Fish,
    tone: 'blue'
  },
  {
    label: 'Вылов',
    value: simulation.harvest.toFixed(1),
    suffix: 'ед./шаг',
    icon: Waves,
    tone: 'teal'
  },
  {
    label: 'Прибыль за месяц',
    value: simulation.state.profit.toFixed(0),
    suffix: 'у.е./мес.',
    icon: TrendingUp,
    tone: simulation.state.profit < 0 ? 'red' : 'green'
  },
  {
    label: 'Капитал компании',
    value: simulation.state.cash.toFixed(0),
    suffix: 'у.е.',
    icon: CircleDollarSign,
    tone: simulation.state.cash < 0 ? 'red' : 'blue'
  },
  {
    label: 'Хищная рыба',
    value: simulation.state.predator.toFixed(0),
    suffix: 'P',
    icon: AlertTriangle,
    tone: simulation.state.predator > 0 ? 'red' : 'green'
  },
  {
    label: 'Время',
    value: simulation.state.time.toFixed(0),
    suffix: 'мес.',
    icon: Clock,
    tone: 'blue'
  }
])
</script>

<template>
  <section class="metrics" aria-label="Ключевые показатели">
    <article v-for="metric in metrics" :key="metric.label" class="metric panel">
      <div class="metric-icon" :class="metric.tone">
        <component :is="metric.icon" :size="20" />
      </div>
      <div>
        <p>{{ metric.label }}</p>
        <strong>{{ metric.value }} <span>{{ metric.suffix }}</span></strong>
      </div>
    </article>
  </section>
</template>

<style scoped>
.metrics {
  display: grid;
  grid-template-columns: repeat(7, minmax(116px, 1fr));
  gap: 14px;
  margin: 0 0 24px;
}

.metric {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 92px;
  padding: 16px 18px;
  box-shadow: 0 16px 34px rgba(31, 55, 63, 0.055);
}

.metric-icon {
  display: grid;
  width: 42px;
  height: 42px;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 8px;
  background: #edf8ef;
  color: var(--blue);
}

.metric-icon.teal {
  background: #e5f5f2;
  color: var(--teal);
}

.metric-icon.green {
  background: #e8f5ea;
  color: var(--green);
}

.metric-icon.red {
  background: #fdeeee;
  color: var(--red);
}

p {
  margin: 0 0 5px;
  color: var(--muted);
  font-size: 12px;
  font-weight: 760;
  text-transform: uppercase;
}

strong {
  display: block;
  color: #102b43;
  font-size: 23px;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

span {
  color: var(--muted);
  font-size: 13px;
}

@media (max-width: 1180px) {
  .metrics {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .metrics {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 560px) {
  .metrics {
    grid-template-columns: 1fr;
  }
}
</style>

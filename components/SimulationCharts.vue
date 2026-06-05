<script setup lang="ts">
import { LineChart } from 'echarts/charts'
import {
  GridComponent,
  LegendComponent,
  MarkLineComponent,
  TooltipComponent
} from 'echarts/components'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { init, type ECharts, type EChartsOption } from 'echarts'
import { useSimulationStore } from '~/stores/simulation'

use([CanvasRenderer, LineChart, GridComponent, LegendComponent, TooltipComponent, MarkLineComponent])

const simulation = useSimulationStore()
const populationChart = ref<HTMLDivElement | null>(null)
const economyChart = ref<HTMLDivElement | null>(null)

let populationInstance: ECharts | null = null
let economyInstance: ECharts | null = null

const emptyGraphic = {
  type: 'text',
  left: 'center',
  top: 'middle',
  style: {
    text: 'Нажмите «Запустить»',
    fill: '#7d8c96',
    fontSize: 18,
    fontStyle: 'italic'
  }
}

const populationOption = computed<EChartsOption>(() => {
  const history = simulation.history
  const endTime = Math.max(1, simulation.state.time)
  return {
    color: ['#2fbf71', '#2563eb', '#d95454'],
    tooltip: { trigger: 'axis' },
    legend: {
      top: 8,
      textStyle: { color: '#426071' }
    },
    grid: { top: 56, left: 48, right: 18, bottom: 42 },
    xAxis: {
      type: 'value',
      min: 0,
      max: endTime,
      axisLine: { lineStyle: { color: '#c9d5d8' } },
      axisLabel: {
        color: '#6c7f89',
        formatter: '{value} мес.'
      },
      splitLine: { show: false }
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#6c7f89' },
      splitLine: { lineStyle: { color: '#edf2f3' } }
    },
    graphic: history.length < 2 ? emptyGraphic : undefined,
    series: [
      {
        name: 'Мальки J',
        type: 'line',
        smooth: true,
        showSymbol: false,
        lineStyle: { width: 3 },
        data: history.map((point) => [point.time, point.juvenile])
      },
      {
        name: 'Взрослая F',
        type: 'line',
        smooth: true,
        showSymbol: false,
        lineStyle: { width: 3 },
        data: history.map((point) => [point.time, point.adult]),
        markLine: {
          symbol: 'none',
          label: { formatter: 'K', color: '#789' },
          lineStyle: { color: '#9bb5bf', type: 'dashed' },
          data: [{ yAxis: simulation.params.k }]
        }
      },
      {
        name: 'Хищник P',
        type: 'line',
        smooth: true,
        showSymbol: false,
        lineStyle: { width: 3 },
        data: history.map((point) => [point.time, point.predator])
      }
    ]
  }
})

const economyOption = computed<EChartsOption>(() => {
  const history = simulation.history
  const endTime = Math.max(1, simulation.state.time)
  return {
    color: ['#16a34a', '#2563eb'],
    tooltip: { trigger: 'axis' },
    legend: {
      top: 8,
      textStyle: { color: '#426071' }
    },
    grid: { top: 56, left: 54, right: 18, bottom: 42 },
    xAxis: {
      type: 'value',
      min: 0,
      max: endTime,
      axisLine: { lineStyle: { color: '#c9d5d8' } },
      axisLabel: {
        color: '#6c7f89',
        formatter: '{value} мес.'
      },
      splitLine: { show: false }
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#6c7f89' },
      splitLine: { lineStyle: { color: '#edf2f3' } }
    },
    graphic: history.length < 2 ? emptyGraphic : undefined,
    series: [
      {
        name: 'Прибыль',
        type: 'line',
        smooth: true,
        showSymbol: false,
        lineStyle: { width: 3 },
        data: history.map((point) => [point.time, point.profit])
      },
      {
        name: 'Вылов',
        type: 'line',
        smooth: true,
        showSymbol: false,
        lineStyle: { width: 3 },
        data: history.map((point) => [point.time, point.harvest])
      }
    ]
  }
})

function resizeCharts() {
  populationInstance?.resize()
  economyInstance?.resize()
}

onMounted(() => {
  if (populationChart.value) {
    populationInstance = init(populationChart.value)
    populationInstance.setOption(populationOption.value)
  }

  if (economyChart.value) {
    economyInstance = init(economyChart.value)
    economyInstance.setOption(economyOption.value)
  }

  window.addEventListener('resize', resizeCharts)
})

watch(populationOption, (option) => {
  populationInstance?.setOption(option, true)
})

watch(economyOption, (option) => {
  economyInstance?.setOption(option, true)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeCharts)
  populationInstance?.dispose()
  economyInstance?.dispose()
})
</script>

<template>
  <section class="charts-panel">
    <article class="chart-card chart-card-main">
      <div class="card-head">
        <div>
          <h2>Основная диаграмма</h2>
        </div>
        <strong>{{ simulation.params.difficulty === 'hard' ? 'Hard' : 'Normal' }}</strong>
      </div>
      <div ref="populationChart" class="chart" />
    </article>

    <div class="chart-grid">
      <article class="chart-card">
        <div class="card-head compact">
          <div>
            <h2>Экономика и вылов</h2>
          </div>
        </div>
        <div ref="economyChart" class="chart chart-small" />
      </article>

    </div>
  </section>
</template>

<style scoped>
.charts-panel {
  display: grid;
  gap: 24px;
}

.chart-card {
  position: relative;
  min-height: 314px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.94), rgba(248, 252, 249, 0.96)),
    var(--surface-strong);
  box-shadow: 0 16px 38px rgba(31, 55, 63, 0.07);
  padding: 20px 22px 14px;
}

.chart-card-main {
  min-height: 402px;
}

.chart-grid {
  display: grid;
  gap: 24px;
}

.card-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 8px;
}

.card-head span {
  display: block;
  margin-bottom: 8px;
  color: var(--muted);
  font-size: 11px;
  font-weight: 850;
  text-transform: uppercase;
}

.card-head h2 {
  margin: 0;
  color: #17334a;
  font-size: 18px;
  line-height: 1.15;
}

.card-head strong {
  border-radius: 6px;
  padding: 5px 8px;
  background: #e9f6ed;
  color: var(--blue-strong);
  font-size: 12px;
  font-weight: 850;
}

.card-head.compact {
  margin-bottom: 2px;
}

.chart {
  width: 100%;
  height: 330px;
}

.chart-small {
  height: 300px;
}

@media (max-width: 640px) {
  .chart-card {
    min-height: 300px;
    padding: 18px 12px 12px;
  }

  .chart {
    height: 244px;
  }

  .chart-card-main {
    min-height: 310px;
  }

}
</style>

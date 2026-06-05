<script setup lang="ts">
import {
  Activity,
  AlertTriangle,
  BookOpen,
  Gauge,
  Pause,
  Play,
  RotateCcw,
  StepForward
} from '@lucide/vue'
import MetricsStrip from '~/components/MetricsStrip.vue'
import ModelControls from '~/components/ModelControls.vue'
import SimulationCharts from '~/components/SimulationCharts.vue'
import TheoryPanel from '~/components/TheoryPanel.vue'
import { useSimulationStore } from '~/stores/simulation'

const simulation = useSimulationStore()

onMounted(() => {
  simulation.reset()
})

onBeforeUnmount(() => {
  simulation.stop()
})

const activeView = ref<'lab' | 'theory'>('lab')

const capacityUsage = computed(() => {
  const totalFish = simulation.state.juvenile + simulation.state.adult
  return Math.min(100, Math.round((totalFish / simulation.params.k) * 100))
})

</script>

<template>
  <div class="dashboard-shell">
    <aside class="nav-rail" aria-label="Навигация">
      <div class="rail-logo" aria-hidden="true">
        <Activity :size="24" />
      </div>

      <nav class="rail-nav">
        <button
          class="rail-button"
          :class="{ active: activeView === 'lab' }"
          type="button"
          title="Симулятор"
          @click="activeView = 'lab'"
        >
          <Gauge :size="20" />
        </button>
        <button
          class="rail-button"
          :class="{ active: activeView === 'theory' }"
          type="button"
          title="Теория"
          @click="activeView = 'theory'"
        >
          <BookOpen :size="20" />
        </button>
      </nav>

      <button class="rail-button rail-bottom" type="button" title="Сброс" @click="simulation.reset()">
        <RotateCcw :size="20" />
      </button>
    </aside>

    <aside class="project-sidebar">
      <section class="project-card">
        <div class="project-kicker">EcoFisher</div>
        <p>Математическая модель вылова и взаимодействия хищник-жертва</p>
      </section>

      <article class="mode-status-card" aria-label="Состояние популяции и экономики">
        <div class="mode-status-icon" :class="`status-tone-${simulation.populationView.tone}`">
          <AlertTriangle :size="24" />
        </div>
        <div class="mode-status-body">
          <strong class="population-status">
            Состояние популяции:
            <span class="population-status-value">
              {{ simulation.populationView.label }}
            </span>
          </strong>
          <strong class="economic-status">
            Экономика:
            <span class="economic-status-value">
              {{ simulation.economicStatus }}
            </span>
          </strong>
        </div>
      </article>

      <section class="progress-block">
        <div class="progress-head">
          <strong>{{ capacityUsage }}%</strong>
          <span>Заполнение K</span>
        </div>
        <div class="progress-track">
          <div :style="{ width: `${capacityUsage}%` }" />
        </div>
      </section>

    </aside>

    <main class="dashboard-main">
      <header class="dashboard-topbar">
        <nav class="top-tabs" aria-label="Разделы">
          <button
            class="top-tab"
            :class="{ active: activeView === 'lab' }"
            type="button"
            @click="activeView = 'lab'"
          >
            Панель симуляции
          </button>
          <button
            class="top-tab"
            :class="{ active: activeView === 'theory' }"
            type="button"
            @click="activeView = 'theory'"
          >
            Теория и модель
          </button>
        </nav>

        <div class="top-status" :class="{ running: simulation.running }">
          <span />
          {{ simulation.running ? 'Запущено' : 'Пауза' }}
        </div>
      </header>

      <section v-if="activeView === 'lab'" class="command-bar" aria-label="Управление симуляцией">
        <button
          class="button button-primary"
          type="button"
          :disabled="simulation.isExtinct"
          :title="simulation.isExtinct ? 'Популяция истреблена' : simulation.running ? 'Пауза' : 'Запустить симуляцию'"
          @click="simulation.toggleRunning()"
        >
          <Pause v-if="simulation.running" :size="18" />
          <Play v-else :size="18" />
          <span>{{ simulation.running ? 'Пауза' : 'Запустить' }}</span>
        </button>
        <button
          class="button button-muted"
          type="button"
          :disabled="simulation.isExtinct"
          :title="simulation.isExtinct ? 'Популяция истреблена' : 'Следующий месяц'"
          @click="simulation.tick()"
        >
          <StepForward :size="18" />
          <span>След. месяц</span>
        </button>
        <button class="icon-button command-reset" type="button" title="Заново" aria-label="Заново" @click="simulation.reset()">
          <RotateCcw :size="18" />
        </button>
      </section>

      <MetricsStrip v-if="activeView === 'lab'" />

      <section v-if="activeView === 'lab'" class="workspace" aria-label="Рабочая область симулятора">
        <div class="main-column">
          <SimulationCharts />
        </div>
        <div class="side-column">
          <ModelControls />
        </div>
      </section>

      <TheoryPanel v-else />
    </main>
  </div>
</template>

<style scoped>
.dashboard-shell {
  display: grid;
  grid-template-columns: 46px 212px minmax(0, 1fr);
  min-height: 100vh;
  background: #f5f8f6;
}

.nav-rail {
  position: sticky;
  top: 0;
  display: grid;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
  padding: 18px 0;
  background: var(--blue);
  color: #ffffff;
}

.rail-logo,
.rail-button {
  display: grid;
  width: 46px;
  height: 44px;
  place-items: center;
}

.rail-logo {
  color: #ffffff;
}

.rail-nav {
  display: grid;
  align-content: start;
  gap: 14px;
  margin-top: 88px;
}

.rail-button {
  border: 0;
  background: transparent;
  color: rgba(255, 255, 255, 0.72);
  text-decoration: none;
}

.rail-button:hover,
.rail-button.active {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.14);
}

.rail-bottom {
  align-self: end;
}

.project-sidebar {
  min-height: 100vh;
  border-right: 1px solid var(--border-soft);
  background: #ffffff;
  padding: 26px 22px;
}

.project-card {
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-soft);
}

.project-kicker {
  color: var(--blue-strong);
  font-size: 16px;
  font-weight: 850;
  text-transform: uppercase;
}

.project-card p {
  margin: 10px 0 0;
  color: var(--muted);
  font-size: 13px;
  line-height: 1.45;
}

h1 {
  margin: 0;
  color: #143329;
  font-size: 22px;
  line-height: 1.22;
  letter-spacing: 0;
  text-transform: none;
}

.project-card p {
  margin: 12px 0 0;
  color: var(--muted);
  font-size: 13px;
  line-height: 1.45;
}

.progress-block {
  padding: 24px 0;
  border-bottom: 1px solid var(--border-soft);
}

.progress-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
}

.progress-head strong {
  color: #112f25;
  font-size: 24px;
}

.progress-head span {
  color: var(--muted);
  font-size: 12px;
  font-weight: 760;
}

.progress-track {
  height: 5px;
  margin-top: 14px;
  overflow: hidden;
  border-radius: 999px;
  background: #e6eee8;
}

.progress-track div {
  height: 100%;
  border-radius: inherit;
  background: var(--blue);
}

.dashboard-main {
  min-width: 0;
  padding: 28px 28px 38px;
}

.dashboard-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 18px;
}

.top-tabs {
  display: flex;
  align-items: center;
  gap: 42px;
}

.top-tab {
  border: 0;
  background: transparent;
  color: #9aa8a0;
  font-size: 14px;
  font-weight: 820;
  text-decoration: none;
}

.top-tab.active {
  color: #142f25;
}

.command-bar {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) 42px;
  align-items: center;
  gap: 10px;
  width: min(390px, 100%);
  min-width: 0;
}

.top-status {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border-radius: 999px;
  background: #ffffff;
  border: 1px solid var(--border-soft);
  color: var(--muted);
  padding: 9px 12px;
  font-size: 12px;
  font-weight: 850;
}

.top-status span {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: var(--slate);
}

.top-status.running {
  color: var(--blue-strong);
}

.top-status.running span {
  background: var(--blue);
}

.command-bar {
  margin-left: auto;
  margin-bottom: 18px;
}

.command-bar .button {
  width: 100%;
  min-width: 0;
  padding-right: 12px;
  padding-left: 12px;
  white-space: nowrap;
}

.command-reset {
  flex: 0 0 auto;
}

.workspace {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(320px, 390px);
  gap: 24px;
}

.main-column,
.side-column {
  display: grid;
  align-content: start;
  gap: 24px;
}

.mode-status-card {
  display: grid;
  gap: 14px;
  align-items: start;
  margin: 16px 0 0;
  padding: 16px 0 24px;
  border-bottom: 1px solid var(--border-soft);
}

.mode-status-icon {
  display: grid;
  width: 58px;
  height: 58px;
  place-items: center;
  border-radius: 12px;
  background: #fff4df;
  color: var(--amber);
}

.mode-status-icon.status-tone-red {
  background: #ffe9e9;
  color: var(--red);
}

.mode-status-icon.status-tone-dark-red {
  background: #f9dedf;
  color: #9f1f2b;
}

.mode-status-icon.status-tone-orange {
  background: #fff0df;
  color: #c96c1c;
}

.mode-status-icon.status-tone-green {
  background: #e9f8ee;
  color: var(--green);
}

.mode-status-icon.status-tone-light-green {
  background: #edfbe8;
  color: #73c95e;
}

.mode-status-icon.status-tone-yellow {
  background: #fff6d8;
  color: #c99a16;
}

.mode-status-icon.status-tone-purple {
  background: #eee9ff;
  color: #7c5cc4;
}

.mode-status-body h2 {
  margin: 0 0 10px;
  color: #143329;
  font-size: 18px;
  line-height: 1.1;
}

.mode-status-body p {
  margin: 0 0 16px;
  color: var(--muted);
  font-size: 15px;
  line-height: 1.35;
}

.mode-status-body strong {
  display: block;
  color: #12304a;
  font-size: 16px;
  line-height: 1.35;
}

.population-status-value {
  display: block;
  margin-top: 4px;
  color: var(--blue);
  font-size: 13px;
  font-weight: 850;
  line-height: 1.3;
}

.economic-status {
  margin-top: 14px;
}

.economic-status-value {
  display: block;
  margin-top: 4px;
  color: var(--blue);
  font-size: 13px;
  font-weight: 850;
  line-height: 1.3;
}

@media (max-width: 1180px) {
  .dashboard-shell {
    grid-template-columns: 46px minmax(0, 1fr);
  }

  .project-sidebar {
    display: none;
  }

  .workspace {
    grid-template-columns: 1fr;
  }

  .command-bar {
    width: 100%;
    margin-left: 0;
  }

  .mode-status-card {
    display: none;
  }
}

@media (max-width: 640px) {
  .dashboard-shell {
    grid-template-columns: 1fr;
  }

  .nav-rail {
    position: static;
    display: flex;
    min-height: 54px;
    padding: 5px 10px;
  }

  .rail-logo,
  .rail-button {
    width: 42px;
    height: 44px;
  }

  .rail-nav {
    display: flex;
    gap: 6px;
    margin: 0 0 0 10px;
  }

  .rail-bottom {
    margin-left: auto;
  }

  .dashboard-main {
    padding: 16px 14px 28px;
  }

  .dashboard-topbar {
    align-items: flex-start;
    flex-direction: column;
  }

  .top-tabs {
    flex-wrap: wrap;
    gap: 14px;
  }

  .command-bar {
    gap: 8px;
  }

  .command-bar .button {
    font-size: 14px;
  }

}
</style>

<script setup lang="ts">
const harvestVariables = [
  { symbol: 'F(t)', text: 'количество рыбы в озере в момент времени t' },
  { symbol: 'r', text: 'естественная скорость размножения рыбы' },
  { symbol: 'K', text: 'вместимость озера, то есть максимум рыбы, который озеро может устойчиво поддерживать' },
  { symbol: 'H(t)', text: 'вылов рыбы' }
]

const predatorVariables = [
  { symbol: 'F(t)', text: 'количество рыбы-жертвы в момент времени t' },
  { symbol: 'P(t)', text: 'количество хищников в момент времени t' },
  { symbol: 'r', text: 'естественная скорость роста популяции рыбы' },
  { symbol: 'b', text: 'коэффициент хищничества: как часто хищник уничтожает рыбу' },
  { symbol: 'm', text: 'естественная смертность хищника' },
  { symbol: 'd', text: 'коэффициент роста хищника за счет съеденной рыбы' }
]

const simulatorVariables = [
  { symbol: 'J', text: 'мальки рыбы' },
  { symbol: 'F', text: 'взрослая рыба' },
  { symbol: 'P', text: 'популяция хищника' },
  { symbol: 'K', text: 'вместимость озера' },
  { symbol: 'r', text: 'коэффициент воспроизводства взрослой рыбы' },
  { symbol: 'μ', text: 'смертность мальков' },
  { symbol: 'g', text: 'скорость взросления мальков' },
  { symbol: 'δ', text: 'естественная смертность взрослой рыбы' },
  { symbol: 'E', text: 'усилие вылова' },
  { symbol: 'S', text: 'зарыбление' },
  { symbol: 'q', text: 'эффективность вылова' },
  { symbol: 'H', text: 'объем вылова' },
  { symbol: 'p', text: 'рыночная цена рыбы' },
  { symbol: 'c', text: 'затраты на вылов' },
  { symbol: 's', text: 'стоимость зарыбления' },
  { symbol: 'b', text: 'интенсивность хищничества' },
  { symbol: 'm', text: 'смертность хищника' },
  { symbol: 'd', text: 'рост хищника за счет добычи' },
  { symbol: 'Pmin', text: 'минимальная популяция хищников при наличии кормовой базы' },
  { symbol: 'Ffood', text: 'порог взрослой рыбы, ниже которого хищники могут исчезнуть' },
  { symbol: 'Прибыль', text: 'прибыль хозяйства за один шаг симуляции' },
  { symbol: 'Капитал', text: 'накопленный капитал компании за все месяцы симуляции' }
]
</script>

<template>
  <section class="theory panel">
    <header class="theory-header">
      <span>Теория и математическая модель</span>
      <h2>Модели вылова и хищник-жертва</h2>
      <p>
        EcoFisher - это симулятор рыболовного хозяйства, где можно управлять зарыблением,
        выловом и наблюдать, как меняется популяция рыбы. В основе проекта лежат базовые
        идеи дифференциальных уравнений, но главная цель - показать их простым и наглядным способом.
      </p>
      <p>
        Наша теория начинается с классических моделей дифференциальных уравнений: "Вылов рыбы" и "Хищник-жертва".
        Затем, мы разберем математическую модель самого симулятора и можно приступать к процессу моделирования собственного рыболовного хозяйства.
      </p>
    </header>

    <article class="theory-block">
      <h3>Модель вылова рыбы</h3>
      <p>
        Популяция рыбы сама растет, но человек часть рыбы вылавливает. Такая модель
        показывает баланс между естественным восстановлением озера и выловом.
      </p>
      <p>
        Рост популяции не может быть бесконечным: у озера есть вместимость
        <span class="inline-code">K</span>. Пока рыбы мало, она размножается быстрее.
        Когда численность приближается к пределу озера, рост замедляется.
      </p>

      <h4>Общая формула</h4>
      <div class="formula-panel">
        <pre>dF/dt = rF(1 - F/K) - H(t)</pre>
      </div>

      <h4>Расшифровка переменных</h4>
      <div class="variable-grid compact-grid">
        <article v-for="item in harvestVariables" :key="item.symbol" class="variable-card">
          <strong>{{ item.symbol }}</strong>
          <span>{{ item.text }}</span>
        </article>
      </div>
    </article>

    <article class="theory-block">
      <h3>Модель хищник-жертва</h3>
      <p>
        В модели хищник-жертва одна популяция служит пищей для другой. В нашем случае
        рыба является жертвой, а хищная рыба уменьшает ее численность.
      </p>
      <p>
        Если рыбы много, хищник получает достаточно пищи и его популяция растет.
        Если рыбы становится мало, хищник начинает сокращаться из-за естественной
        смертности. Поэтому система может давать колебания: сначала растет рыба,
        потом хищник, потом рыба падает, а следом падает и хищник.
      </p>

      <h4>Общая формула</h4>
      <div class="formula-panel">
        <pre>dF/dt = rF - bFP
dP/dt = -mP + dFP</pre>
      </div>

      <h4>Расшифровка переменных</h4>
      <div class="variable-grid compact-grid">
        <article v-for="item in predatorVariables" :key="item.symbol" class="variable-card">
          <strong>{{ item.symbol }}</strong>
          <span>{{ item.text }}</span>
        </article>
      </div>
    </article>

    <article class="theory-block">
      <h3>Математическая модель симулятора EcoFisher</h3>
      <p>
        После базовых моделей можно перейти к системе, которая используется в
        симуляторе. EcoFisher разделяет рыбу на мальков
        <span class="inline-code">J</span> и взрослую рыбу
        <span class="inline-code">F</span>. Игрок влияет на систему через
        зарыбление <span class="inline-code">S</span> и усилие вылова
        <span class="inline-code">E</span>.
      </p>
      <p>
        В режиме Normal учитываются размножение, взросление, вылов, естественная
        смертность и прибыль. В режиме Hard к этой системе добавляется хищник
        <span class="inline-code">P</span>: это модифицированная модель Лотки-Вольтерры
        с игровым ограничением, при котором хищники сохраняются на минимальном уровне,
        если взрослой рыбы достаточно для кормовой базы.
      </p>

      <div class="mode-formula">
        <h4>Normal Mode</h4>

        <section class="math-section">
          <h5>Система динамики популяции</h5>
          <div class="formula-panel system-panel system-panel-normal">
            <span class="system-brace" aria-hidden="true">
              <svg viewBox="0 0 18 100" preserveAspectRatio="none">
                <path d="M15 2 C7 2 7 12 7 21 V36 C7 43 4 47 1 50 C4 53 7 57 7 64 V79 C7 88 7 98 15 98" />
              </svg>
            </span>
            <div class="system-lines">
              <div class="formula-line">
                dJ/dt = rF(1 - F/K) - μJ - gJ + S
              </div>
              <div class="formula-line">
                dF/dt = gJ - H - δF
              </div>
            </div>
          </div>
        </section>

        <section class="math-section">
          <h5>Расчетные формулы</h5>
          <div class="calculation-grid">
            <div class="formula-panel formula-line">H = min(qEF, F)</div>
            <div class="formula-panel formula-line">Прибыль = pH - cE - sS</div>
            <div class="formula-panel formula-line">
              Капитал<sub>t+1</sub> = Капитал<sub>t</sub> + Прибыль · dt
            </div>
          </div>
        </section>
      </div>

      <div class="mode-formula">
        <h4>Hard Mode</h4>

        <section class="math-section">
          <h5>Система динамики популяции</h5>
          <div class="formula-panel system-panel system-panel-hard">
            <span class="system-brace" aria-hidden="true">
              <svg viewBox="0 0 18 100" preserveAspectRatio="none">
                <path d="M15 2 C7 2 7 12 7 21 V36 C7 43 4 47 1 50 C4 53 7 57 7 64 V79 C7 88 7 98 15 98" />
              </svg>
            </span>
            <div class="system-lines">
              <div class="formula-line">
                dJ/dt = rF(1 - F/K) - μJ - gJ + S
              </div>
              <div class="formula-line">
                dF/dt = gJ - H - δF - bFP
              </div>
              <div class="formula-line">
                dP/dt = -mP + dFP
              </div>
            </div>
          </div>
        </section>

        <section class="math-section">
          <h5>Дополнительное игровое ограничение</h5>
          <div class="formula-panel formula-line">
            P ≥ P<sub>min</sub>, если F &gt; F<sub>food</sub>
          </div>
          <p class="formula-note">
            При наличии достаточной кормовой базы хищники не могут полностью исчезнуть из экосистемы.
          </p>
        </section>

        <section class="math-section">
          <h5>Расчетные формулы</h5>
          <div class="calculation-grid">
            <div class="formula-panel formula-line">H = min(qEF, F)</div>
            <div class="formula-panel formula-line">Прибыль = pH - cE - sS</div>
            <div class="formula-panel formula-line">
              Капитал<sub>t+1</sub> = Капитал<sub>t</sub> + Прибыль · dt
            </div>
          </div>
        </section>
      </div>

      <h4>Расшифровка переменных</h4>
      <div class="variable-grid">
        <article v-for="item in simulatorVariables" :key="item.symbol" class="variable-card">
          <strong>{{ item.symbol }}</strong>
          <span>{{ item.text }}</span>
        </article>
      </div>
    </article>
  </section>
</template>

<style scoped>
.theory {
  display: grid;
  gap: 22px;
  max-width: 1320px;
  margin: 0;
  padding: 24px;
  box-shadow: 0 16px 38px rgba(31, 55, 63, 0.06);
}

.theory-header {
  border-bottom: 1px solid var(--border-soft);
  padding-bottom: 18px;
}

.theory-header span {
  display: block;
  margin-bottom: 10px;
  color: var(--muted);
  font-size: 12px;
  font-weight: 850;
  text-transform: uppercase;
}

.theory-header h2 {
  margin: 0;
  color: #17334a;
  font-size: 26px;
  line-height: 1.15;
}

.theory-header p {
  max-width: 760px;
  margin: 12px 0 0;
  color: var(--muted);
  font-size: 16px;
  line-height: 1.55;
}

.theory-block {
  border: 1px solid var(--border);
  border-radius: 8px;
  background: #f5faf7;
  padding: 24px;
}

.theory-block h3 {
  margin: 0;
  color: #18384f;
  font-size: 24px;
  line-height: 1.2;
}

.theory-block h4 {
  margin: 24px 0 0;
  color: #18384f;
  font-size: 18px;
  line-height: 1.2;
}

.theory-block h5 {
  margin: 18px 0 0;
  color: #18384f;
  font-size: 16px;
  line-height: 1.2;
}

.theory-block p {
  margin: 14px 0 0;
  color: #607969;
  font-size: 17px;
  line-height: 1.6;
}

.mode-formula {
  margin-top: 26px;
}

.mode-formula + .mode-formula {
  margin-top: 32px;
}

.math-section {
  margin-top: 16px;
}

.formula-panel {
  margin-top: 12px;
  border: 1px solid #b8ddc2;
  border-radius: 8px;
  background: #ffffff;
  padding: 18px;
}

.system-panel {
  display: flex;
  align-items: center;
  gap: 8px;
  overflow-x: auto;
  padding-top: 28px;
  padding-bottom: 28px;
}

.system-brace {
  display: flex;
  flex: 0 0 18px;
  align-items: stretch;
  align-self: center;
  color: #18344a;
}

.system-brace svg {
  width: 18px;
  overflow: visible;
}

.system-panel-normal .system-brace svg {
  height: 82px;
}

.system-panel-hard .system-brace svg {
  height: 116px;
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
  gap: 10px;
  min-width: max-content;
}

.formula-line {
  color: #18344a;
  font-family: "Cascadia Mono", "Fira Code", Consolas, monospace;
  font-size: 16px;
  line-height: 1.7;
}

.calculation-grid {
  display: grid;
  gap: 12px;
  margin-top: 12px;
}

.calculation-grid .formula-panel {
  margin-top: 0;
}

.formula-note {
  max-width: 720px;
}

pre {
  overflow-x: auto;
  margin: 0;
  color: #18344a;
  font-family: "Cascadia Mono", "Fira Code", Consolas, monospace;
  font-size: 15px;
  line-height: 1.7;
  white-space: pre-wrap;
}

.variable-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin-top: 16px;
}

.compact-grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.variable-card {
  border: 1px solid #b8ddc2;
  border-radius: 7px;
  background: #ffffff;
  padding: 14px;
}

.variable-card strong {
  display: block;
  color: var(--blue-strong);
  font-family: Georgia, "Times New Roman", serif;
  font-size: 21px;
  font-style: italic;
  font-weight: 400;
}

.variable-card span {
  display: block;
  margin-top: 10px;
  color: var(--muted);
  font-size: 14px;
  line-height: 1.4;
}

.inline-code {
  border: 1px solid #b8ddc2;
  border-radius: 4px;
  background: #eef8f1;
  padding: 1px 5px;
  font-family: "Cascadia Mono", "Fira Code", Consolas, monospace;
}

@media (max-width: 980px) {
  .variable-grid,
  .compact-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 560px) {
  .theory {
    padding: 18px;
  }

  .theory-block {
    padding: 18px 14px;
  }

  .theory-header h2 {
    font-size: 22px;
  }

  .theory-block h3 {
    font-size: 21px;
  }

  .variable-grid,
  .compact-grid {
    grid-template-columns: 1fr;
  }
}
</style>

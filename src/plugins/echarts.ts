/**
 * ECharts setup for Vue 3
 */

import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, BarChart, PieChart, ScatterChart, RadarChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  ToolboxComponent,
} from 'echarts/components'
import type { App } from 'vue'
import * as echarts from 'echarts/core'
import theme from './theme.json'

// Register ECharts components
use([
  CanvasRenderer,
  LineChart,
  BarChart,
  PieChart,
  ScatterChart,
  RadarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DatasetComponent,
  TransformComponent,
  ToolboxComponent,
])

// Register custom theme
echarts.registerTheme('custom', theme)

/**
 * Setup ECharts for Vue 3 app
 */
export function setupEcharts(app: App): void {
  app.component('VChart', VChart)
}

export { VChart }

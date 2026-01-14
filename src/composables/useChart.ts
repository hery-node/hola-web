/**
 * Chart composable for ECharts configuration
 * Provides basic chart setup, options, and responsive sizing
 */

import { ref, computed, onMounted, type Ref, type ComputedRef } from 'vue'
import type { ChartData, ChartStyle } from '@/types'

export interface UseChartOptions {
  data: Ref<ChartData>
  height?: string
  maxValue?: number
  chartStyle?: ChartStyle
  type?: string
  title?: string
  unit?: string
  getOption?: () => Record<string, unknown>
}

export interface UseChartReturn {
  loading: Ref<boolean>
  theme: string
  chartType: Ref<string>
  chartOption: Ref<Record<string, unknown>>
  chartHeight: ComputedRef<string>
  smallFontSize: number
  midFontSize: number
  largeFontSize: number
  setChartOption: () => void
}

/**
 * Composable for ECharts configuration
 */
export function useChart(options: UseChartOptions): UseChartReturn {
  const {
    data,
    height = '300px',
    maxValue,
    chartStyle = {},
    title,
    unit,
    getOption,
  } = options

  const loading = ref(true)
  const theme = 'custom'
  const chartType = ref('line')
  const chartOption = ref<Record<string, unknown>>({})

  const smallFontSize = 10
  const midFontSize = 12
  const largeFontSize = 14

  const chartHeight = computed(() => `height: ${height}`)

  /**
   * Get basic chart option configuration
   */
  const getBasicOption = (): Record<string, unknown> => {
    const chartData = data.value
    if (!chartData || chartData.length === 0) {
      return {}
    }

    const legendLength = chartData[0].length
    const series = [...Array(legendLength - 1)].map(() => ({ type: chartType.value }))
    const hasUnit = unit?.trim().length ?? 0 > 0
    const yAxis: Record<string, unknown> = hasUnit
      ? {
          type: 'value',
          axisLabel: { show: true, formatter: `{value} ${unit}` },
          boundaryGap: ['0', '20%'],
        }
      : {}

    const hasTitle = title?.trim().length ?? 0 > 0
    const titleConfig = hasTitle
      ? { text: title, textStyle: { fontSize: largeFontSize } }
      : {}
    const legend = hasTitle
      ? { show: legendLength < 20, bottom: '0%', textStyle: { fontSize: midFontSize } }
      : {}

    yAxis.min = 0
    if (maxValue) {
      yAxis.max = maxValue
    } else if (hasUnit && unit === '%') {
      yAxis.max = 100
    }

    return {
      title: titleConfig,
      legend,
      tooltip: {},
      dataset: { source: chartData },
      xAxis: { type: 'category' },
      yAxis,
      series,
    }
  }

  /**
   * Set chart option by merging basic and override options
   */
  const setChartOption = (): void => {
    const chartData = data.value
    if (chartData && chartData.length > 0) {
      const overrideOption = getOption ? getOption() : {}
      const basicOption = getBasicOption()
      chartOption.value = { ...basicOption, ...overrideOption, ...chartStyle }
      loading.value = false
    }
  }

  onMounted(() => {
    setChartOption()
  })

  return {
    loading,
    theme,
    chartType,
    chartOption,
    chartHeight,
    smallFontSize,
    midFontSize,
    largeFontSize,
    setChartOption,
  }
}

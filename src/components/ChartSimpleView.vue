<template>
  <div ref="chartRef" :class="styles">{{ message }}</div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import Chartist from "chartist";

/**
 * ChartSimpleView Component
 *
 * A simple chart component using Chartist library for lightweight charts.
 * Supports Bar, Line, and Pie charts with responsive options and custom event handlers.
 *
 * Features:
 * - Chartist-based rendering (lighter than ECharts)
 * - Responsive chart ratios (square, golden, etc.)
 * - Custom event handlers support
 * - Responsive options for different screen sizes
 * - No-data state with custom message
 * - Auto-redraw on data/options change
 */

interface EventHandler {
  event: string;
  fn: (...args: unknown[]) => void;
}

interface NoDataOptions {
  message?: string;
  class?: string;
}

// Props
const props = withDefaults(
  defineProps<{
    type: "Pie" | "Line" | "Bar";
    ratio?: string;
    data?: Chartist.IChartistData;
    options?: Chartist.IChartOptions;
    eventHandlers?: EventHandler[];
    responsiveOptions?: Chartist.IResponsiveOptionTuple<Chartist.IChartOptions>[];
    noData?: NoDataOptions;
  }>(),
  {
    ratio: "ct-square",
    data: () => ({ series: [], labels: [] }),
    options: () => ({}),
    eventHandlers: () => [],
    responsiveOptions: () => [],
    noData: () => ({ message: "", class: "ct-nodata" }),
  }
);

// Refs
const chartRef = ref<HTMLElement | null>(null);
const chart = ref<Chartist.IChartistBase<Chartist.IChartOptions> | null>(null);
const message = ref("");

// Computed
const styles = computed(() => {
  return [props.ratio, { [noDataOptions.value.class || "ct-nodata"]: hasNoData.value }];
});

const hasNoData = computed(() => {
  return (
    !props.data ||
    !props.data.series ||
    props.data.series.length < 1 ||
    (props.type !== "Pie" &&
      !(props.options as Record<string, unknown>)?.distributeSeries &&
      (props.data.series as unknown[]).every((series) => {
        if (Array.isArray(series)) {
          return !series.length;
        }
        return !(series as { data?: unknown[] }).data?.length;
      }))
  );
});

const noDataOptions = computed(() => {
  return {
    message: ((props.options as Record<string, unknown>)?.messageNoData as string) || props.noData?.message || "",
    class: ((props.options as Record<string, unknown>)?.classNoData as string) || props.noData?.class || "ct-nodata",
  };
});

// Methods
function clear() {
  message.value = "";
}

function draw() {
  if (hasNoData.value || !chartRef.value) {
    chart.value = null;
  } else {
    if (props.type === "Bar") {
      chart.value = new Chartist.Bar(chartRef.value, props.data, props.options, props.responsiveOptions);
    } else if (props.type === "Pie") {
      chart.value = new Chartist.Pie(chartRef.value, props.data, props.options, props.responsiveOptions);
    } else {
      chart.value = new Chartist.Line(chartRef.value, props.data, props.options, props.responsiveOptions);
    }
  }

  setEventHandlers();
}

function redraw() {
  chart.value ? chart.value.update(props.data, props.options) : draw();
}

function resetEventHandlers(newHandlers: EventHandler[], oldHandlers: EventHandler[]) {
  if (!chart.value) return;

  for (const item of oldHandlers) {
    chart.value.off(item.event, item.fn);
  }
  for (const item of newHandlers) {
    chart.value.on(item.event, item.fn);
  }
}

function setEventHandlers() {
  if (chart.value && props.eventHandlers) {
    for (const item of props.eventHandlers) {
      chart.value.on(item.event, item.fn);
    }
  }
}

function setNoData() {
  message.value = noDataOptions.value.message;
}

// Watchers
watch(() => props.ratio, redraw);
watch(() => props.options, redraw, { deep: true });
watch(() => props.responsiveOptions, redraw, { deep: true });
watch(() => props.data, redraw, { deep: true });
watch(() => props.type, draw);
watch(
  () => props.eventHandlers,
  (newVal, oldVal) => {
    resetEventHandlers(newVal, oldVal);
  }
);
watch(
  hasNoData,
  (val) => {
    if (val) {
      setNoData();
    } else {
      clear();
    }
  },
  { immediate: true }
);

// Lifecycle
onMounted(() => {
  draw();
});

// Expose
defineExpose({
  draw,
  redraw,
});
</script>

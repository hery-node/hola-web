<template>
  <CardView class="v-card--material-chart" v-bind="$attrs">
    <template #header>
      <ChartSimpleView :type="type" :options="options" :data="(data as ChartSimpleData)"></ChartSimpleView>
    </template>
    <h4 class="title font-weight-light text-black">{{ title }}</h4>
    <v-icon class="mr-2" size="small" :color="subIconColor">{{ subIcon }}</v-icon>
    <span class="caption text-grey font-weight-light">{{ subText }}</span>
  </CardView>
</template>

<script setup lang="ts">
import CardView from "./CardView.vue";
import ChartSimpleView from "./ChartSimpleView.vue";
import type { LineChartData, BarChartData, PieChartData } from "chartist";

type ChartSimpleData = LineChartData | BarChartData | PieChartData;

/**
 * ChartDashboardView Component
 *
 * A material design card component that displays a simple chart in the header.
 * Used for dashboard widgets to show key metrics with visual representation.
 *
 * Features:
 * - Material design card with offset chart header
 * - Supports Pie, Line, and Bar chart types
 * - Icon with customizable color
 * - Title and subtitle text
 * - Chartist integration for simple charts
 */

interface ChartData {
  series: unknown[];
  labels?: string[];
}

// Props
withDefaults(
  defineProps<{
    type: "Pie" | "Line" | "Bar";
    title?: string;
    subText?: string;
    subIcon?: string;
    subIconColor?: string;
    data?: ChartData;
    options?: Record<string, unknown>;
  }>(),
  {
    data: () => ({ series: [], labels: [] }),
    options: () => ({}),
  }
);
</script>

<style lang="scss">
.v-card--material-chart {
  .v-card--material__header {
    .ct-label {
      color: inherit;
      opacity: 0.7;
      font-size: 0.975rem;
      font-weight: 100;
    }

    .ct-grid {
      stroke: rgba(255, 255, 255, 0.2);
    }
    .ct-series-a .ct-point,
    .ct-series-a .ct-line,
    .ct-series-a .ct-bar,
    .ct-series-a .ct-slice-donut {
      stroke: rgba(255, 255, 255, 0.8);
    }
    .ct-series-a .ct-slice-pie,
    .ct-series-a .ct-area {
      fill: rgba(255, 255, 255, 0.4);
    }
  }
}
</style>

<template>
  <v-card v-bind="$attrs" :style="styles">
    <h-offset v-if="hasOffset" :inline="inline" :full-width="fullWidth" :offset="offset">
      <v-card v-if="!slots.offset" :color="color" :class="`elevation-${elevation}`" class="v-card--material__header" theme="dark">
        <slot v-if="!title && !text" name="header" />
        <span v-else>
          <h4 class="title font-weight-light mb-2" v-text="title" />
          <p class="category font-weight-thin" v-text="text" />
        </span>
      </v-card>
      <slot v-else name="offset" />
    </h-offset>

    <v-card-text>
      <slot />
    </v-card-text>

    <v-divider v-if="slots.actions" class="mx-3" />

    <v-card-actions v-if="slots.actions">
      <slot name="actions" />
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { computed, useSlots } from "vue";

/**
 * Card view component with offset header
 * Provides material design card with optional header offset
 */

// Props
const props = withDefaults(
  defineProps<{
    color?: string;
    elevation?: number | string;
    inline?: boolean;
    fullWidth?: boolean;
    offset?: number | string;
    title?: string;
    text?: string;
  }>(),
  {
    color: "secondary",
    elevation: 10,
    inline: false,
    fullWidth: false,
    offset: 24,
  }
);

// Slots
const slots: ReturnType<typeof useSlots> = useSlots();

/** Check if card has offset header */
const hasOffset = computed(() => {
  return !!(slots.header || slots.offset || props.title || props.text);
});

/** Get card margin styles */
const styles = computed(() => {
  if (!hasOffset.value) return undefined;
  const offsetNum = typeof props.offset === "string" ? parseInt(props.offset) : props.offset;
  return {
    marginBottom: `${offsetNum}px`,
    marginTop: `${offsetNum * 2}px`,
  };
});
</script>

<style>
.v-card {
  box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.14) !important;
  border-radius: 3px;
}

.v-card .category {
  margin: 0;
}

.v-card .title {
  margin-top: 0;
  line-height: 1.5em !important;
  letter-spacing: 0 !important;
  font-size: 1.125rem !important;
  margin-bottom: 5px !important;
}

.v-card .v-divider {
  border-top: 1px solid #eee;
  margin-left: 20px !important;
  margin-right: 20px !important;
  margin-bottom: 1px;
}

.v-card .v-offset {
  top: -20px !important;
  margin-bottom: -20px !important;
}

.v-card .v-offset .category {
  color: rgba(255, 255, 255, 0.62);
}

.v-card .v-offset .v-card--material__header.v-card {
  padding: 15px;
}

.v-card .v-card__actions {
  margin: 0 20px 0;
  padding: 10px 0 10px;
  line-height: 22px;
}

.v-card--material-chart.v-card:not(.v-card--material__header) {
  margin: 25px 0 !important;
}

.v-card--material-chart.v-card .v-card--material__header {
  border-radius: 6px;
  min-height: 160px;
  padding: 0 !important;
}

.v-card--material-chart.v-card .v-card--material__header .ct-label {
  font-size: 0.73rem;
}

.v-card--material-chart.v-card .title {
  margin-top: 0;
}

.v-card--material-chart.v-card .category {
  margin: 0 !important;
  line-height: 22px;
  color: #999;
}

.v-card--material-chart.v-card .v-card__text {
  padding: 15px 20px;
  line-height: 22px;
}

.v-card--material-stats.v-card:not(.v-card--material__header),
.v-card--material-chart.v-card:not(.v-card--material__header) {
  margin: 25px 0 !important;
}

.v-card.info {
  background: linear-gradient(60deg, #26c6da, #00acc1) !important;
  box-shadow: 0 12px 20px -10px rgba(0, 188, 212, 0.28), 0 4px 20px 0px rgba(0, 0, 0, 0.12), 0 7px 8px -5px rgba(0, 188, 212, 0.2) !important;
}

.v-card.red {
  background: linear-gradient(60deg, #ef5350, #e53935) !important;
  box-shadow: 0 12px 20px -10px rgba(244, 67, 54, 0.28), 0 4px 20px 0px rgba(0, 0, 0, 0.12), 0 7px 8px -5px rgba(244, 67, 54, 0.2) !important;
}

.v-card.green {
  background: linear-gradient(60deg, #66bb6a, #43a047) !important;
  box-shadow: 0 12px 20px -10px rgba(76, 175, 80, 0.28), 0 4px 20px 0px rgba(0, 0, 0, 0.12), 0 7px 8px -5px rgba(76, 175, 80, 0.2) !important;
}

.v-card.orange {
  background: linear-gradient(60deg, #ffa726, #fb8c00) !important;
  box-shadow: 0 12px 20px -10px rgba(255, 152, 0, 0.28), 0 4px 20px 0px rgba(0, 0, 0, 0.12), 0 7px 8px -5px rgba(255, 152, 0, 0.2) !important;
}

.v-card.purple {
  background: linear-gradient(60deg, #ab47bc, #8e24aa) !important;
  box-shadow: 0 12px 20px -10px rgba(156, 39, 176, 0.28), 0 4px 20px 0px rgba(0, 0, 0, 0.12), 0 7px 8px -5px rgba(156, 39, 176, 0.2) !important;
}

.v-card--material-stats.v-card .v-offset {
  position: absolute;
}

.v-card--material-stats.v-card .v-offset .v-card {
  max-width: 85px;
  max-height: 85px;
  line-height: 85px;
  padding: 15px !important;
}

.v-card--material-stats.v-card .v-offset .v-card i {
  font-size: 36px !important;
  line-height: 56px;
  width: 56px;
  height: 56px;
}

.v-card--material-stats.v-card .v-card__text {
  text-align: right;
  padding-top: 10px;
  position: relative;
}

.v-card--material-stats.v-card .title {
  margin: 0 !important;
  line-height: 1.5em !important;
  letter-spacing: 0 !important;
  font-size: 1.5625rem !important;
}

.v-card--material-stats.v-card .title small {
  color: #999;
  font-size: 65%;
  line-height: 1;
  font-weight: 400;
}

.v-card--material-stats.v-card .v-card__actions i {
  position: relative;
  top: -1px;
  font-size: 16px !important;
}

.v-card--material-stats.v-card .v-card__actions .caption {
  color: #999;
}

.v-card-profile {
  display: inline-block;
}

.v-card-profile .v-offset {
  top: unset !important;
  margin-bottom: unset !important;
  margin-top: -50px;
}

.v-card-profile .v-card__text .v-card__text {
  padding-bottom: 0;
}

.v-card-profile .v-card__text {
  padding: 15px;
}

.v-card-profile img {
  box-shadow: 0 10px 30px -12px rgba(0, 0, 0, 0.42), 0 4px 25px 0px rgba(0, 0, 0, 0.12), 0 8px 10px -5px rgba(0, 0, 0, 0.2);
}

.v-card--flat {
  background-color: transparent !important;
  box-shadow: none;
}

.v-card--flat .v-table {
  background-color: transparent;
}

.v-card--material__header.v-card {
  border-radius: 4px;
}
</style>

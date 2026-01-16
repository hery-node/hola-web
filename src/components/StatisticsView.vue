<template>
  <CardView v-bind="$attrs" class="v-card--material-stats">
    <template v-if="!mobile" #offset>
      <v-card :class="`elevation-${elevation}`" :color="color" class="pa-4" theme="dark">
        <v-icon size="40" class="mb-7"> {{ icon }} </v-icon>
      </v-card>
    </template>
    <div :class="{ 'text-right': !mobile, 'text-center': mobile }">
      <p class="category font-weight-light" v-text="title" />
      <h3 :class="textClass">
        {{ value }} <small>{{ smallValue }}</small>
      </h3>
    </div>

    <template #actions>
      <v-icon :color="subIconColor" size="20" class="mr-2">
        {{ subIcon }}
      </v-icon>
      <span class="caption text-blue-grey" v-text="subText" />
    </template>
  </CardView>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useDisplay } from "vuetify";
import CardView from "./CardView.vue";

/**
 * StatisticsView Component
 *
 * A material design statistics card that displays a metric with icon, title, and subtitle.
 * Uses CardView for consistent card styling with offset icon card.
 *
 * Features:
 * - Large icon in offset colored card
 * - Primary value with optional small suffix
 * - Customizable text color
 * - Action slot with icon and text
 * - Responsive layout (centered on mobile)
 * - Material design elevation
 */

// Props - including CardView props
const props = withDefaults(
  defineProps<{
    // CardView props
    color?: string;
    elevation?: number | string;
    inline?: boolean;
    fullWidth?: boolean;
    offset?: number | string;
    // StatisticsView props
    icon: string;
    textColor?: string;
    subIcon?: string;
    subIconColor?: string;
    subText?: string;
    title?: string;
    value?: string;
    smallValue?: string;
  }>(),
  {
    color: "secondary",
    elevation: 10,
    inline: false,
    fullWidth: false,
    offset: 24,
    textColor: "black",
  }
);

// Composables
const { mobile } = useDisplay();

// Computed
const textClass = computed(() => {
  return `title display-1 font-weight-light text-${props.textColor}`;
});
</script>

<style lang="scss">
/* Styles for StatisticsView - unscoped to properly target nested CardView elements */
.v-card--material-stats {
  display: flex;
  flex-wrap: wrap;
  position: relative;

  > .v-offset {
    display: inline-block;
    flex: 0 1;
    margin-left: 0;
    margin-right: auto;
    max-width: auto;
    padding: 0 16px 0;
  }

  .v-card {
    border-radius: 4px;
    flex: 0 1 auto;
  }

  .v-card__text {
    display: inline-block;
    position: absolute;
    top: 0;
    right: 0;
    width: 100%;
  }

  .v-card__actions {
    flex: 1 0 100%;
  }
}

.v-card--material-stats.v-card .v-offset .v-card {
  max-width: 65px;
  max-height: 65px;
  line-height: 65px;
  padding: 12px !important;
  margin-top: 35px;
}
</style>

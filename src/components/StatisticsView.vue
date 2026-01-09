<template>
  <h-card v-bind="$attrs" class="v-card--material-stats" v-on="$listeners">
    <v-card v-if="!$vuetify.breakpoint.xsOnly" slot="offset" :class="`elevation-${elevation}`" :color="color" class="pa-4" dark>
      <v-icon size="40" class="mb-7"> {{ icon }} </v-icon>
    </v-card>
    <div :class="{ 'text-right': !$vuetify.breakpoint.xsOnly, 'text-center': $vuetify.breakpoint.xsOnly }">
      <p class="category font-weight-light" v-text="title" />
      <h3 :class="text_class">
        {{ value }} <small>{{ smallValue }}</small>
      </h3>
    </div>

    <template slot="actions">
      <v-icon :color="subIconColor" size="20" class="mr-2">
        {{ subIcon }}
      </v-icon>
      <span class="caption blue-grey--text" v-text="subText" />
    </template>
  </h-card>
</template>

<script>
/**
 * StatisticsView Component
 * 
 * A material design statistics card that displays a metric with icon, title, and subtitle.
 * Extends CardView for consistent card styling with offset icon card.
 * 
 * Features:
 * - Large icon in offset colored card
 * - Primary value with optional small suffix
 * - Customizable text color
 * - Action slot with icon and text
 * - Responsive layout (centered on mobile)
 * - Material design elevation
 */
import CardView from "./CardView";

export default {
  inheritAttrs: false,

  props: {
    ...CardView.props,
    /** Material Design icon name */
    icon: { type: String, required: true },
    /** Primary text color */
    textColor: { type: String, default: "black" },
    /** Action icon */
    subIcon: { type: String },
    /** Action icon color */
    subIconColor: { type: String },
    /** Action text */
    subText: { type: String },
    /** Card title */
    title: { type: String },
    /** Primary value to display */
    value: { type: String },
    /** Small value suffix */
    smallValue: { type: String },
  },
  
  computed: {
    /**
     * Generate text class with color
     * @returns {string} Combined CSS classes for value text
     */
    text_class() {
      return `title display-1 font-weight-light ${this.textColor}--text`;
    },
  },
};
</script>

<style lang="scss">
.v-card--material-stats {
  display: flex;
  flex-wrap: wrap;
  position: relative;

  .v-offset {
    display: inline-block;
    flex: 0 1;
    margin-top: 0;
    margin-left: 0;
    margin-right: auto;
    margin-bottom: 0 !important;
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
</style>

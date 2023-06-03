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
import CardView from "./CardView";

export default {
  inheritAttrs: false,

  props: {
    ...CardView.props,
    icon: { type: String, required: true },
    textColor: { type: String, default: "black" },
    subIcon: { type: String },
    subIconColor: { type: String },
    subText: { type: String },
    title: { type: String },
    value: { type: String },
    smallValue: { type: String },
  },
  computed: {
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

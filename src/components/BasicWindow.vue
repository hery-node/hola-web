<template>
  <v-dialog v-model="dialog" persistent :fullscreen="expanded" :max-width="window_width" :style="{ zIndex: zIndex }" @keydown.esc="close">
    <v-app-bar :color="barColor" dark>
      <v-app-bar-nav-icon></v-app-bar-nav-icon>
      <v-toolbar-title>{{ title }}</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon @click.stop="expand" v-show="!expanded">
        <v-icon>mdi-arrow-expand</v-icon>
      </v-btn>
      <v-btn icon @click.stop="collapse" v-show="expanded">
        <v-icon>mdi-arrow-collapse</v-icon>
      </v-btn>
      <v-btn icon @click.stop="close">
        <v-icon>mdi-close-box-outline</v-icon>
      </v-btn>
    </v-app-bar>
    <v-card :height="window_height">
      <v-card-text>
        <slot></slot>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  inheritAttrs: false,

  props: {
    title: { type: String, required: true },
    width: { type: String, default: "80%" },
    height: { type: String },
    zIndex: { type: Number, default: 200 },
    barColor: { type: String, default: "#6A76AB" },
  },

  data() {
    return {
      dialog: false,
      expanded: false,
      window_width: this.width,
      window_height: this.height,
    };
  },

  methods: {
    collapse() {
      this.window_width = this.width;
      this.window_height = this.height;
      this.expanded = false;
    },

    expand() {
      this.expanded = true;
    },

    show() {
      this.dialog = true;
    },

    close() {
      this.dialog = false;
    },
  },
};
</script>

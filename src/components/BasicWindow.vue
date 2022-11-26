<template>
  <v-dialog v-model="dialog" persistent :fullscreen="fullscreen" hide-overlay :max-width="window_width" :style="{ zIndex: zIndex }" @keydown.esc="close">
    <v-app-bar color="secondary" dark>
      <v-app-bar-nav-icon></v-app-bar-nav-icon>
      <v-toolbar-title>{{ title }}</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon @click.stop="expand" v-show="!fullscreen">
        <v-icon>mdi-arrow-expand</v-icon>
      </v-btn>
      <v-btn icon @click.stop="collapse" v-show="fullscreen">
        <v-icon>mdi-arrow-collapse</v-icon>
      </v-btn>
      <v-btn icon @click.stop="close">
        <v-icon>mdi-close-box-outline</v-icon>
      </v-btn>
    </v-app-bar>
    <div ref="content" style="width: 100%; height: 100%; display: block; background-color: white">
      <slot />
    </div>
  </v-dialog>
</template>

<script>
export default {
  inheritAttrs: false,

  props: {
    title: { type: String, required: true },
    width: { type: String, default: "80%" },
    zIndex: { type: Number, default: 200 },
  },

  data() {
    return {
      dialog: false,
      fullscreen: false,
      window_width: this.width,
      original_height: "",
    };
  },

  methods: {
    collapse() {
      this.window_width = this.width;
      this.fullscreen = false;
      this.$refs["content"].style.height = this.original_height + "px";
      this.$emit("resize", this.fullscreen);
    },

    expand() {
      this.fullscreen = true;
      const height = window.innerHeight - 66;
      this.$refs["content"].style.height = height + "px";
      this.$emit("resize", this.fullscreen);
    },

    show() {
      this.dialog = true;
      setTimeout(() => {
        this.original_height = this.$refs["content"].offsetHeight;
      }, 500);
    },

    close() {
      this.dialog = false;
      this.$emit("close");
    },
  },
};
</script>

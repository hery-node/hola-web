<template>
  <v-dialog :width="win_width" v-model="dialog" persistent :fullscreen="fullscreen" hide-overlay :max-width="window_width" :style="{ zIndex: zIndex }" @keydown.esc="close">
    <v-app-bar ref="win_bar" :collapse="minimized" color="secondary" dark>
      <v-icon class="mr-3">mdi-microsoft-windows</v-icon>
      <v-toolbar-title>{{ title }}</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon @click.stop="minimize" v-show="!minimized" :disabled="button_disabled">
        <v-icon>mdi-window-minimize</v-icon>
      </v-btn>
      <v-btn icon @click.stop="maximize" v-show="minimized" :disabled="button_disabled">
        <v-icon>mdi-window-maximize</v-icon>
      </v-btn>
      <v-btn icon @click.stop="expand" v-show="!fullscreen" :disabled="button_disabled">
        <v-icon>mdi-arrow-expand</v-icon>
      </v-btn>
      <v-btn icon @click.stop="collapse" v-show="fullscreen" :disabled="button_disabled">
        <v-icon>mdi-arrow-collapse</v-icon>
      </v-btn>
      <v-btn icon @click.stop="close">
        <v-icon>mdi-close-box-outline</v-icon>
      </v-btn>
    </v-app-bar>
    <div ref="content" style="width: 100%; height: 100%; display: block; background-color: white" v-show="!minimized">
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
      minimized: false,
      button_disabled: false,
      window_width: this.width,
      original_height: 0,
      win_width: this.width,
    };
  },

  methods: {
    minimize() {
      this.minimized = true;
      this.win_width = "100px";
    },

    maximize() {
      this.minimized = false;
      this.win_width = this.width;
    },

    collapse() {
      this.window_width = this.width;
      this.fullscreen = false;
      this.$refs["content"].style.height = this.original_height + "px";
      this.$emit("resize", { width: this.width, height: this.original_height });
    },

    expand() {
      this.fullscreen = true;
      const height = window.innerHeight - 66;
      this.$refs["content"].style.height = height + "px";
      this.$emit("resize", { width: "100%", height: height });
    },

    show() {
      this.dialog = true;
      this.button_disabled = true;
      setTimeout(() => {
        this.original_height = this.$refs["content"].offsetHeight;
        this.button_disabled = false;
      }, 1000);
    },

    close() {
      this.dialog = false;
      this.$emit("close");
    },
  },
};
</script>

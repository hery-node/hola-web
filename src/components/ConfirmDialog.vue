<template>
  <v-dialog v-model="dialog" :max-width="width" :style="{ zIndex: zIndex }" @keydown.esc="cancel">
    <v-card>
      <v-toolbar dark :class="titleClass" dense flat>
        <v-toolbar-title> {{ title }} </v-toolbar-title>
      </v-toolbar>
      <v-card-text v-show="!!message" class="pa-4 black--text" v-html="message"></v-card-text>
      <v-card-actions class="pt-3">
        <v-spacer></v-spacer>
        <v-btn v-if="!hideCancel" color="grey" text class="body-2 font-weight-bold" outlined @click.native="cancel">{{ $t("confirm.no") }}</v-btn>
        <v-btn color="success" class="body-2 font-weight-bold" outlined @click.native="agree">{{ $t("confirm.yes") }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  inheritAttrs: false,

  props: {
    width: { type: String, default: "800px" },
    zIndex: { type: Number, default: 200 },
    titleClass: { type: String, default: "warning text-body-2 font-weight-bold white--text" },
    //hide cancel button
    hideCancel: { type: Boolean, default: false },
  },

  data() {
    return {
      dialog: false,
      title: "",
      message: "",
      resolve: null,
      reject: null,
    };
  },

  methods: {
    open(title, message) {
      this.title = title;
      this.message = message;
      this.dialog = true;
      return new Promise((resolve, reject) => {
        this.resolve = resolve;
        this.reject = reject;
      });
    },

    agree() {
      this.resolve(true);
      this.dialog = false;
    },

    cancel() {
      this.resolve(false);
      this.dialog = false;
    },
  },
};
</script>

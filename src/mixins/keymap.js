export default {
  created() {
    window.addEventListener("keydown", this.run_keybind);
  },

  destroyed() {
    window.removeEventListener("keydown", this.run_keybind);
  },

  methods: {
    run_keybind(event) {
      if (event.key === "Escape" || event.keyCode === 27) {
        this.press_esc && this.press_esc();
      } else if (this.press_key) {
        this.press_key(event);
      }
    },
  },
};

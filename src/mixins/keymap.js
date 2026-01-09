/**
 * Keymap mixin for keyboard event handling
 * Automatically registers/unregisters keydown listener
 * Expects press_esc() and/or press_key(event) methods in component
 */
export default {
  created() {
    window.addEventListener("keydown", this.run_keybind);
  },

  destroyed() {
    window.removeEventListener("keydown", this.run_keybind);
  },

  methods: {
    /**
     * Handle keydown event
     * @param {KeyboardEvent} event - Keyboard event
     */
    run_keybind(event) {
      if (event.key === "Escape" || event.keyCode === 27) {
        this.press_esc?.();
      } else if (this.press_key) {
        this.press_key(event);
      }
    },
  },
};

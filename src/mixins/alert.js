/**
 * Alert mixin for displaying toast messages
 * Provides methods to show success, info, warning, and error alerts
 */
export default {
  data() {
    return { alert: { shown: false, type: "info", msg: "" } };
  },

  methods: {
    /**
     * Show success alert
     * @param {string} msg - Message to display
     * @param {number} [delay] - Auto-hide delay in ms (default: 15000)
     */
    show_success(msg, delay) {
      this.show_alert("success", msg, delay);
    },

    /**
     * Show info alert
     * @param {string} msg - Message to display
     * @param {number} [delay] - Auto-hide delay in ms
     */
    show_info(msg, delay) {
      this.show_alert("info", msg, delay);
    },

    /**
     * Show warning alert
     * @param {string} msg - Message to display
     * @param {number} [delay] - Auto-hide delay in ms
     */
    show_warning(msg, delay) {
      this.show_alert("warning", msg, delay);
    },

    /**
     * Show error alert
     * @param {string} msg - Message to display
     * @param {number} [delay] - Auto-hide delay in ms
     */
    show_error(msg, delay) {
      this.show_alert("error", msg, delay);
    },

    /**
     * Show alert with specified type
     * @param {string} type - Alert type (success|info|warning|error)
     * @param {string} msg - Message to display
     * @param {number} [delay] - Auto-hide delay in ms
     */
    show_alert(type, msg, delay) {
      const time = delay ?? 15000;
      this.alert.shown = true;
      this.alert.type = type;
      this.alert.msg = msg ? msg.replace(/\n/g, "<br />") : "";
      if (delay !== 0 && delay !== undefined) {
        setTimeout(() => (this.alert.shown = false), time);
      }
    },
  },
};

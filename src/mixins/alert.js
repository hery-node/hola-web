export default {
    data() {
        return { alert: { shown: false, type: "info", msg: "" } }
    },

    methods: {
        show_success(msg, delay) {
            this.show_alert("success", msg, delay);
        },

        show_info(msg, delay) {
            this.show_alert("info", msg, delay);
        },

        show_warning(msg, delay) {
            this.show_alert("warning", msg, delay);
        },

        show_error(msg, delay) {
            this.show_alert("error", msg, delay);
        },

        show_alert(type, msg, delay) {
            const time = delay ? delay : 5000;
            this.alert.shown = true;
            this.alert.type = type;
            this.alert.msg = msg;
            delay || delay == 0 || setTimeout(() => (this.alert.shown = false), time);
        }
    }
};

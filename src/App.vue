<template>
  <h-array :entity="entity" :id="ids" field-name="network"></h-array>
</template>

<script>
import { axios_post, is_success_response } from "./core/axios";

export default {
  data() {
    return {
      ids: "60757b831e482deace70b3df",
      recommend: { "CPU family": 7, cpu_model: "Intel(R) Xeon(R) Gold 8080R CPU @ 2.70GHz" },
      mode: "crud",
      entity: "host",
      label_key: "ip",
      sort_key: ["ip"],
      sort_desc: [false],
      headers: [{ name: "cpu_model" }, { name: "disk_model", chip: true }, { name: "network_model" }, { name: "cpu" }],
      actions: [{ color: "edit", icon: "mdi-refresh", tooltip: this.$t("host.refresh_host"), handle: this.refresh_host }],
      toolbars: [{ color: "edit", icon: "mdi-compass-outline", tooltip: "compared", click: this.refresh_host }],
    };
  },
  methods: {
    async refresh_host(item) {
      const url = "/host/refresh";
      const { code } = await axios_post(url, { _id: item["_id"] });
      if (is_success_response(code) && this.$refs.table) {
        this.$refs.table.refresh();
      }
    },
    row_clicked() {},
  },
};
</script>

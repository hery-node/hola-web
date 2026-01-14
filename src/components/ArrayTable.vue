<template>
  <v-card v-bind="$attrs">
    <v-toolbar v-if="showToolbar" :class="toolbarClass">
      <v-text-field v-model="search" append-inner-icon="mdi-magnify" :label="searchHintText" single-line hide-details clearable density="compact" variant="outlined" />
      <template v-if="showDownloadIcon">
        <v-btn class="ml-2" color="primary" variant="text" @click="downloadResult">
          <v-icon class="mr-3">mdi-cloud-download</v-icon>
          {{ t("compare.download") }}
        </v-btn>
      </template>
    </v-toolbar>

    <v-data-table v-bind="$attrs" :headers="tableHeaders" :items="items" :search="search" :items-per-page="-1" :custom-filter="regexSearch">
      <template #[`item._action`]="{ item }">
        <v-tooltip v-for="(action, index) in actions" :key="index" location="bottom">
          <template #activator="{ props: tooltipProps }">
            <v-btn v-show="!action.shown || action.shown(item)" v-bind="tooltipProps" icon variant="text" :loading="iconLoading[item._id + action.icon]" :disabled="iconLoading[item._id + action.icon]" @click.stop="clickAction(action, item)">
              <v-icon :color="action.color">{{ action.icon }}</v-icon>
            </v-btn>
          </template>
          <span>{{ action.tooltip }}</span>
        </v-tooltip>
      </template>

      <template #bottom />
    </v-data-table>
  </v-card>
</template>

<script setup lang="ts">
/**
 * ArrayTable - Display array of objects in table format
 */
import { ref, computed, watch, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useRegex } from "@/composables/useRegex";
import { useWrap } from "@/composables/useWrap";
import { utils, writeFileXLSX } from "xlsx";

/** Action configuration */
interface TableAction {
  icon: string;
  color?: string;
  tooltip?: string;
  handle: (item: TableItem) => void | Promise<void>;
  shown?: (item: TableItem) => boolean;
  animate?: boolean;
}

/** Table header */
interface TableHeader {
  title: string;
  key: string;
  width?: string;
  align?: "start" | "center" | "end";
  class?: string;
  sortable?: boolean;
}

/** Table item */
type TableItem = Record<string, unknown> & { _id?: string };

// Props
const props = withDefaults(
  defineProps<{
    objs: TableItem[];
    hiddenProperties?: string[];
    headerWidth?: string;
    headerAlign?: "start" | "center" | "end";
    headerClass?: string;
    headerUppercase?: boolean;
    showToolbar?: boolean;
    toolbarClass?: string;
    searchHint?: string;
    actions?: TableAction[];
    actionWidth?: string;
    actionAlign?: "start" | "center" | "end";
    actionClass?: string;
    downloadExcelName?: string;
  }>(),
  {
    hiddenProperties: () => [],
    headerWidth: "120px",
    headerAlign: "center",
    headerClass: "bg-cyan-lighten-4 text-subtitle-2",
    headerUppercase: false,
    showToolbar: false,
    toolbarClass: "bg-primary text-subtitle-2",
    actions: () => [],
    actionWidth: "120px",
    actionAlign: "start",
    actionClass: "bg-cyan-lighten-4 text-subtitle-2",
    downloadExcelName: "",
  }
);

// Composables
const { t } = useI18n();
const { regexSearch } = useRegex();
const { convertLongToNewline } = useWrap();

// State
const search = ref("");
const items = ref<TableItem[]>([]);
const tableHeaders = ref<TableHeader[]>([]);
const iconLoading = ref<Record<string, boolean>>({});

// Computed
const searchHintText = computed(() => {
  return props.searchHint ?? t("table.search");
});

const showDownloadIcon = computed(() => {
  return props.downloadExcelName.length > 0 && props.objs.length > 0;
});

// Methods
function downloadResult(): void {
  const tables = document.getElementsByTagName("table");
  if (tables.length >= 1) {
    const workbook = utils.table_to_book(tables[0]);
    writeFileXLSX(workbook, props.downloadExcelName);
  }
}

function mergeProperties(): string[] {
  const properties: string[] = [];
  for (const obj of props.objs) {
    if (obj) {
      properties.push(...Object.keys(obj));
    }
  }
  return [...new Set(properties)];
}

async function clickAction(action: TableAction, item: TableItem): Promise<void> {
  if (action.animate && item._id) {
    iconLoading.value[item._id + action.icon] = true;
    await action.handle(item);
    iconLoading.value[item._id + action.icon] = false;
  } else {
    action.handle(item);
  }
}

function uppercaseHeader(headerTitle: string): string {
  return props.headerUppercase ? headerTitle.toUpperCase() : headerTitle;
}

function parseData(): void {
  if (!props.objs?.length) {
    return;
  }

  const headers: TableHeader[] = [];
  const tableItems: TableItem[] = [];
  const properties = mergeProperties().filter((o) => !props.hiddenProperties.includes(o) && o !== "_id");

  for (const property of properties) {
    headers.push({
      title: uppercaseHeader(property),
      key: property,
      width: props.headerWidth,
      align: props.headerAlign,
      class: props.headerClass,
    });
  }

  if (props.actions.length > 0) {
    headers.push({
      title: uppercaseHeader(t("table.action_header")),
      key: "_action",
      sortable: false,
      width: props.actionWidth,
      align: props.actionAlign,
      class: props.actionClass,
    });
  }

  for (const obj of props.objs) {
    const item: TableItem = {};
    for (const property in obj) {
      item[property] = property === "_id" ? obj[property] : convertLongToNewline(obj[property]);
    }
    tableItems.push(item);
  }

  tableHeaders.value = headers;
  items.value = tableItems;
}

// Watch
watch(
  () => props.objs,
  () => {
    parseData();
  },
  { deep: true }
);

// Lifecycle
onMounted(() => {
  parseData();
});

// Expose
defineExpose({
  downloadResult,
});
</script>

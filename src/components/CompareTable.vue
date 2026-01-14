<template>
  <v-card v-bind="$attrs">
    <v-toolbar :class="toolbarClass" v-if="showToolbar">
      <v-text-field v-model="search" append-inner-icon="mdi-magnify" :label="searchHintText" single-line hide-details clearable></v-text-field>
      <div v-if="showThreshold">
        <v-text-field v-model="threshold" prefix="max*100/min > " suffix="%" class="ml-5" single-line hide-details></v-text-field>
      </div>
      <template v-if="showOnlyShowDiff">
        <v-checkbox class="ml-5" v-model="onlyShowDiff" hide-details :label="showDiffLabelText"></v-checkbox>
      </template>
      <template v-if="showFuzzyMatch">
        <v-checkbox class="ml-5" v-model="fuzzyMatch" hide-details :label="showFuzzyLabel"></v-checkbox>
      </template>
      <template v-if="showDownloadIcon">
        <v-btn class="ml-2" color="title_button" variant="plain" @click="downloadResult"> <v-icon class="mr-3">mdi-cloud-download</v-icon>{{ t("compare.download") }} </v-btn>
      </template>
    </v-toolbar>
    <v-data-table ref="tableRef" v-bind="$attrs" :headers="tableHeaders" :items="items" :row-class="getItemClass" :search="search" :custom-filter="regexSearch ? regexSearchFn : undefined" :items-per-page="-1">
      <template #bottom></template>
    </v-data-table>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useRegex } from "@/composables/useRegex";
import { useFuzzy } from "@/composables/useFuzzy";
import { useWrap } from "@/composables/useWrap";
import { utils, writeFileXLSX } from "xlsx";

/**
 * Compare table component
 * Compares multiple objects with diff highlighting
 */

interface TableHeader {
  title: string;
  key: string;
  width?: string;
  align?: "start" | "center" | "end";
  headerProps?: { class: string };
  sortable?: boolean;
  sort?: (a: string, b: string) => number;
}

interface TableItem extends Record<string, unknown> {
  attr: string;
  attrs?: string[];
  ratio?: string;
  diff1?: string;
  diff2?: string;
}

// Props
const props = withDefaults(
  defineProps<{
    objs: Record<string, unknown>[];
    labelKey: string;
    attrWidth?: string;
    valueWidth?: string;
    headerWidth?: string;
    headerAlign?: "start" | "center" | "end";
    headerClass?: string;
    headerUppcase?: boolean;
    showToolbar?: boolean;
    toolbarClass?: string;
    searchHint?: string;
    showDiffLabel?: string;
    topFields?: string[];
    colors?: Record<string, string>;
    filterFields?: string[];
    showRatio?: boolean;
    showDiff?: boolean;
    downloadExcelName?: string;
    diffThreshold?: number;
    regexSearch?: boolean;
    simpleValue?: boolean;
  }>(),
  {
    attrWidth: "120px",
    valueWidth: "80%",
    headerWidth: "120px",
    headerAlign: "center",
    headerClass: "table_header subtitle-2",
    headerUppcase: false,
    showToolbar: false,
    toolbarClass: "app_bar subtitle-2",
    topFields: () => [],
    colors: () => ({}),
    filterFields: () => [],
    showRatio: false,
    showDiff: false,
    downloadExcelName: "",
    diffThreshold: 0,
    regexSearch: false,
    simpleValue: false,
  }
);

// Composables
const { t } = useI18n();
const { regexSearch: regexSearchFn } = useRegex();
const { showFuzzyMatch, showFuzzyLabel, fuzzyMatch, mergeAttributes } = useFuzzy();
const { hasValue, convertLongToNewline, convertToSimpleValue } = useWrap();

// Refs
const tableRef = ref<HTMLElement | null>(null);

// State
const onlyShowDiff = ref(false);
const simpleValueState = ref(props.simpleValue);
const search = ref("");
const threshold = ref(0);
const allItems = ref<TableItem[]>([]);
const items = ref<TableItem[]>([]);
const tableHeaders = ref<TableHeader[]>([]);

// Computed
const searchHintText = computed(() => {
  return props.searchHint ?? t("compare.search");
});

const showOnlyShowDiff = computed(() => {
  return props.objs.length > 1;
});

const showDownloadIcon = computed(() => {
  return props.downloadExcelName.length > 0 && props.objs.length > 0;
});

const showThreshold = computed(() => {
  return props.diffThreshold > 0 && props.objs.length > 1;
});

const showDiffLabelText = computed(() => {
  return props.showDiffLabel ?? t("compare.show_diff");
});

// Methods
function downloadResult() {
  const tables = document.getElementsByTagName("table");
  if (tables.length >= 1) {
    const table = tables[0];
    if (simpleValueState.value) {
      simpleValueState.value = false;
      parseData();
      setTimeout(() => {
        const workbook = utils.table_to_book(table);
        writeFileXLSX(workbook, props.downloadExcelName);
        simpleValueState.value = true;
        parseData();
      }, 2000);
    } else {
      const workbook = utils.table_to_book(table);
      writeFileXLSX(workbook, props.downloadExcelName);
    }
  }
}

function setRatioValues(itemsToUpdate: TableItem[]) {
  for (let i = 0; i < itemsToUpdate.length; i++) {
    const item = itemsToUpdate[i];
    const left = parseFloat(item.value0 as string);
    const right = parseFloat(item.value1 as string);

    if (!isNaN(left) && !isNaN(right) && left !== right) {
      item.ratio = left !== 0 ? `${((right * 100) / left).toFixed(2)}%` : "";
    } else {
      item.ratio = "";
    }
  }
}

function setDiffValues(itemsToUpdate: TableItem[], columns: number) {
  for (let i = 0; i < itemsToUpdate.length; i++) {
    const item = itemsToUpdate[i];
    const values: number[] = [];

    for (let j = 0; j < columns; j++) {
      values.push(parseFloat(item[`value${j}`] as string));
    }

    const max = Math.max(...values);
    const min = Math.min(...values);

    if (!isNaN(max) && !isNaN(min) && max !== min) {
      item.diff1 = min !== 0 ? `${((max * 100) / min).toFixed(2)}%` : "";
      item.diff2 = max !== 0 ? `${((min * 100) / max).toFixed(2)}%` : "";
    } else {
      item.diff1 = "";
      item.diff2 = "";
    }
  }
}

function uppcaseHeader(headerTitle: string): string {
  return props.headerUppcase ? headerTitle.toUpperCase() : headerTitle;
}

function parseData() {
  const objs = JSON.parse(JSON.stringify(props.objs)) as Record<string, unknown>[];

  const headers: TableHeader[] = [];
  headers.push({
    title: uppcaseHeader(t("table.attribute")),
    key: "attr",
    width: props.attrWidth,
    align: props.headerAlign,
    headerProps: { class: props.headerClass },
  });

  if (objs.length > 1) {
    for (let i = 0; i < objs.length; i++) {
      headers.push({
        title: uppcaseHeader(objs[i][props.labelKey] as string),
        key: "value" + i,
        width: props.valueWidth,
        align: props.headerAlign,
        headerProps: { class: props.headerClass },
      });
    }
  } else if (objs.length === 1) {
    headers.push({
      title: uppcaseHeader(objs[0][props.labelKey] as string),
      key: "value",
      width: props.valueWidth,
      align: props.headerAlign,
      headerProps: { class: props.headerClass },
    });
  }

  if (props.showRatio && objs.length === 2) {
    headers.push({
      title: uppcaseHeader(t("compare.ratio")),
      key: "ratio",
      width: props.headerWidth,
      align: props.headerAlign,
      headerProps: { class: props.headerClass },
      sort: (a: string, b: string) => {
        const a1 = isNaN(parseFloat(a)) ? 0 : parseFloat(a);
        const b1 = isNaN(parseFloat(b)) ? 0 : parseFloat(b);
        return a1 - b1;
      },
    });
  }

  if (props.showDiff && objs.length >= 2) {
    headers.push({
      title: uppcaseHeader(t("compare.diff1")),
      key: "diff1",
      width: props.headerWidth,
      align: props.headerAlign,
      headerProps: { class: props.headerClass },
      sort: (a: string, b: string) => {
        const a1 = isNaN(parseFloat(a)) ? 0 : parseFloat(a);
        const b1 = isNaN(parseFloat(b)) ? 0 : parseFloat(b);
        return a1 - b1;
      },
    });
    headers.push({
      title: uppcaseHeader(t("compare.diff2")),
      key: "diff2",
      width: props.headerWidth,
      align: props.headerAlign,
      headerProps: { class: props.headerClass },
      sort: (a: string, b: string) => {
        const a1 = isNaN(parseFloat(a)) ? 0 : parseFloat(a);
        const b1 = isNaN(parseFloat(b)) ? 0 : parseFloat(b);
        return a1 - b1;
      },
    });
  }

  const resultItems: TableItem[] = [];
  if (objs.length > 1) {
    const propertyObjs = objs;
    const { mergedAttributes, map } = mergeAttributes(propertyObjs);

    for (let i = 0; i < mergedAttributes.length; i++) {
      const attribute = mergedAttributes[i];
      if (attribute !== props.labelKey) {
        const obj: TableItem = { attr: attribute };

        if (showFuzzyMatch.value) {
          obj.attrs = [];
          for (let j = 0; j < objs.length; j++) {
            let value: unknown = "";
            if (propertyObjs[j]) {
              value = propertyObjs[j][attribute];
              if (!value && map[attribute]) {
                obj.attrs.push(map[attribute]);
                obj.attrs.push(attribute);
                value = propertyObjs[j][map[attribute]];
              }
            }
            obj["value" + j] = hasValue(value) ? convertLongToNewline(value) : "";
          }
        } else {
          for (let j = 0; j < objs.length; j++) {
            obj["value" + j] = propertyObjs[j] && hasValue(propertyObjs[j][attribute]) ? convertLongToNewline(propertyObjs[j][attribute]) : "";
          }
        }

        if (props.filterFields.length === 0 || props.filterFields.includes(attribute)) {
          resultItems.push(obj);
        }
      }
    }
  } else if (objs.length === 1) {
    const object = objs[0];
    const { mergedAttributes } = mergeAttributes([object]);

    for (let i = 0; i < mergedAttributes.length; i++) {
      const attribute = mergedAttributes[i];
      if (attribute !== props.labelKey) {
        const obj: TableItem = { attr: attribute };
        obj.value = hasValue(object[attribute]) ? convertLongToNewline(object[attribute]) : "";

        if (props.filterFields.length === 0 || props.filterFields.includes(attribute)) {
          resultItems.push(obj);
        }
      }
    }
  }

  if (props.showRatio && objs.length === 2) {
    setRatioValues(resultItems);
  }

  if (props.showDiff && objs.length >= 2) {
    setDiffValues(resultItems, objs.length);
  }

  if (simpleValueState.value) {
    convertToSimpleValue(resultItems, objs.length);
  }

  const orderedItems: TableItem[] = [];
  if (props.filterFields.length > 0 && resultItems.length > 0) {
    for (let i = 0; i < props.filterFields.length; i++) {
      const attr = props.filterFields[i];
      const found = resultItems.find((o) => o.attr === attr);
      if (found) orderedItems.push(found);
    }
  }

  tableHeaders.value = headers;
  allItems.value = props.filterFields.length > 0 ? orderedItems : resultItems;
  threshold.value = props.diffThreshold;
  filterFields();
}

function isDiffValue(item: TableItem): boolean {
  if (props.objs.length > 1 && threshold.value > 0) {
    return hasValue(item.diff1) ? Math.abs(parseFloat(item.diff1 as string)) > threshold.value : false;
  } else if (props.objs.length > 1) {
    const value = item.value0;
    for (let i = 0; i < props.objs.length; i++) {
      if (item[`value${i}`] !== value) {
        return true;
      }
    }
    return false;
  }
  return false;
}

function getItemClass(item: TableItem): string {
  const attr = item.attr;

  if (props.colors?.[attr]) {
    return props.colors[attr];
  }

  if (props.topFields.includes(attr)) {
    return "top_item";
  }

  return isDiffValue(item) ? "diff_item" : "compare_item";
}

function filterFields() {
  const filteredItems = onlyShowDiff.value ? allItems.value.filter((item) => isDiffValue(item)) : allItems.value;
  items.value = filteredItems;
}

// Watchers
watch(onlyShowDiff, filterFields);
watch(threshold, filterFields);
watch(() => props.objs, parseData, { deep: true });

// Lifecycle
onMounted(() => {
  parseData();
});

// Expose methods
defineExpose({
  parseData,
  filterFields,
});
</script>

<style scoped>
.diff_item {
  color: #37474f;
  background-color: #f3e5f5;
}

.diff_item:hover {
  color: #37474f !important;
  background-color: #26c6da !important;
}

.top_item {
  color: #37474f;
  background-color: #ffcdd2;
}

.top_item:hover {
  color: #37474f !important;
  background-color: #26c6da !important;
}

.compare_item:hover {
  color: #37474f !important;
  background-color: #26c6da !important;
}
</style>

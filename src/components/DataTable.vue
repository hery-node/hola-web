<template>
  <div>
    <!-- Search form -->
    <div v-if="searchable">
      <SearchForm v-bind="$attrs" :entity="entity" :fields="searchFieldsProp" :title="searchTitle" :cols="searchCols" @clear="clearSearch" @search="doSearch" />
      <v-divider class="mt-5" />
    </div>

    <!-- Data table -->
    <v-data-table v-bind="$attrs" v-model="selected" :headers="tableHeaders" :items="items" :loading="loading" :items-per-page="pagination ? undefined : -1" :hide-default-footer="!pagination" :page="currentPage" :items-length="total" item-value="_id" class="elevation-0" :show-expand="isExpanded" :show-select="showSelect" return-object @update:options="handleOptionsUpdate">
      <!-- Top slot with alert and toolbar -->
      <template v-if="!hideTop" #top>
        <v-alert v-model="alert.shown" :type="alert.type" closable class="mx-3">
          <span v-html="alert.msg" />
        </v-alert>
        <v-toolbar v-if="!hideToolbar" flat density="compact" :class="toolbarClass">
          <span v-if="!hideTitle" class="ml-3">{{ tableTitle }}</span>
          <span v-if="infinite" class="ml-3">{{ totalRecordsTitle }}</span>
          <v-spacer />
          <slot name="toolbar" />
        </v-toolbar>
      </template>

      <!-- First column with infinite scroll detection -->
      <template v-if="!pagination" #[`item.${firstColumn}`]="{ item }">
        <v-row :justify="getHeaderAlign(firstColumn)" :align="getHeaderAlign(firstColumn)" class="my-3">
          <template v-if="item._last === true">
            <span v-intersect="infiniteScroll" :class="firstColumnStyle">
              {{ item[firstColumn] }}
            </span>
          </template>
          <template v-else>
            <span :class="firstColumnStyle">
              {{ item[firstColumn] }}
            </span>
          </template>
        </v-row>
      </template>

      <!-- Chip columns -->
      <template v-for="chip in chips" :key="chip" #[`item.${chip}`]="{ item }">
        <v-row class="d-flex flex-nowrap" :justify="getHeaderAlign(chip)" :align="getHeaderAlign(chip)" style="margin-top: 5px; margin-bottom: 5px">
          <template v-if="Array.isArray(item[chip])">
            <v-chip v-for="(tag, tagIndex) in item[chip]" :key="tagIndex" :class="getItemStyle(chip, item[chip], 'ma-1')" style="margin: 3px" @click.stop="chipClickable ? clickChip(item, chip, tagIndex) : undefined">
              {{ tag }}
            </v-chip>
          </template>
          <template v-else-if="item[chip]">
            <v-chip :class="getItemStyle(chip, item[chip], 'ma-1')" @click.stop="chipClickable ? clickChip(item, chip) : undefined">
              {{ item[chip] }}
            </v-chip>
          </template>
        </v-row>
      </template>

      <!-- Array columns (non-chip) -->
      <template v-for="array in arrays" :key="array" #[`item.${array}`]="{ item }">
        <span>
          <v-row v-for="(tag, tagIndex) in item[array]" :key="tagIndex" :justify="getHeaderAlign(array)" :align="getHeaderAlign(array)" class="my-3">
            <span :class="getItemStyle(array, item[array], 'ma-1')">{{ tag }}</span>
          </v-row>
        </span>
      </template>

      <!-- Styled columns -->
      <template v-for="style in styles" :key="style" #[`item.${style}`]="{ item }">
        <v-row :justify="getHeaderAlign(style)" :align="getHeaderAlign(style)">
          <span :class="getItemStyle(style, item[style], '')">{{ item[style] }}</span>
        </v-row>
      </template>

      <!-- Action column -->
      <template #[`item._action`]="{ item }">
        <v-tooltip v-for="(action, index) in itemActions" :key="index" location="bottom">
          <template #activator="{ props: tooltipProps }">
            <v-btn v-show="!action.shown || action.shown(item)" v-bind="tooltipProps" icon variant="text" :loading="iconLoading[item._id + action.icon]" :disabled="iconLoading[item._id + action.icon]" @click.stop="clickAction(action, item)">
              <v-icon :color="action.color">{{ action.icon }}</v-icon>
            </v-btn>
          </template>
          <span>{{ action.tooltip }}</span>
        </v-tooltip>
      </template>

      <!-- Expanded row -->
      <template v-if="expandFieldsProp && expandFieldsProp.length > 0" #expanded-row="{ columns, item }">
        <td :colspan="columns.length" style="white-space: pre-wrap; word-wrap: break-word">
          <div style="margin: 15px">
            <template v-if="expandAsText">
              <span v-text="getExpanded(item)" />
            </template>
            <template v-else>
              <span v-html="getExpanded(item)" />
            </template>
          </div>
        </td>
      </template>

      <!-- No data slot -->
      <template #no-data>
        <span>{{ t("table.no_data") }}</span>
      </template>
    </v-data-table>
  </div>
</template>

<script setup lang="ts">
/**
 * DataTable - Advanced data table with pagination, sorting, and search
 *
 * Features:
 * - Server-side pagination or infinite scroll
 * - Multi-column sorting
 * - Search form integration
 * - Expandable rows
 * - Chip rendering for arrays/refs
 * - Custom styling per column
 * - Item actions with icon buttons
 * - Auto-refresh at intervals
 */
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import { useI18n } from "vue-i18n";
import SearchForm from "./SearchForm.vue";
import { useAlert } from "@/composables/useAlert";
import { useMeta } from "@/composables/useMeta";
import { isSuccessResponse, listEntity, type ListParams } from "@/core/axios";
import type { FormData } from "./BasicForm.vue";

/** Item action configuration */
export interface ItemAction {
  icon: string;
  color?: string;
  tooltip?: string;
  handle: (item: TableItem) => void | Promise<void>;
  shown?: (item: TableItem) => boolean;
  animate?: boolean;
}

/** Table header configuration */
export interface TableHeader {
  title: string;
  key: string;
  name?: string;
  sortable?: boolean;
  width?: string;
  align?: "start" | "center" | "end";
  class?: string;
  chip?: boolean;
  style?: (value: unknown) => string;
  ref?: string;
  type?: string;
  format?: (value: unknown, ctx: unknown) => string;
  expand?: (value: unknown) => string;
  click?: (id: string, ref: string, label: string) => void;
}

/** Table item type */
export type TableItem = Record<string, unknown> & { _id: string; _last?: boolean };

// Props
const props = withDefaults(
  defineProps<{
    entity: string;
    sortDesc: boolean[];
    sortKey: string[];
    listAction?: string;
    filter?: Record<string, unknown>;
    searchable?: boolean;
    searchTitle?: string;
    searchCols?: number;
    searchFields?: string[];
    refAsChip?: boolean;
    expandAsText?: boolean;
    hideTop?: boolean;
    hideToolbar?: boolean;
    hideTitle?: boolean;
    toolbarClass?: string;
    title?: string;
    showSelect?: boolean;
    hasActionHeader?: boolean;
    itemActions?: ItemAction[];
    headerWidth?: string;
    headerAlign?: "start" | "center" | "end";
    headerClass?: string;
    headerUppercase?: boolean;
    actionWidth?: string;
    actionAlign?: "start" | "center" | "end";
    actionClass?: string;
    mobile?: boolean;
    chipClickable?: boolean;
    interval?: number;
    infinite?: boolean;
    itemPerPage?: number;
    expandFields?: string[];
    hiddenFields?: string[];
  }>(),
  {
    searchable: false,
    searchCols: 0,
    searchFields: () => [],
    refAsChip: true,
    expandAsText: false,
    hideTop: false,
    hideToolbar: false,
    hideTitle: false,
    toolbarClass: "bg-primary text-subtitle-2",
    showSelect: false,
    hasActionHeader: false,
    itemActions: () => [],
    headerWidth: "120px",
    headerAlign: "start",
    headerClass: "bg-cyan-lighten-4 text-subtitle-2",
    headerUppercase: false,
    actionWidth: "120px",
    actionAlign: "start",
    actionClass: "bg-cyan-lighten-4 text-subtitle-2",
    mobile: false,
    chipClickable: false,
    interval: -1,
    infinite: false,
    itemPerPage: 30,
    expandFields: () => [],
    hiddenFields: () => [],
  }
);

// Rename props for internal use
const searchFieldsProp = computed(() => props.searchFields);
const expandFieldsProp = computed(() => props.expandFields);

// Emits
const emit = defineEmits<{
  chip: [payload: { id: string; ref: string; label: string }];
  loaded: [items: TableItem[]];
}>();

// Composables
const { t } = useI18n();
const { alert, showError, showSuccess } = useAlert();
const { entityLabel, loadMeta, getTableHeaders, getFieldLabelByName } = useMeta({
  entity: props.entity,
  headers: props.searchFields as unknown as undefined,
});

// State
const tableHeaders = ref<TableHeader[]>([]);
const intervalInstance = ref<ReturnType<typeof setInterval> | undefined>();
const loading = ref(false);
const total = ref(0);
const nextPage = ref(1);
const currentPage = ref(1);
const items = ref<TableItem[]>([]);
const selected = ref<TableItem[]>([]);
const chips = ref<string[]>([]);
const styles = ref<string[]>([]);
const arrays = ref<string[]>([]);
const searchForm = ref<FormData>({});
const sortBy = ref<string[]>([...props.sortKey]);
const sortDesc = ref<boolean[]>([...props.sortDesc]);
const firstColumn = ref("");
const iconLoading = ref<Record<string, boolean>>({});

// Computed
const pagination = computed(() => !props.infinite);

const tableTitle = computed(() => {
  if (props.hideTitle) return "";
  return props.title ?? t("table.title", { entity: entityLabel.value });
});

const totalRecordsTitle = computed(() => {
  return t("table.total_record", { total: total.value });
});

const firstColumnStyle = computed(() => {
  return props.headerAlign === "start" ? "ml-3" : "";
});

const isExpanded = computed(() => {
  return expandFieldsProp.value.length > 0 && !props.showSelect;
});

// Methods
function uppercaseHeader(headerTitle: string): string {
  return props.headerUppercase ? headerTitle.toUpperCase() : headerTitle;
}

function getHeaderAlign(fieldName: string): "start" | "center" | "end" {
  const field = tableHeaders.value.find((f) => f.name === fieldName);
  return field?.align ?? "start";
}

function getItemStyle(fieldName: string, fieldValue: unknown, defaultValue: string): string {
  const field = tableHeaders.value.find((f) => f.name === fieldName);
  if (field?.style) {
    return field.style(fieldValue);
  }
  return defaultValue;
}

async function clickChip(item: TableItem, fieldName: string, index?: number): Promise<void> {
  const field = tableHeaders.value.find((f) => f.name === fieldName);
  if (field?.ref) {
    const fieldNameId = `${fieldName}_id`;
    const idValue = item[fieldNameId];
    const labelValue = item[fieldName];
    const id = Array.isArray(idValue) && index !== undefined ? String(idValue[index]) : String(idValue);
    const label = Array.isArray(labelValue) && index !== undefined ? String(labelValue[index]) : String(labelValue);
    if (field.click) {
      field.click(id, field.ref, label);
    } else {
      emit("chip", { id, ref: field.ref, label });
    }
  } else if (field?.click) {
    field.click(String(item._id), fieldName, String(index));
  }
}

async function clickAction(action: ItemAction, item: TableItem): Promise<void> {
  if (action.animate) {
    iconLoading.value[item._id + action.icon] = true;
    await action.handle(item);
    iconLoading.value[item._id + action.icon] = false;
  } else {
    action.handle(item);
  }
}

function getExpanded(item: TableItem): string {
  const fieldNames = expandFieldsProp.value;
  const values: string[] = [];
  for (let i = 0; i < fieldNames.length; i++) {
    const fieldName = fieldNames[i];
    const value = item[fieldName] ?? "";
    if (value) {
      const field = tableHeaders.value.find((f) => f.name === fieldName);
      if (field?.expand) {
        values.push(field.expand(value));
      } else {
        if (fieldNames.length > 1) {
          values.push(getFieldLabelByName(fieldName) + ":");
          values.push(String(value).includes("\n") ? "\n" : "\t");
        }
        values.push(String(value));
        if (i !== fieldNames.length - 1) {
          values.push("\n");
          values.push("=".repeat(100));
          values.push("\n");
        }
      }
    }
  }
  return values.join("");
}

function infiniteScroll(isIntersecting: boolean, entries: IntersectionObserverEntry[]): void {
  const entry = entries[0];
  if (items.value.length < total.value && isIntersecting) {
    const target = entry.target as HTMLElement & { page?: number };
    if (!target.page) {
      target.page = nextPage.value;
      setTimeout(() => {
        loadData();
      }, 500);
    }
  }
}

function resetValues(): void {
  nextPage.value = 1;
}

function clearSearch(): void {
  searchForm.value = {};
  resetValues();
  loadData();
}

function refresh(): void {
  resetValues();
  loadData();
}

function setData(newItems: TableItem[]): void {
  items.value = newItems;
}

function doSearch(form: FormData): void {
  searchForm.value = form;
  resetValues();
  loadData();
}

function handleOptionsUpdate(options: { page?: number; sortBy?: Array<{ key: string; order: "asc" | "desc" }>; itemsPerPage?: number }): void {
  if (options.page) {
    currentPage.value = options.page;
  }
  if (options.sortBy && options.sortBy.length > 0) {
    sortBy.value = options.sortBy.map((s) => s.key);
    sortDesc.value = options.sortBy.map((s) => s.order === "desc");
  }
  resetValues();
  loadData();
}

async function loadData(): Promise<void> {
  if (tableHeaders.value.length === 0) {
    return;
  }

  loading.value = true;

  const sortByStr = sortBy.value.length > 0 ? sortBy.value.join(",") : props.sortKey.join(",");
  const descStr = sortDesc.value.length > 0 ? sortDesc.value.join(",") : props.sortDesc.join(",");

  let attrs = tableHeaders.value.filter((h) => h.name && h.name.length > 0).map((h) => h.name as string);
  if (expandFieldsProp.value) {
    attrs.push(...expandFieldsProp.value);
  }
  attrs = attrs.concat(props.hiddenFields);
  const attrNames = attrs.join(",");

  const params: ListParams = {
    attrNames: attrNames,
    sortBy: sortByStr,
    desc: descStr === "true",
  };

  if (pagination.value) {
    params.page = currentPage.value;
    params.limit = 10; // Default items per page
  } else {
    params.page = nextPage.value;
    params.limit = props.itemPerPage;
  }

  const queryObj = props.filter ? { ...searchForm.value, ...props.filter } : searchForm.value;

  const { code, total: responseTotal, data } = await listEntity(props.entity, queryObj, params, props.listAction);

  loading.value = false;

  if (isSuccessResponse(code) && data) {
    total.value = responseTotal ?? 0;
    if (data.length > 0) {
      const tableData = data as TableItem[];
      tableData[tableData.length - 1]._last = true;

      // Apply formatters
      for (const obj of tableData) {
        for (const header of tableHeaders.value) {
          if (header.format && header.name) {
            obj[header.name] = header.format(obj[header.name], null);
          }
        }
      }

      if (pagination.value) {
        items.value = tableData;
      } else {
        if (nextPage.value === 1) {
          items.value = tableData;
        } else {
          items.value.push(...tableData);
        }
      }

      emit("loaded", items.value);
      nextPage.value++;
    }
  }
}

async function initTable(): Promise<void> {
  await loadMeta();
  const headers = (await getTableHeaders(expandFieldsProp.value)) as unknown as TableHeader[];

  for (const header of headers) {
    header.title = uppercaseHeader(header.title || header.name || "");
    header.key = header.name || header.key;
    header.width ||= props.headerWidth;
    header.align ||= props.headerAlign;
    header.class ||= props.headerClass;

    // Categorize columns
    if (header.chip) {
      chips.value.push(header.name || "");
    } else if (props.refAsChip && header.ref) {
      chips.value.push(header.name || "");
    } else if (header.type === "array") {
      if ((props.refAsChip && !header.ref) || (!props.refAsChip && header.ref)) {
        arrays.value.push(header.name || "");
      }
    }
    if (header.style && !header.chip) {
      styles.value.push(header.name || "");
    }
  }

  // Add action column if needed
  if (props.hasActionHeader) {
    headers.push({
      title: uppercaseHeader(t("table.action_header")),
      key: "_action",
      name: "_action",
      sortable: false,
      width: props.actionWidth,
      align: props.actionAlign,
      class: props.actionClass,
    });
  }

  firstColumn.value = headers[0]?.key || "";
  tableHeaders.value = headers;
  loadData();
}

// Watch for filter changes
watch(
  () => props.filter,
  () => {
    resetValues();
    loadData();
  },
  { deep: true }
);

// Lifecycle
onMounted(() => {
  initTable();
  if (props.interval > 0 && pagination.value) {
    intervalInstance.value = setInterval(loadData, props.interval * 1000);
  }
});

onBeforeUnmount(() => {
  if (intervalInstance.value) {
    clearInterval(intervalInstance.value);
  }
});

// Expose methods
defineExpose({
  refresh,
  setData,
  clearSearch,
  loadData,
  selected,
  showError,
  showSuccess,
});
</script>

<style>
/* Vuetify 3 data table header styling */
.v-data-table thead th {
  background-color: #b2ebf2 !important;
}

tr td {
  white-space: pre-wrap;
}

.custom-loader {
  animation: loader 1s infinite;
  display: flex;
}

@keyframes loader {
  from {
    transform: rotate(0);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>

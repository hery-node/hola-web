<template>
  <div>
    <v-alert v-model="alert.shown" :type="alert.type" closable><span v-html="alert.msg"></span></v-alert>
    <v-toolbar flat density="compact" :class="toolbarClass" v-if="!hideToolbar">
      <span class="ml-3" v-if="!hideTitle">{{ tableTitle }}</span>
      <span class="ml-3">{{ totalRecordsTitle }}</span>
      <v-spacer></v-spacer>
      <v-tooltip v-for="(toolbar, index) in headerToolbars" :key="index" location="bottom">
        <template #activator="{ props: tooltipProps }">
          <v-btn icon @click.stop="toolbar.click()" v-bind="tooltipProps" class="mr-3">
            <v-icon :color="toolbar.color">{{ toolbar.icon }}</v-icon> {{ toolbar.label ? toolbar.label : "" }}
          </v-btn>
        </template>
        <span>{{ toolbar.tooltip }}</span>
      </v-tooltip>
    </v-toolbar>
    <span v-for="(item, index) in items" :key="index">
      <slot :item="item"></slot>
      <template v-if="item._last === true">
        <span v-intersect="infiniteScroll">.</span>
      </template>
    </span>
    <template v-if="items.length === 0">
      <v-row class="fill-height" justify="center" align="center">
        <v-col class="text-center">
          <h3>{{ noDataText }}</h3>
        </v-col>
      </v-row>
    </template>
    <h-confirm ref="confirmRef" />
    <h-edit-form ref="formRef" v-bind="$attrs" dialog hide-hint :entity="entity" :fields="editFields" :entity-id="editEntityId" @cancel="afterCancel" @success="afterClose" :create-title="createTitle" :update-title="updateTitle" :create-form-view="createView" :update-form-view="updateView" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useAlert } from "@/composables/useAlert";
import { useKeymap } from "@/composables/useKeymap";
import { isSuccessResponse, listEntity, deleteEntity, isBeenReferred } from "@/core/axios";
import type { EntityField } from "@/types";

/**
 * DataList Component
 *
 * An infinite-scroll list component for displaying entities with custom slots.
 * Provides CRUD operations through dialogs and toolbar actions.
 *
 * Features:
 * - Infinite scroll for loading more items
 * - Custom item rendering via default slot
 * - Create/Update/Delete operations via dialogs
 * - Customizable toolbar actions
 * - Keyboard shortcuts (Alt+C create, Alt+R refresh)
 * - Empty state message
 * - Alert notifications for operations
 */

interface ToolbarItem {
  icon: string;
  tooltip: string;
  click: () => void;
  color?: string;
  label?: string;
}

interface ListItem extends Record<string, unknown> {
  _id?: string;
  _last?: boolean;
}

// Props
const props = withDefaults(
  defineProps<{
    entity: string;
    itemLabelKey: string;
    sortDesc: boolean[];
    sortKey: string[];
    attrs: string[];
    entityLabel?: string;
    createLabel?: string;
    updateLabel?: string;
    deleteLabel?: string;
    noDataText?: string;
    mode?: string;
    listAction?: string;
    filter?: Record<string, unknown>;
    itemPerPage?: number;
    hideToolbar?: boolean;
    hideTitle?: boolean;
    hideTableTitle?: boolean;
    toolbarClass?: string;
    title?: string;
    editFields?: EntityField[];
    createView?: string;
    updateView?: string;
    toolbars?: ToolbarItem[];
    createIcon?: string;
    refreshIcon?: string;
  }>(),
  {
    noDataText: "",
    mode: "",
    itemPerPage: 30,
    hideToolbar: false,
    hideTitle: false,
    hideTableTitle: false,
    toolbarClass: "app_bar subtitle-2",
    editFields: () => [],
    createView: "*",
    updateView: "*",
    toolbars: () => [],
    createIcon: "mdi-plus-circle",
    refreshIcon: "mdi-refresh",
  }
);

// Emits
const emit = defineEmits<{
  loaded: [items: ListItem[]];
}>();

// Composables
const { t } = useI18n();
const { alert, showError } = useAlert();

// Refs
const confirmRef = ref<InstanceType<typeof import("./ConfirmDialog.vue").default> | null>(null);
const formRef = ref<InstanceType<typeof import("./EditForm.vue").default> | null>(null);

// State
const loading = ref(false);
const total = ref(0);
const nextPage = ref(1);
const items = ref<ListItem[]>([]);
const editEntityId = ref<string | null>("");
const headerToolbars = ref<ToolbarItem[]>([]);

// Computed
const entityLabelText = computed(() => {
  return props.entityLabel ?? (props.entity?.trim().length > 0 ? t(`${props.entity}._label`) : "");
});

const createTitle = computed(() => {
  return props.createLabel ?? t("table.create_title", { entity: entityLabelText.value });
});

const updateTitle = computed(() => {
  return props.updateLabel ?? t("table.update_title", { entity: entityLabelText.value });
});

const deleteTitle = computed(() => {
  return props.deleteLabel ?? t("table.delete_title", { entity: entityLabelText.value });
});

const isCreatable = computed(() => props.mode.includes("c"));
const isRefreshable = computed(() => props.mode.includes("r"));

const tableTitle = computed(() => {
  if (props.hideTableTitle) return "";
  return props.title ?? t("table.title", { entity: entityLabelText.value });
});

const totalRecordsTitle = computed(() => {
  return t("table.total_record", { total: total.value });
});

// Methods
function showToolbars() {
  const toolbarList: ToolbarItem[] = [];
  if (isCreatable.value) {
    toolbarList.push({ color: "toolbar_icon", icon: props.createIcon, tooltip: createTitle.value, click: showCreateDialog });
  }
  if (isRefreshable.value) {
    toolbarList.push({ color: "toolbar_icon", icon: props.refreshIcon, tooltip: t("table.refresh"), click: refresh });
  }
  toolbarList.push(...props.toolbars);
  headerToolbars.value = toolbarList;
}

function showCreateDialog() {
  editEntityId.value = null;
}

function infiniteScroll(isIntersecting: boolean, entries: IntersectionObserverEntry[]) {
  const entry = entries[0];
  const target = entry.target as HTMLElement & { page?: number };

  if (items.value.length < total.value && isIntersecting && !target.page) {
    target.page = nextPage.value;
    setTimeout(() => {
      loadData();
    }, 500);
  }
}

function resetValues() {
  nextPage.value = 1;
}

function refresh() {
  resetValues();
  loadData();
}

function setData(newItems: ListItem[]) {
  items.value = newItems;
}

function afterCancel() {
  editEntityId.value = "";
}

function afterClose() {
  editEntityId.value = "";
  refresh();
}

function pressKey(event: KeyboardEvent) {
  if (isCreatable.value && event.key === "c" && event.altKey) {
    showCreateDialog();
  }
  if (isRefreshable.value && event.key === "r" && event.altKey) {
    refresh();
  }
}

async function confirmDelete(deleteItems: ListItem[]): Promise<boolean> {
  const labels = deleteItems.map((item) => item[props.itemLabelKey]).join(",");
  const title = deleteTitle.value;
  const msg = t("table.delete_confirm", { entity: labels });
  return showConfirm(title, msg);
}

async function showConfirm(title: string, msg: string): Promise<boolean> {
  return confirmRef.value?.open(title, msg) ?? false;
}

async function deleteEntities(deleteItems: ListItem[]) {
  const ids = deleteItems.map((item) => item._id).filter(Boolean) as string[];
  const confirmed = await confirmDelete(deleteItems);

  if (confirmed) {
    const { code, err } = await deleteEntity(props.entity, ids);
    if (isSuccessResponse(code)) {
      refresh();
    } else if (isBeenReferred(code)) {
      const labels = err ? (err as string[]).join(",") : "";
      const msg = t("table.has_ref", { entity: labels });
      showError(msg);
    } else if (err) {
      showError(err as string);
    }
  }
}

async function loadData() {
  loading.value = true;
  const sortBy = props.sortKey.join(",");
  const desc = props.sortDesc.join(",");
  const attrNames = props.attrs.join(",");
  const params: Record<string, unknown> = { attr_names: attrNames, sort_by: sortBy, desc };
  params.page = nextPage.value;
  params.limit = props.itemPerPage;

  const queryObj = props.filter ?? {};
  const { code, total: resTotal, data } = await listEntity(props.entity, queryObj, params, props.listAction);
  loading.value = false;

  if (isSuccessResponse(code)) {
    total.value = resTotal ?? 0;
    if (data && data.length > 0) {
      data[data.length - 1]._last = true;
      if (nextPage.value === 1) {
        items.value = data as ListItem[];
      } else {
        items.value.push(...(data as ListItem[]));
      }
      emit("loaded", items.value);
      nextPage.value++;
    }
  }
}

// Keyboard shortcuts
useKeymap(pressKey);

// Watchers
watch(() => props.toolbars, showToolbars, { deep: true });

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
  showToolbars();
  loadData();
});

// Expose methods for parent components
defineExpose({
  refresh,
  setData,
  showConfirm,
  deleteEntities,
  loadData,
});
</script>

<template>
  <DataTable v-bind="$attrs" ref="tableRef" :entity="entity" :headers="headers" :searchable="isSearchable" :infinite="!isPaginable" :search-fields="searchFieldsProp" :sort-desc="sortDesc" :sort-key="sortKey" :show-select="batchMode" :has-action-header="hasActionHeader" :item-actions="itemActionsComputed" :action-width="actionWidthComputed" :expand-fields="expandFields" :hide-columns="hideColumns" :hide-search="hideSearch" :merge-with-server="mergeWithServer" @chip="clickChip">
    <template v-if="!mobile" #toolbar>
      <v-tooltip v-for="(toolbar, index) in headerToolbars" :key="index" location="bottom">
        <template #activator="{ props: tooltipProps }">
          <v-btn v-bind="tooltipProps" icon variant="text" @click.stop="toolbar.click()">
            <v-icon :color="toolbar.color">{{ toolbar.icon }}</v-icon>
          </v-btn>
        </template>
        <span>{{ toolbar.tooltip }}</span>
      </v-tooltip>

      <EditForm ref="formRef" v-bind="$attrs" dialog :clone="cloneMode" hide-hint :entity="entity" :fields="editFieldsProp" :entity-id="editEntityId" :create-title="createTitleText" :update-title="updateTitleText" :clone-title="cloneTitleText" :create-form-view="createView" :update-form-view="updateView" @cancel="afterCancel" @success="afterClose" />

      <EditForm ref="formChipRef" v-bind="$attrs" dialog hide-hint :entity="chipEntity" :entity-id="chipEntityId" :fields="chipEditFields" merge-with-server :update-form-view="chipView" @cancel="afterCancelChip" @success="afterCloseChip" />
    </template>
  </DataTable>

  <!-- ConfirmDialog outside conditional slot to ensure it's always available -->
  <ConfirmDialog ref="confirmRef" />
</template>

<script setup lang="ts">
/**
 * CrudTable - Full CRUD operations table component
 *
 * Features:
 * - Create/Update/Clone/Delete operations
 * - Batch selection and deletion
 * - Keyboard shortcuts (Alt+C create, Alt+R refresh, Alt+B batch mode)
 * - Customizable toolbars and actions
 * - Entity mode configuration
 */
import { ref, computed, useTemplateRef, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useDisplay } from "vuetify";
import { useRouter } from "vue-router";
import DataTable from "./DataTable.vue";
import EditForm from "./EditForm.vue";
import ConfirmDialog from "./ConfirmDialog.vue";
import { useKeymap } from "@/composables/useKeymap";
import { deleteEntity, isSuccessResponse, isBeenReferred, getEntityMode } from "@/core/axios";
import type { ItemAction, TableItem, TableHeader } from "./DataTable.vue";
import type { ConfirmDialogInstance, EditFormInstance } from "./types";
import type { FormField } from "./BasicForm.vue";

/** Toolbar button configuration */
export interface ToolbarAction {
  icon: string;
  color?: string;
  tooltip?: string;
  click: () => void;
}

/** CrudTable component props */
export interface CrudTableProps {
  entity: string;
  sortDesc: boolean[];
  sortKey: string[];
  itemLabelKey: string;
  mode?: string;
  createRoute?: string;
  createView?: string;
  updateView?: string;
  chipView?: string;
  actions?: ItemAction[];
  toolbars?: ToolbarAction[];
  batchToolbars?: ToolbarAction[];
  searchFields?: string[];
  editFields?: FormField[];
  headers?: TableHeader[];
  expandFields?: string[];
  hideColumns?: string[];
  hideSearch?: string[];
  mergeWithServer?: boolean;
  chipFieldsMap?: Record<string, FormField[]>;
  noSelectLabel?: string;
  entityLabel?: string;
  createLabel?: string;
  refreshLabel?: string;
  updateLabel?: string;
  cloneLabel?: string;
  deleteLabel?: string;
  batchDeleteLabel?: string;
  createIcon?: string;
  refreshIcon?: string;
  updateIcon?: string;
  cloneIcon?: string;
  deleteIcon?: string;
  onlyBatchDelete?: boolean;
  myActionFirst?: boolean;
}

// Props
const props = withDefaults(defineProps<CrudTableProps>(), {
  createView: "*",
  updateView: "*",
  chipView: "*",
  actions: () => [],
  toolbars: () => [],
  batchToolbars: () => [],
  searchFields: () => [],
  editFields: () => [],
  headers: () => [],
  expandFields: () => [],
  hideColumns: () => [],
  hideSearch: () => [],
  mergeWithServer: true,
  createIcon: "mdi-plus-circle",
  refreshIcon: "mdi-refresh",
  updateIcon: "mdi-square-edit-outline",
  cloneIcon: "mdi-content-copy",
  deleteIcon: "mdi-delete-circle",
  onlyBatchDelete: false,
  myActionFirst: false,
});

// Rename props for internal use
const searchFieldsProp = computed(() => props.searchFields);
const editFieldsProp = computed(() => props.editFields);

// Composables
const { t } = useI18n();
const { mobile } = useDisplay();
const router = useRouter();

// Template refs
const tableRef = ref<InstanceType<typeof DataTable> | null>(null);
const confirmRef = useTemplateRef<ConfirmDialogInstance>("confirmRef");
const formRef = useTemplateRef<EditFormInstance>("formRef");
const formChipRef = useTemplateRef<EditFormInstance>("formChipRef");

// State
const batchMode = ref(false);
const entityMode = ref("");
const editEntityId = ref<string | undefined>("");
const chipEntity = ref("");
const chipEntityId = ref("");
const chipEditFields = ref<FormField[]>([]);
const cloneMode = ref(false);

// Computed - Mode checks
const isBatchable = computed(() => entityMode.value.includes("b"));
const isCreatable = computed(() => entityMode.value.includes("c"));
const isDeletable = computed(() => entityMode.value.includes("d"));
const isCloneable = computed(() => entityMode.value.includes("o"));
const isPaginable = computed(() => entityMode.value.includes("p"));
const isRefreshable = computed(() => entityMode.value.includes("r"));
const isSearchable = computed(() => entityMode.value.includes("s"));
const isUpdatable = computed(() => entityMode.value.includes("u"));

// Computed - Labels
const entityLabelText = computed(() => {
  return props.entityLabel ?? (props.entity?.trim().length > 0 ? t(`${props.entity}._label`) : "");
});

const noSelectedText = computed(() => {
  return props.noSelectLabel ?? t("table.no_selected", { entity: entityLabelText.value });
});

const createTitleText = computed(() => {
  return props.createLabel ?? t("table.create_title", { entity: entityLabelText.value });
});

const refreshTitleText = computed(() => {
  return props.refreshLabel ?? t("table.refresh_title", { entity: entityLabelText.value });
});

const updateTitleText = computed(() => {
  return props.updateLabel ?? t("table.update_title", { entity: entityLabelText.value });
});

const cloneTitleText = computed(() => {
  return props.cloneLabel ?? t("table.clone_title", { entity: entityLabelText.value });
});

const deleteTitleText = computed(() => {
  return props.deleteLabel ?? t("table.delete_title", { entity: entityLabelText.value });
});

const batchDeleteTitleText = computed(() => {
  return props.batchDeleteLabel ?? t("table.batch_delete_title", { entity: entityLabelText.value });
});

// Computed - Item actions
const itemActionsComputed = computed<ItemAction[] | undefined>(() => {
  const actions: ItemAction[] = [];
  if (props.myActionFirst) actions.push(...props.actions);

  if (isUpdatable.value) {
    actions.push({
      color: "warning",
      icon: props.updateIcon,
      tooltip: updateTitleText.value,
      handle: updateEntity,
    });
  }
  if (isCloneable.value) {
    actions.push({
      color: "info",
      icon: props.cloneIcon,
      tooltip: cloneTitleText.value,
      handle: cloneEntity,
    });
  }
  if (isDeletable.value && !props.onlyBatchDelete) {
    actions.push({
      color: "error",
      icon: props.deleteIcon,
      tooltip: deleteTitleText.value,
      handle: deleteEntityItem,
    });
  }

  if (!props.myActionFirst) actions.push(...props.actions);
  return actions.length > 0 ? actions : undefined;
});

// Computed - Action column width based on number of actions (approx 40px per action button)
const actionWidthComputed = computed(() => {
  const count = itemActionsComputed.value?.length || 0;
  const width = Math.max(count * 44, 100); // 44px per button, minimum 100px
  return `${width}px`;
});

// Computed - Has action header (reactive based on itemActionsComputed)
const hasActionHeader = computed(() => !!itemActionsComputed.value);

// Computed - Header toolbars (reactive based on mode and batch state)
const headerToolbars = computed<ToolbarAction[]>(() => {
  const toolbars: ToolbarAction[] = [];

  if (!batchMode.value && isCreatable.value) {
    toolbars.push({
      color: "white",
      icon: props.createIcon,
      tooltip: createTitleText.value,
      click: showCreateDialog,
    });
  }
  if (!batchMode.value && isRefreshable.value) {
    toolbars.push({
      color: "white",
      icon: props.refreshIcon,
      tooltip: refreshTitleText.value,
      click: refresh,
    });
  }
  if (batchMode.value && isDeletable.value) {
    toolbars.push({
      color: "white",
      icon: props.deleteIcon,
      tooltip: batchDeleteTitleText.value,
      click: batchDelete,
    });
  }

  if (!batchMode.value) toolbars.push(...props.toolbars);
  if (batchMode.value) toolbars.push(...props.batchToolbars);

  if (!batchMode.value && isBatchable.value) {
    toolbars.push({
      color: "white",
      icon: "mdi-checkbox-multiple-marked",
      tooltip: t("table.switch_to_batch"),
      click: switchToBatch,
    });
  }
  if (batchMode.value && isBatchable.value) {
    toolbars.push({
      color: "white",
      icon: "mdi-close-circle-multiple",
      tooltip: t("table.switch_to_single"),
      click: switchToSingle,
    });
  }

  return toolbars;
});

// Methods
function pressEsc(): void {
  if (batchMode.value) switchToSingle();
}

function pressKey(event: KeyboardEvent): void {
  if (isCreatable.value && event.key === "c" && event.altKey) {
    showCreateDialog();
  }
  if (isRefreshable.value && event.key === "r" && event.altKey) {
    refresh();
  }
  if (event.key === "b" && event.altKey && !batchMode.value) {
    switchToBatch();
  }
}

function switchToBatch(): void {
  batchMode.value = true;
}

function switchToSingle(): void {
  batchMode.value = false;
}

function deleteEntityItem(item: TableItem): void {
  deleteEntities([item]);
}

function getSelectedItems(): TableItem[] | null {
  const table = tableRef.value;
  if (!table) return null;

  // When refs are exposed via defineExpose, Vue unwraps them automatically
  // So table.selected is the array directly, not a ref
  const selected = (table as unknown as { selected: TableItem[] }).selected || [];
  if (selected.length === 0) {
    showError(noSelectedText.value);
    return null;
  }
  return selected;
}

function showError(msg: string): void {
  const table = tableRef.value as unknown as { showError: (msg: string) => void };
  table?.showError?.(msg);
}

function showSuccess(msg: string): void {
  const table = tableRef.value as unknown as { showSuccess: (msg: string) => void };
  table?.showSuccess?.(msg);
}

function resetSelected(): void {
  const table = tableRef.value as unknown as { selected: TableItem[] };
  if (table?.selected) {
    table.selected.length = 0;
  }
}

async function batchDelete(): Promise<void> {
  const selected = getSelectedItems();
  if (selected !== null) {
    await deleteEntities(selected);
  }
}

async function confirmDelete(items: TableItem[]): Promise<boolean> {
  const labels = items.map((item) => String(item[props.itemLabelKey])).join(",");
  const title = items.length > 1 ? batchDeleteTitleText.value : deleteTitleText.value;
  const msg = t("table.delete_confirm", { entity: labels });
  return showConfirm(title, msg);
}

async function showConfirm(title: string, msg: string): Promise<boolean> {
  return (await confirmRef.value?.open(title, msg)) ?? false;
}

async function deleteEntities(items: TableItem[]): Promise<void> {
  const ids = items.map((item) => item._id);
  const confirmed = await confirmDelete(items);

  if (confirmed) {
    const { code, err } = await deleteEntity(props.entity, ids);
    if (isSuccessResponse(code)) {
      refresh();
      resetSelected();
    } else if (isBeenReferred(code)) {
      const labels = Array.isArray(err) ? err.join(",") : "";
      const msg = t("table.has_ref", { entity: labels });
      showError(msg);
    } else if (err) {
      showError(String(err));
    }
  }
}

function refresh(): void {
  tableRef.value?.refresh();
}

function setData(items: TableItem[]): void {
  tableRef.value?.setData(items);
}

function showCreateDialog(): void {
  if (props.createRoute) {
    router.push(props.createRoute);
  } else {
    editEntityId.value = undefined;
  }
}

function updateEntity(item: TableItem): void {
  cloneMode.value = false;
  editEntityId.value = item._id;
}

function cloneEntity(item: TableItem): void {
  cloneMode.value = true;
  editEntityId.value = item._id;
}

function clickChip(chip: { ref: string; id: string }): void {
  if (chip?.ref) {
    chipEntity.value = chip.ref;
    chipEntityId.value = chip.id;
    if (props.chipFieldsMap) {
      chipEditFields.value = props.chipFieldsMap[chip.ref] || [];
    }
  }
}

function afterCancel(): void {
  editEntityId.value = "";
}

function afterCancelChip(): void {
  chipEntityId.value = "";
}

function afterClose(): void {
  editEntityId.value = "";
  refresh();
}

function afterCloseChip(): void {
  chipEntityId.value = "";
  refresh();
}

// Setup keymap
useKeymap({
  onEscape: pressEsc,
  onKeyDown: pressKey,
});

// Initialize entity mode on mount
onMounted(async () => {
  if (props.mode) {
    entityMode.value = props.mode;
  } else {
    const serverMode = await getEntityMode(props.entity);
    if (serverMode && serverMode.trim().length > 0) {
      entityMode.value = serverMode;
    }
  }
});

// Expose methods
defineExpose({
  refresh,
  setData,
  showError,
  showSuccess,
  showConfirm,
  resetSelected,
  getSelectedItems,
});
</script>

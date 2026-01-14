<template>
  <nav>
    <v-app-bar app flat :color="barColor">
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      <v-toolbar-title :style="drawerWidthStyle" class="ml-0 pl-4">
        <span class="hidden-sm-and-down">{{ appTitle }}</span>
      </v-toolbar-title>
      <v-spacer />
      <slot name="toolbar" />
    </v-app-bar>

    <v-navigation-drawer v-bind="$attrs" v-model="drawer" app>
      <v-list v-for="menu in menuItems" :key="menu.title" density="compact">
        <v-list-subheader>{{ menu.title }}</v-list-subheader>
        <v-list-item v-for="child in menu.menus" :key="child.title" :to="child.route" :prepend-icon="child.icon" :title="child.title" />
        <v-divider />
      </v-list>
    </v-navigation-drawer>
  </nav>
</template>

<script setup lang="ts">
/**
 * NavBar - Navigation bar with drawer menu
 */
import { ref, computed, watch } from "vue";
import { useI18n } from "vue-i18n";

/** Menu item structure */
interface MenuItem {
  title: string;
  icon?: string;
  route?: string;
}

/** Menu group structure */
interface MenuGroup {
  title: string;
  menus: MenuItem[];
}

// Props
const props = withDefaults(
  defineProps<{
    title?: string;
    menus: MenuGroup[];
    barColor?: string;
    drawerWidth?: number;
  }>(),
  {
    barColor: "primary",
    drawerWidth: 300,
  }
);

// Composables
const { t } = useI18n();

// State
const drawer = ref(true);
const menuItems = ref<MenuGroup[]>([]);

// Computed
const drawerWidthStyle = computed(() => {
  return `width: ${props.drawerWidth}px`;
});

const appTitle = computed(() => {
  return props.title ?? t("app.title");
});

// Watch
watch(
  () => props.menus,
  (newMenus) => {
    menuItems.value = newMenus;
  },
  { deep: true, immediate: true }
);
</script>

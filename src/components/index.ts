// Auto-generated component exports
// Vue 3 + TypeScript + Vuetify 3 components

// Dialog components
export { default as ConfirmDialog } from './ConfirmDialog.vue'

// Window components  
export { default as BasicWindow } from './BasicWindow.vue'

// Form components
export { default as BasicForm } from './BasicForm.vue'
export { default as EditForm } from './EditForm.vue'
export { default as SearchForm } from './SearchForm.vue'

// Table components
export { default as DataTable } from './DataTable.vue'
export { default as CrudTable } from './CrudTable.vue'
export { default as ArrayTable } from './ArrayTable.vue'
export { default as PropertyTable } from './PropertyTable.vue'
export { default as CompareTable } from './CompareTable.vue'
export { default as DashboardTable } from './DashboardTable.vue'

// Navigation components
export { default as NavBar } from './NavBar.vue'
export { default as MobileMenu } from './MobileMenu.vue'

// Card components
export { default as CardView } from './CardView.vue'
export { default as StatisticsView } from './StatisticsView.vue'
export { default as OffsetView } from './OffsetView.vue'

// List components
export { default as DataList } from './DataList.vue'

// Entity components
export { default as ArrayEntity } from './ArrayEntity.vue'
export { default as CompareEntity } from './CompareEntity.vue'

// Chart components - ECharts
export { default as ChartView } from './ChartView.vue'
export { default as ChartPieView } from './ChartPieView.vue'
export { default as ChartBarView } from './ChartBarView.vue'
export { default as ChartLineView } from './ChartLineView.vue'
export { default as ChartComboView } from './ChartComboView.vue'

// Chart components - Chartist (simple)
export { default as ChartSimpleView } from './ChartSimpleView.vue'
export { default as ChartDashboardView } from './ChartDashboardView.vue'

// Component registration for Vue app
import type { App } from 'vue'

import ConfirmDialog from './ConfirmDialog.vue'
import BasicWindow from './BasicWindow.vue'
import BasicForm from './BasicForm.vue'
import EditForm from './EditForm.vue'
import SearchForm from './SearchForm.vue'
import DataTable from './DataTable.vue'
import CrudTable from './CrudTable.vue'
import ArrayTable from './ArrayTable.vue'
import PropertyTable from './PropertyTable.vue'
import CompareTable from './CompareTable.vue'
import DashboardTable from './DashboardTable.vue'
import NavBar from './NavBar.vue'
import MobileMenu from './MobileMenu.vue'
import CardView from './CardView.vue'
import StatisticsView from './StatisticsView.vue'
import OffsetView from './OffsetView.vue'
import DataList from './DataList.vue'
import ArrayEntity from './ArrayEntity.vue'
import CompareEntity from './CompareEntity.vue'
import ChartView from './ChartView.vue'
import ChartPieView from './ChartPieView.vue'
import ChartBarView from './ChartBarView.vue'
import ChartLineView from './ChartLineView.vue'
import ChartComboView from './ChartComboView.vue'
import ChartSimpleView from './ChartSimpleView.vue'
import ChartDashboardView from './ChartDashboardView.vue'

/**
 * Install all Hola components globally
 */
export function installComponents(app: App): void {
  // Register with h- prefix for consistency
  app.component('h-confirm', ConfirmDialog)
  app.component('h-window', BasicWindow)
  app.component('h-form', BasicForm)
  app.component('h-edit-form', EditForm)
  app.component('h-search', SearchForm)
  app.component('h-table', DataTable)
  app.component('h-crud', CrudTable)
  app.component('h-array', ArrayTable)
  app.component('h-property', PropertyTable)
  app.component('h-compare', CompareTable)
  app.component('h-dashboard-table', DashboardTable)
  app.component('h-navbar', NavBar)
  app.component('h-mobile-menu', MobileMenu)
  app.component('h-card', CardView)
  app.component('h-stats', StatisticsView)
  app.component('h-offset', OffsetView)
  app.component('h-list', DataList)
  app.component('h-array-entity', ArrayEntity)
  app.component('h-compare-entity', CompareEntity)
  app.component('h-chart', ChartView)
  app.component('h-pie-chart', ChartPieView)
  app.component('h-bar-chart', ChartBarView)
  app.component('h-line-chart', ChartLineView)
  app.component('h-combo-chart', ChartComboView)
  app.component('h-simple-chart', ChartSimpleView)
  app.component('h-dashboard-chart', ChartDashboardView)
}

export default {
  install: installComponents,
}

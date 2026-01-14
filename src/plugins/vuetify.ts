/**
 * Vuetify 3 configuration
 */

import 'vuetify/styles'
import { createVuetify, type ThemeDefinition } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import '@mdi/font/css/materialdesignicons.css'
import type { ThemeColors } from '@/types'

/**
 * Make vuetify dialogs movable
 */
function makeDialogMovable(): void {
  interface DragState {
    el?: HTMLElement
    mouseStartX: number
    mouseStartY: number
    elStartX: number
    elStartY: number
    oldTransition: string
  }

  const d: DragState = {
    mouseStartX: 0,
    mouseStartY: 0,
    elStartX: 0,
    elStartY: 0,
    oldTransition: '',
  }

  document.addEventListener('mousedown', (e: MouseEvent) => {
    const closestDialog = (e.target as HTMLElement).closest('.v-overlay__content') as HTMLElement | null
    const toolbar = (e.target as HTMLElement).closest('.v-toolbar__content')

    if (e.button === 0 && closestDialog && toolbar) {
      d.el = closestDialog
      d.mouseStartX = e.clientX
      d.mouseStartY = e.clientY
      d.elStartX = d.el.getBoundingClientRect().left
      d.elStartY = d.el.getBoundingClientRect().top
      d.el.style.position = 'fixed'
      d.el.style.margin = '0'
      d.oldTransition = d.el.style.transition
      d.el.style.transition = 'none'
    }
  })

  document.addEventListener('mousemove', (e: MouseEvent) => {
    if (!d.el) return
    const newLeft = Math.min(
      Math.max(d.elStartX + e.clientX - d.mouseStartX, 0),
      window.innerWidth - d.el.getBoundingClientRect().width
    )
    const newTop = Math.min(
      Math.max(d.elStartY + e.clientY - d.mouseStartY, 0),
      window.innerHeight - d.el.getBoundingClientRect().height
    )
    d.el.style.left = `${newLeft}px`
    d.el.style.top = `${newTop}px`
  })

  document.addEventListener('mouseup', () => {
    if (!d.el) return
    d.el.style.transition = d.oldTransition
    d.el = undefined
  })

  // Prevent dialog from going out of bounds
  setInterval(() => {
    const dialog = document.querySelector('.v-overlay--active .v-overlay__content') as HTMLElement | null
    if (!dialog) return

    const left = parseInt(dialog.style.left)
    const top = parseInt(dialog.style.top)

    if (!isNaN(left)) {
      dialog.style.left = `${Math.min(left, window.innerWidth - dialog.getBoundingClientRect().width)}px`
    }
    if (!isNaN(top)) {
      dialog.style.top = `${Math.min(top, window.innerHeight - dialog.getBoundingClientRect().height)}px`
    }
  }, 100)
}

const defaultLightTheme: ThemeColors = {
  primary: '#00838F', // cyan darken-2
  progress: '#C62828', // red darken-2
  tag: '#E53935', // red darken-1
  secondary: '#00ACC1', // cyan darken-1
  tertiary: '#495057',
  accent: '#82B1FF',
  error: '#E53935', // red darken-1
  info: '#00d3ee',
  success: '#00ACC1', // cyan darken-1
  warning: '#ffa21a',
  create: '#00ACC1',
  edit: '#00ACC1',
  clone: '#00ACC1',
  delete: '#E53935',
  refresh: '#388E3C', // green darken-1
  chart: '#00ACC1',
  chartTitle: '#B71C1C', // red darken-4
  appBar: '#00838F',
  systemBar: '#FFFFFF',
  tableHeader: '#B2EBF2', // cyan lighten-4
  toolbarIcon: '#FFFFFF',
  chip: '#00ACC1',
  bgcolor: '#FAFAFA', // grey lighten-4
  card: '#00ACC1',
  back: '#B71C1C',
  titleButton: '#FFFFFF',
}

/**
 * Create Vuetify theme definition from colors
 */
function createThemeFromColors(colors: ThemeColors): ThemeDefinition {
  return {
    dark: false,
    colors: {
      primary: colors.primary ?? defaultLightTheme.primary!,
      secondary: colors.secondary ?? defaultLightTheme.secondary!,
      accent: colors.accent ?? defaultLightTheme.accent!,
      error: colors.error ?? defaultLightTheme.error!,
      info: colors.info ?? defaultLightTheme.info!,
      success: colors.success ?? defaultLightTheme.success!,
      warning: colors.warning ?? defaultLightTheme.warning!,
      background: colors.bgcolor ?? defaultLightTheme.bgcolor!,
      surface: '#FFFFFF',
      // Custom colors
      progress: colors.progress ?? defaultLightTheme.progress!,
      tag: colors.tag ?? defaultLightTheme.tag!,
      tertiary: colors.tertiary ?? defaultLightTheme.tertiary!,
      create: colors.create ?? defaultLightTheme.create!,
      edit: colors.edit ?? defaultLightTheme.edit!,
      clone: colors.clone ?? defaultLightTheme.clone!,
      delete: colors.delete ?? defaultLightTheme.delete!,
      refresh: colors.refresh ?? defaultLightTheme.refresh!,
      chart: colors.chart ?? defaultLightTheme.chart!,
      'chart-title': colors.chartTitle ?? defaultLightTheme.chartTitle!,
      'app-bar': colors.appBar ?? defaultLightTheme.appBar!,
      'system-bar': colors.systemBar ?? defaultLightTheme.systemBar!,
      'table-header': colors.tableHeader ?? defaultLightTheme.tableHeader!,
      'toolbar-icon': colors.toolbarIcon ?? defaultLightTheme.toolbarIcon!,
      chip: colors.chip ?? defaultLightTheme.chip!,
      card: colors.card ?? defaultLightTheme.card!,
      back: colors.back ?? defaultLightTheme.back!,
      'title-button': colors.titleButton ?? defaultLightTheme.titleButton!,
    },
  }
}

export interface VuetifyConfig {
  light?: ThemeColors
  dark?: ThemeColors
}

/**
 * Setup Vuetify instance
 */
export function setupVuetify(config: VuetifyConfig = {}) {
  makeDialogMovable()

  const lightTheme = createThemeFromColors({ ...defaultLightTheme, ...config.light })

  return createVuetify({
    components,
    directives,
    icons: {
      defaultSet: 'mdi',
      aliases,
      sets: { mdi },
    },
    theme: {
      defaultTheme: 'light',
      themes: {
        light: lightTheme,
      },
    },
    defaults: {
      VBtn: {
        variant: 'flat',
      },
      VTextField: {
        variant: 'outlined',
        density: 'comfortable',
      },
      VSelect: {
        variant: 'outlined',
        density: 'comfortable',
      },
      VAutocomplete: {
        variant: 'outlined',
        density: 'comfortable',
      },
      VDataTable: {
        density: 'comfortable',
      },
    },
  })
}

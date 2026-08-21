/*
 * one loader for each component page, keyed by its slug. every entry is a dynamic import,
 * so vue and its ark adapter reach a reader only once they ask for a vue demo. the map is
 * at module scope, which keeps each loader stable for the effect that mounts it.
 */
export const VUE_DEMOS: Readonly<Record<string, () => Promise<{ readonly default: unknown }>>> = {
  button: () => import('./ButtonDemo.vue'),
  chart: () => import('./ChartDemo.vue'),
  checkbox: () => import('./CheckboxDemo.vue'),
  'command-palette': () => import('./CommandPaletteDemo.vue'),
  dialog: () => import('./DialogDemo.vue'),
  'empty-state': () => import('./EmptyStateDemo.vue'),
  field: () => import('./FieldDemo.vue'),
  figure: () => import('./FigureDemo.vue'),
  'filter-bar': () => import('./FilterBarDemo.vue'),
  icons: () => import('./IconsDemo.vue'),
  panel: () => import('./PanelDemo.vue'),
  popover: () => import('./PopoverDemo.vue'),
  select: () => import('./SelectDemo.vue'),
  table: () => import('./TableDemo.vue'),
  tabs: () => import('./TabsDemo.vue'),
  toast: () => import('./ToastDemo.vue'),
  tooltip: () => import('./TooltipDemo.vue'),
}

export const VUE_CONSOLE = () => import('./RunConsole.vue')

/* the chart page runs four demos, and the three under the first are named, not keyed by slug */
export const VUE_TRACE = () => import('./TraceDemo.vue')
export const VUE_RUN_MIX = () => import('./RunMixDemo.vue')
export const VUE_CHART_STATES = () => import('./ChartStatesDemo.vue')

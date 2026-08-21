/*
 * the react side of the site loads a single file component through a dynamic import and
 * mounts it, so tsc only needs to know the module resolves. vue-tsc checks the components
 * themselves, over tsconfig.vue.json.
 */
declare module '*.vue' {
  import type { DefineComponent } from 'vue'

  const component: DefineComponent<Record<string, never>, Record<string, never>, unknown>
  export default component
}

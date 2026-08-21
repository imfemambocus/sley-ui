<script lang="ts">
export type PanelSide = 'start' | 'end'
</script>

<script setup lang="ts">
import { Dialog } from '@ark-ui/vue/dialog'
import { onMounted, onUnmounted, ref, watch, type HTMLAttributes } from 'vue'
import CloseIcon from '@/components/ui/icons/CloseIcon.vue'
import { cx } from '@/lib/cx'

/*
 * not modal while the table stays live: no focus trap, no scroll lock, no backdrop, and
 * a click outside picks the next row rather than closing. on a screen it covers, it locks
 * the page.
 */
const props = withDefaults(
  defineProps<{
    title: string
    description?: string
    side?: PanelSide
    class?: HTMLAttributes['class']
  }>(),
  { side: 'end' },
)

const open = defineModel<boolean>('open', { required: true })

/* below this the panel covers the page and has to behave as a modal */
const SHEET = '(max-width: 640px)'

/* the positioner holds the edge; the border belongs to the part that animates */
const SIDE: Record<PanelSide, string> = {
  start: 'start-0 [--slide-from:-100%]',
  end: 'end-0 [--slide-from:100%]',
}

/* read after mount. a server has no matchMedia. */
const sheet = ref(false)
let query: MediaQueryList | undefined

const apply = () => {
  sheet.value = query?.matches === true
}

onMounted(() => {
  query = window.matchMedia(SHEET)
  apply()
  query.addEventListener('change', apply)
})

onUnmounted(() => query?.removeEventListener('change', apply))

/*
 * zag returns focus from inside its focus trap, and it only runs that trap when the dialog is
 * modal. so a panel that leaves the page live drops the reader on the body when it closes, and
 * has to put focus back itself. closing is always started from inside the panel here, by escape
 * or by the close button, so there is no other claim on focus to weigh.
 */
const origin = ref<HTMLElement | null>(null)

watch([open, sheet], ([isOpen, isSheet]) => {
  if (isSheet) return

  if (isOpen) {
    const active = document.activeElement
    origin.value = active instanceof HTMLElement ? active : null
    return
  }

  const element = origin.value
  origin.value = null
  if (element?.isConnected) element.focus()
})
</script>

<template>
  <Dialog.Root
    v-model:open="open"
    :modal="sheet"
    :close-on-interact-outside="false"
    unmount-on-exit
    lazy-mount
  >
    <Teleport to="body">
      <Dialog.Positioner :class="cx('fixed inset-y-0 z-(--z-panel) flex', SIDE[props.side])">
        <Dialog.Content
          :class="
            cx(
              'layer flex h-full w-[min(420px,100vw)] flex-col border-reed-lit data-[state=open]:animate-[slide_var(--dur-overlay)_var(--ease-beat)] data-[state=closed]:animate-[slide-out_var(--dur-local)_var(--ease-exit)]',
              props.class,
            )
          "
        >
          <header class="reed-edge flex items-start justify-between gap-4 px-(--cell-x) py-(--stack)">
            <div class="flex min-w-0 flex-col gap-0.5">
              <Dialog.Title class="truncate font-medium">{{ props.title }}</Dialog.Title>
              <Dialog.Description v-if="props.description" class="truncate text-weft-dim">
                {{ props.description }}
              </Dialog.Description>
            </div>
            <Dialog.CloseTrigger
              aria-label="Close the panel"
              class="-mr-1 cursor-pointer p-1 text-weft-faint transition-colors duration-(--dur-instant) ease-(--ease-beat) hover:text-weft"
            >
              <CloseIcon class="size-3.5" />
            </Dialog.CloseTrigger>
          </header>

          <div class="reed-scroll flex-1 overflow-auto">
            <slot />
          </div>

          <footer
            v-if="$slots.footer"
            class="flex items-center justify-end gap-(--stack) border-t border-reed px-(--cell-x) py-(--stack)"
          >
            <slot name="footer" />
          </footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Teleport>
  </Dialog.Root>
</template>

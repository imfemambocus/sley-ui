<script lang="ts">
export interface Command {
  readonly id: string
  readonly label: string
  readonly group: string
  readonly hint?: string
  readonly run: () => void
}
</script>

<script setup lang="ts">
import { Dialog } from '@ark-ui/vue/dialog'
import { computed, ref, watch } from 'vue'
import SearchIcon from '@/components/ui/icons/SearchIcon.vue'

const props = withDefaults(
  defineProps<{
    commands: readonly Command[]
    placeholder?: string
  }>(),
  { placeholder: 'Run a command' },
)

const open = defineModel<boolean>('open', { required: true })

const query = ref('')
const active = ref(0)
const list = ref<HTMLDivElement | null>(null)
const input = ref<HTMLInputElement | null>(null)

const matches = computed(() => {
  const needle = query.value.trim().toLowerCase()
  if (needle === '') return props.commands
  return props.commands.filter((command) => `${command.group} ${command.label}`.toLowerCase().includes(needle))
})

const groups = computed(() => {
  const buckets = new Map<string, { command: Command; index: number }[]>()
  matches.value.forEach((command, index) => {
    const bucket = buckets.get(command.group)
    if (bucket) {
      bucket.push({ command, index })
    } else {
      buckets.set(command.group, [{ command, index }])
    }
  })
  return [...buckets]
})

watch(query, () => {
  active.value = 0
})

/* clears on the way in: the list must keep its matches while the dialog leaves */
watch(open, (isOpen) => {
  if (isOpen) query.value = ''
})

// keyboard navigation moves no pointer, so nothing else scrolls the row into view
watch(
  active,
  () => {
    list.value?.querySelector('[data-active]')?.scrollIntoView({ block: 'nearest' })
  },
  { flush: 'post' },
)

const choose = (command: Command) => {
  command.run()
  open.value = false
}

const onKeyDown = (event: KeyboardEvent) => {
  if (matches.value.length === 0) return

  if (event.key === 'ArrowDown') {
    event.preventDefault()
    active.value = (active.value + 1) % matches.value.length
    return
  }
  if (event.key === 'ArrowUp') {
    event.preventDefault()
    active.value = (active.value - 1 + matches.value.length) % matches.value.length
    return
  }
  if (event.key === 'Enter') {
    event.preventDefault()
    choose(matches.value[active.value])
  }
}
</script>

<template>
  <Dialog.Root v-model:open="open" :initial-focus-el="() => input" unmount-on-exit lazy-mount>
    <Teleport to="body">
      <Dialog.Backdrop
        class="fixed inset-0 z-(--z-backdrop) bg-sunken/70 backdrop-blur-[2px] data-[state=open]:animate-[fade_var(--dur-overlay)_var(--ease-beat)] data-[state=closed]:animate-[fade-out_var(--dur-local)_var(--ease-exit)]"
      />
      <Dialog.Positioner class="fixed inset-0 z-(--z-modal) grid place-items-start justify-items-center pt-[12vh]">
        <Dialog.Content
          class="layer w-[min(560px,92vw)] data-[state=open]:animate-[rise_var(--dur-overlay)_var(--ease-beat)] data-[state=closed]:animate-[rise-out_var(--dur-local)_var(--ease-exit)]"
        >
          <Dialog.Title class="sr-only">Command palette</Dialog.Title>

          <div class="reed-edge flex items-center gap-2 px-3" :style="{ height: 'calc(var(--ctl-h) + 12px)' }">
            <SearchIcon class="size-4 text-weft-faint" />
            <input
              ref="input"
              v-model="query"
              name="command"
              :placeholder="props.placeholder"
              :aria-label="props.placeholder"
              class="w-full bg-transparent text-weft placeholder:text-weft-faint focus:outline-none"
              @keydown="onKeyDown"
            />
            <kbd class="font-data text-[11px] text-weft-faint">esc</kbd>
          </div>

          <div ref="list" class="max-h-[46vh] overflow-auto py-1">
            <p v-if="matches.length === 0" class="px-3 py-6 text-center text-weft-dim">
              No command matches "{{ query }}". Try a shorter word.
            </p>

            <div v-for="[group, items] in groups" :key="group">
              <p
                class="px-3 pt-2 pb-1 font-data text-[11px] tracking-wide text-weft-faint uppercase dense:sr-only"
              >
                {{ group }}
              </p>
              <button
                v-for="item in items"
                :key="item.command.id"
                type="button"
                :data-active="item.index === active ? '' : undefined"
                class="flex w-full cursor-pointer items-center justify-between gap-3 px-3 text-left text-weft-dim transition-colors duration-(--dur-instant) ease-(--ease-beat) data-active:bg-shed data-active:text-weft"
                :style="{ height: 'var(--row-h)' }"
                @pointermove="active = item.index"
                @click="choose(item.command)"
              >
                <span class="truncate">{{ item.command.label }}</span>
                <kbd v-if="item.command.hint" class="font-data text-[11px] text-weft-faint">
                  {{ item.command.hint }}
                </kbd>
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Positioner>
    </Teleport>
  </Dialog.Root>
</template>

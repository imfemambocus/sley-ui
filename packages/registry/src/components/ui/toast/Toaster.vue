<script setup lang="ts">
import { Toast as ArkToast, Toaster as ArkToaster } from '@ark-ui/vue/toast'
import type { HTMLAttributes } from 'vue'
import CloseIcon from '@/components/ui/icons/CloseIcon.vue'
import { cx } from '@/lib/cx'

const props = defineProps<{ class?: HTMLAttributes['class'] }>()

/* zag names these five types */
const TONE: Record<string, string> = {
  success: 'text-jade',
  error: 'text-madder',
  warning: 'text-weld',
  info: 'text-indigo',
  loading: 'text-weft-dim',
}
</script>

<!--
  the `toaster` store reaches ark as an attribute. build it with `createToaster` from
  @ark-ui/vue/toast. zag gives the group the highest rank in the document, so no token
  ranks it here.
-->
<template>
  <ArkToaster>
    <template #default="toast">
      <ArkToast.Root
        :class="cx('toast layer flex w-[min(22rem,90vw)] items-start gap-2 p-(--cell-x)', props.class)"
      >
        <div class="flex min-w-0 flex-1 flex-col gap-0.5">
          <div :class="cx('flex items-center gap-1.5', TONE[toast.type ?? 'info'])">
            <span :class="cx('size-1.25 shrink-0 rounded-full bg-current', toast.type === 'loading' && 'beat')" />
            <ArkToast.Title class="truncate text-weft">{{ toast.title }}</ArkToast.Title>
          </div>
          <ArkToast.Description v-if="toast.description" class="pl-2.75 text-weft-dim">
            {{ toast.description }}
          </ArkToast.Description>
        </div>
        <ArkToast.CloseTrigger
          aria-label="Dismiss"
          class="cursor-pointer p-0.5 text-weft-faint transition-colors duration-(--dur-instant) ease-(--ease-beat) hover:text-weft"
        >
          <CloseIcon class="size-3" />
        </ArkToast.CloseTrigger>
      </ArkToast.Root>
    </template>
  </ArkToaster>
</template>

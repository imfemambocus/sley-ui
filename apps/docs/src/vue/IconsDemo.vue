<script setup lang="ts">
import CheckIcon from '@/components/ui/icons/CheckIcon.vue'
import ChevronIcon from '@/components/ui/icons/ChevronIcon.vue'
import CloseIcon from '@/components/ui/icons/CloseIcon.vue'
import SearchIcon from '@/components/ui/icons/SearchIcon.vue'
import Demo from './Demo.vue'

const ICONS = [
  { name: 'CheckIcon', glyph: CheckIcon },
  { name: 'SearchIcon', glyph: SearchIcon },
  { name: 'ChevronIcon', glyph: ChevronIcon },
  { name: 'CloseIcon', glyph: CloseIcon },
]
</script>

<template>
  <Demo caption="Four glyphs. Everything else you draw yourself, or bring an icon set you already like.">
    <div v-for="icon in ICONS" :key="icon.name" class="flex flex-col items-center gap-2">
      <component :is="icon.glyph" class="size-5 text-weft" />
      <span class="font-data text-[12px] text-weft-faint">{{ icon.name }}</span>
    </div>
  </Demo>
</template>

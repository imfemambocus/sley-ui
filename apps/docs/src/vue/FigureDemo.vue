<script setup lang="ts">
import Elapsed from '@/components/ui/figure/Elapsed.vue'
import Figure from '@/components/ui/figure/Figure.vue'
import Demo from './Demo.vue'

const ROW = 'flex items-baseline justify-between gap-8 border-b border-reed/60 py-1.5'
</script>

<template>
  <Demo
    class="w-full max-w-sm"
    caption="A missing value is one tick of the reed, not a hyphen. A low value carries the reed under its own digits."
  >
    <div class="flex w-full flex-col">
      <div :class="ROW">
        <span class="text-weft-dim">Reads (M)</span>
        <span class="tnum font-data text-weft"><Figure :value="412.8" /></span>
      </div>
      <div :class="ROW">
        <span class="text-weft-dim">Q30 (%)</span>
        <span class="tnum font-data text-weft"><Figure :value="94.2" /></span>
      </div>
      <div :class="ROW">
        <span class="text-weft-dim">Q30 (%), under 80</span>
        <span class="tnum font-data text-weft"><Figure :value="62.7" low /></span>
      </div>
      <div :class="ROW">
        <span class="text-weft-dim">Coverage (x), none yet</span>
        <span class="tnum font-data text-weft"><Figure :value="0" /></span>
      </div>
      <div :class="ROW">
        <span class="text-weft-dim">Elapsed</span>
        <span class="tnum font-data text-weft"><Elapsed :minutes="401" /></span>
      </div>
    </div>
  </Demo>
</template>

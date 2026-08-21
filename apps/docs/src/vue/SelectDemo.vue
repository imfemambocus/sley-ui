<script setup lang="ts">
import { createListCollection } from '@ark-ui/vue/select'
import { ref } from 'vue'
import Select from '@/components/ui/select/Select.vue'
import SelectContent from '@/components/ui/select/SelectContent.vue'
import SelectOption from '@/components/ui/select/SelectOption.vue'
import SelectTrigger from '@/components/ui/select/SelectTrigger.vue'
import Demo from './Demo.vue'

const ASSAYS = ['WGS', 'RNA-seq', 'ATAC-seq', 'Exome', 'Methyl', 'scRNA']

const collection = createListCollection({ items: ASSAYS.map((value) => ({ label: value, value })) })

const one = ref<string[]>(['Exome'])
const many = ref<string[]>(['WGS', 'Methyl'])
</script>

<template>
  <Demo caption="Move the keyboard through the list. The shed follows you; the selvedge stays on what you chose.">
    <Select v-model="one" :collection="collection">
      <SelectTrigger>
        <span :class="one.length > 0 ? 'text-weft' : 'text-weft-dim'">{{ one[0] ?? 'Assay' }}</span>
      </SelectTrigger>
      <SelectContent>
        <SelectOption v-for="item in collection.items" :key="item.value" :item="item" />
      </SelectContent>
    </Select>

    <Select v-model="many" :collection="collection" multiple>
      <SelectTrigger>
        <span class="inline-flex items-baseline gap-1.5">
          <span :class="many.length > 0 ? 'text-weft' : 'text-weft-dim'">Assay</span>
          <span v-if="many.length > 0" class="tnum font-data text-indigo">{{ many.length }}</span>
        </span>
      </SelectTrigger>
      <SelectContent>
        <SelectOption v-for="item in collection.items" :key="item.value" :item="item" />
      </SelectContent>
    </Select>
  </Demo>
</template>

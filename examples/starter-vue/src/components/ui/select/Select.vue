<script setup lang="ts">
import { Select as ArkSelect, type ListCollection } from '@ark-ui/vue/select'
import type { SelectOptionItem } from '@/components/ui/select/SelectOption.vue'

/*
 * build the collection with `createListCollection` from @ark-ui/vue/select. every other
 * root option, `multiple` and `close-on-select` included, reaches ark as an attribute.
 */
const props = defineProps<{ collection: ListCollection<SelectOptionItem> }>()

const value = defineModel<string[]>()
</script>

<template>
  <ArkSelect.Root v-model="value" :collection="props.collection">
    <slot />
  </ArkSelect.Root>
</template>

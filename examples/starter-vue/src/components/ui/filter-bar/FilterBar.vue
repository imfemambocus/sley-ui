<script lang="ts">
export interface FilterGroup {
  readonly key: string
  readonly label: string
  readonly options: readonly string[]
}

export type FilterValues = Readonly<Record<string, readonly string[]>>
</script>

<script setup lang="ts">
import { createListCollection } from '@ark-ui/vue/select'
import { computed, type HTMLAttributes } from 'vue'
import CloseIcon from '@/components/ui/icons/CloseIcon.vue'
import SearchIcon from '@/components/ui/icons/SearchIcon.vue'
import Select from '@/components/ui/select/Select.vue'
import SelectContent from '@/components/ui/select/SelectContent.vue'
import SelectOption from '@/components/ui/select/SelectOption.vue'
import SelectTrigger from '@/components/ui/select/SelectTrigger.vue'
import { cx } from '@/lib/cx'

const props = withDefaults(
  defineProps<{
    groups: readonly FilterGroup[]
    searchLabel?: string
    placeholder?: string
    class?: HTMLAttributes['class']
  }>(),
  { searchLabel: 'Search', placeholder: 'Search' },
)

const query = defineModel<string>('query', { required: true })
const values = defineModel<FilterValues>('values', { required: true })

const collections = computed(() =>
  props.groups.map((group) => ({
    group,
    collection: createListCollection({ items: group.options.map((value) => ({ label: value, value })) }),
  })),
)

const chips = computed(() =>
  props.groups.flatMap((group) => (values.value[group.key] ?? []).map((value) => ({ group, value }))),
)

const selectedIn = (key: string) => values.value[key] ?? []

const setGroup = (key: string, next: readonly string[]) => {
  values.value = { ...values.value, [key]: next }
}

const removeChip = (key: string, value: string) => {
  setGroup(
    key,
    selectedIn(key).filter((entry) => entry !== value),
  )
}
</script>

<template>
  <!-- vue does not know the `search` element yet, and a dynamic tag reaches it without a warning -->
  <component :is="'search'" :class="cx('flex flex-col gap-(--stack)', props.class)">
    <div class="flex flex-wrap items-center gap-(--stack)">
      <div class="ctl focus-ring h-(--ctl-h) min-w-55 flex-1">
        <SearchIcon class="size-3.5 text-weft-faint" />
        <input
          v-model="query"
          type="search"
          name="search"
          :placeholder="props.placeholder"
          :aria-label="props.searchLabel"
          class="w-full bg-transparent py-0 placeholder:text-weft-faint focus:outline-none"
        />
      </div>

      <Select
        v-for="entry in collections"
        :key="entry.group.key"
        :collection="entry.collection"
        multiple
        :model-value="[...selectedIn(entry.group.key)]"
        @update:model-value="(next: string[] | undefined) => setGroup(entry.group.key, next ?? [])"
      >
        <SelectTrigger>
          <span class="inline-flex items-baseline gap-1.5">
            <span :class="selectedIn(entry.group.key).length > 0 ? 'text-weft' : 'text-weft-dim'">
              {{ entry.group.label }}
            </span>
            <span v-if="selectedIn(entry.group.key).length > 0" class="tnum font-data text-indigo">
              {{ selectedIn(entry.group.key).length }}
            </span>
          </span>
        </SelectTrigger>
        <SelectContent>
          <SelectOption v-for="item in entry.collection.items" :key="item.value" :item="item" />
        </SelectContent>
      </Select>
    </div>

    <ul v-if="chips.length > 0" class="flex flex-wrap items-center gap-(--stack)">
      <li v-for="chip in chips" :key="`${chip.group.key}:${chip.value}`">
        <button
          type="button"
          class="inline-flex h-(--ctl-h) cursor-pointer items-center gap-1.5 border border-indigo/40 bg-indigo-wash px-(--cell-x) text-weft transition-colors duration-(--dur-instant) ease-(--ease-beat) hover:border-indigo"
          @click="removeChip(chip.group.key, chip.value)"
        >
          <span class="inline-flex items-baseline gap-1.5">
            <span class="font-data text-weft-dim">{{ chip.group.label.toLowerCase() }}</span>
            <span>{{ chip.value }}</span>
          </span>
          <CloseIcon class="size-3 text-weft-faint" />
        </button>
      </li>
      <li>
        <button
          type="button"
          class="h-(--ctl-h) cursor-pointer px-(--cell-x) text-weft-dim underline-offset-4 hover:text-weft hover:underline"
          @click="values = {}"
        >
          Clear filters
        </button>
      </li>
    </ul>
  </component>
</template>

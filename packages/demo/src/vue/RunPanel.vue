<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import Button from '@/components/ui/button/Button.vue'
import EmptyState from '@/components/ui/empty-state/EmptyState.vue'
import Field from '@/components/ui/field/Field.vue'
import FieldError from '@/components/ui/field/FieldError.vue'
import FieldHint from '@/components/ui/field/FieldHint.vue'
import FieldInput from '@/components/ui/field/FieldInput.vue'
import FieldLabel from '@/components/ui/field/FieldLabel.vue'
import FieldSet from '@/components/ui/field/FieldSet.vue'
import FieldTextarea from '@/components/ui/field/FieldTextarea.vue'
import Elapsed from '@/components/ui/figure/Elapsed.vue'
import Figure from '@/components/ui/figure/Figure.vue'
import Panel from '@/components/ui/panel/Panel.vue'
import Tabs from '@/components/ui/tabs/Tabs.vue'
import TabsList from '@/components/ui/tabs/TabsList.vue'
import TabsPanel from '@/components/ui/tabs/TabsPanel.vue'
import TabsTab from '@/components/ui/tabs/TabsTab.vue'
import { stamp } from '../format'
import type { Run } from '../runs'
import { STATUS_TONE } from '../status'
import { Q30_FLOOR } from './columns'
import { toaster } from './toaster'

const props = defineProps<{ run: Run | null }>()

const emit = defineEmits<{
  close: []
  cancelRun: [run: Run]
}>()

/* the panel needs its run while it slides out */
const shown = ref<Run | null>(props.run)
const owner = ref('')
const note = ref('')

watch(
  () => props.run,
  (run) => {
    if (run === null) return
    shown.value = run
    owner.value = run.owner
    note.value = ''
  },
  { immediate: true },
)

const cancellable = computed(() => shown.value?.status === 'running' || shown.value?.status === 'queued')

const DETAIL = 'flex items-baseline justify-between gap-4 border-b border-reed/60 py-1.5'

const watchRun = (run: Run) =>
  toaster.create({
    title: `Watching ${run.id}`,
    description: 'A toast follows the first read.',
    type: 'info',
  })

const reassign = (run: Run) => toaster.create({ title: `${run.id} goes to ${owner.value.trim()}`, type: 'success' })
</script>

<template>
  <Panel
    v-if="shown"
    :open="props.run !== null"
    :title="shown.id"
    :description="`${shown.assay} on ${shown.sample}`"
    @update:open="
      (open: boolean) => {
        if (!open) emit('close')
      }
    "
  >
    <!-- the key remounts the tabs and the form for another run -->
    <Tabs :key="shown.id" default-value="overview" class="flex flex-col">
      <TabsList class="px-(--cell-x)">
        <TabsTab value="overview">Overview</TabsTab>
        <TabsTab value="metrics">Metrics</TabsTab>
        <TabsTab value="notes">Notes</TabsTab>
      </TabsList>

      <TabsPanel value="overview" class="px-(--cell-x)">
        <dl class="flex flex-col">
          <div :class="DETAIL">
            <dt class="text-weft-dim">Sample</dt>
            <dd class="tnum font-data text-weft">{{ shown.sample }}</dd>
          </div>
          <div :class="DETAIL">
            <dt class="text-weft-dim">Assay</dt>
            <dd class="tnum font-data text-weft">{{ shown.assay }}</dd>
          </div>
          <div :class="DETAIL">
            <dt class="text-weft-dim">Status</dt>
            <dd :class="`tnum inline-flex items-center gap-1.5 ${STATUS_TONE[shown.status]}`">
              <span class="size-1.25 rounded-full bg-current" />
              <span class="font-data">{{ shown.status }}</span>
            </dd>
          </div>
          <div :class="DETAIL">
            <dt class="text-weft-dim">Started</dt>
            <dd class="tnum font-data text-weft">{{ stamp(shown.started).full }}</dd>
          </div>
          <div :class="DETAIL">
            <dt class="text-weft-dim">Elapsed</dt>
            <dd class="tnum font-data text-weft"><Elapsed :minutes="shown.duration" /></dd>
          </div>
          <!-- a person, not a machine value: no data face -->
          <div :class="DETAIL">
            <dt class="text-weft-dim">Owner</dt>
            <dd class="tnum text-weft">{{ shown.owner }}</dd>
          </div>
        </dl>
      </TabsPanel>

      <TabsPanel value="metrics" class="px-(--cell-x)">
        <EmptyState v-if="shown.reads === 0" title="No metrics yet" description="The run has produced no reads.">
          <template #action>
            <Button variant="quiet" @click="watchRun(shown)">Tell me when it starts</Button>
          </template>
        </EmptyState>

        <dl v-else class="flex flex-col">
          <div :class="DETAIL">
            <dt class="text-weft-dim">Reads (M)</dt>
            <dd class="tnum font-data text-weft"><Figure :value="shown.reads" /></dd>
          </div>
          <div :class="DETAIL">
            <dt class="text-weft-dim">Q30 (%)</dt>
            <dd class="tnum font-data text-weft"><Figure :value="shown.q30" :low="shown.q30 < Q30_FLOOR" /></dd>
          </div>
          <div :class="DETAIL">
            <dt class="text-weft-dim">Coverage (x)</dt>
            <dd class="tnum font-data text-weft"><Figure :value="shown.coverage" /></dd>
          </div>
        </dl>
      </TabsPanel>

      <TabsPanel value="notes" class="px-(--cell-x)">
        <FieldSet legend="Reassign the run">
          <Field required :invalid="owner.trim() === ''">
            <FieldLabel>New owner</FieldLabel>
            <FieldInput v-model="owner" />
            <FieldHint>The person who answers for the result.</FieldHint>
            <FieldError>Name the person who takes the run.</FieldError>
          </Field>

          <Field>
            <FieldLabel>Note</FieldLabel>
            <FieldTextarea v-model="note" />
            <FieldHint>The note goes on the run, and the current owner reads it.</FieldHint>
          </Field>

          <div class="flex justify-end">
            <Button variant="primary" :disabled="owner.trim() === ''" @click="reassign(shown)">Save</Button>
          </div>
        </FieldSet>
      </TabsPanel>
    </Tabs>

    <template #footer>
      <Button variant="quiet" @click="emit('close')">Close</Button>
      <Button :disabled="!cancellable" @click="emit('cancelRun', shown)">Cancel the run</Button>
    </template>
  </Panel>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Button from '@/components/ui/button/Button.vue'
import Panel from '@/components/ui/panel/Panel.vue'
import Tabs from '@/components/ui/tabs/Tabs.vue'
import TabsList from '@/components/ui/tabs/TabsList.vue'
import TabsPanel from '@/components/ui/tabs/TabsPanel.vue'
import TabsTab from '@/components/ui/tabs/TabsTab.vue'
import Demo from './Demo.vue'

const open = ref(false)
</script>

<template>
  <Demo caption="The page stays live behind it. Narrow the window under 640px and it becomes modal instead.">
    <Button @click="open = true">Open R-4819</Button>
    <Panel v-model:open="open" title="R-4819" description="RNA-seq on LCS-0911-C">
      <Tabs default-value="overview" class="flex flex-col">
        <TabsList class="px-(--cell-x)">
          <TabsTab value="overview">Overview</TabsTab>
          <TabsTab value="metrics">Metrics</TabsTab>
        </TabsList>
        <TabsPanel value="overview" class="px-(--cell-x) text-weft-dim">
          The instrument is still writing. Everything on this panel updates while it does, and the
          table behind you stays usable.
        </TabsPanel>
        <TabsPanel value="metrics" class="px-(--cell-x) text-weft-dim">
          61.2M reads, 91.4% Q30. Coverage is not meaningful for this assay.
        </TabsPanel>
      </Tabs>
      <template #footer>
        <Button variant="quiet" @click="open = false">Close</Button>
      </template>
    </Panel>
  </Demo>
</template>

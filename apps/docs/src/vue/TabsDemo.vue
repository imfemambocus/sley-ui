<script setup lang="ts">
import Tabs from '@/components/ui/tabs/Tabs.vue'
import TabsList from '@/components/ui/tabs/TabsList.vue'
import TabsPanel from '@/components/ui/tabs/TabsPanel.vue'
import TabsTab from '@/components/ui/tabs/TabsTab.vue'
import Demo from './Demo.vue'
</script>

<template>
  <Demo class="w-full max-w-lg" caption="The mark slides between tabs. It does not move on the first render.">
    <Tabs default-value="overview" class="w-full">
      <TabsList>
        <TabsTab value="overview">Overview</TabsTab>
        <TabsTab value="metrics">Metrics</TabsTab>
        <TabsTab value="notes">Notes</TabsTab>
        <TabsTab value="audit" disabled>Audit</TabsTab>
      </TabsList>
      <TabsPanel value="overview" class="text-weft-dim">
        RNA-seq on LCS-0911-C, started 12 Aug at 09:30, owned by M. Haas.
      </TabsPanel>
      <TabsPanel value="metrics" class="text-weft-dim">
        61.2M reads at 91.4% Q30. Coverage is not meaningful for this assay.
      </TabsPanel>
      <TabsPanel value="notes" class="text-weft-dim">No note has been left on this run.</TabsPanel>
      <TabsPanel value="audit" class="text-weft-dim">Nobody can read this tab.</TabsPanel>
    </Tabs>
  </Demo>
</template>

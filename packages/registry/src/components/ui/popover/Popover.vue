<script setup lang="ts">
import { Popover as ArkPopover } from '@ark-ui/vue/popover'
</script>

<!--
  a bare ark root. every option it takes, `positioning` and `v-model:open` among them, arrives as
  an attribute and vue forwards it, which is also why the file declares no props of its own.
-->
<template>
  <ArkPopover.Root>
    <slot />
  </ArkPopover.Root>
</template>

<script setup lang="ts">
import { Popover as ArkPopover } from '@ark-ui/vue/popover'
</script>

<template>
  <ArkPopover.Trigger>
    <slot />
  </ArkPopover.Trigger>
</template>

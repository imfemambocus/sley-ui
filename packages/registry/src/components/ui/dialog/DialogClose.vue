<script setup lang="ts">
import { Dialog as ArkDialog } from '@ark-ui/vue/dialog'
</script>

<template>
  <ArkDialog.CloseTrigger>
    <slot />
  </ArkDialog.CloseTrigger>
</template>

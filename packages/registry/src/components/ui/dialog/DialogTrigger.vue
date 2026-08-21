<script setup lang="ts">
import { Dialog as ArkDialog } from '@ark-ui/vue/dialog'
</script>

<template>
  <ArkDialog.Trigger>
    <slot />
  </ArkDialog.Trigger>
</template>

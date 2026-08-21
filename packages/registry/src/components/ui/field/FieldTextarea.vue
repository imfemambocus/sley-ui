<script setup lang="ts">
import { Field as ArkField } from '@ark-ui/vue/field'
import type { HTMLAttributes } from 'vue'
import { cx } from '@/lib/cx'

const props = defineProps<{ class?: HTMLAttributes['class'] }>()

const value = defineModel<string>()
</script>

<template>
  <ArkField.Textarea
    v-model="value"
    :class="cx('ctl ctl-entry min-h-20 resize-y py-(--stack) leading-relaxed', props.class)"
  />
</template>

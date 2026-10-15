<template>
  <div class="underline-tabs" role="tablist">
    <button
      v-for="tab in tabs"
      :key="tab.value"
      class="underline-tabs-tab"
      :class="{ active: modelValue === tab.value }"
      :disabled="tab.disabled"
      role="tab"
      :aria-selected="modelValue === tab.value"
      type="button"
      @click="selectTab(tab)"
    >
      {{ tab.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
import type { UnderlineTabItem } from './underline-tabs'

defineProps<{
  tabs: UnderlineTabItem[]
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  change: [value: string]
}>()

function selectTab(tab: UnderlineTabItem) {
  if (tab.disabled) return
  emit('update:modelValue', tab.value)
  emit('change', tab.value)
}
</script>

<!-- 样式在 src/styles/underline-tabs.css（库只导出样式入口，消费端显式引入）。 -->

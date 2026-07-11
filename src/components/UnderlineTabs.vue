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

<style scoped>
.underline-tabs {
  display: flex;
  align-items: center;
  gap: 18px;
  height: 34px;
  padding: 0 12px;
  background: var(--bui-tabs-bg, #fff);
  border-bottom: 1px solid var(--bui-border-color, #d0d7de);
  box-sizing: border-box;
}

.underline-tabs-tab {
  position: relative;
  height: 34px;
  padding: 0;
  border: 0;
  color: var(--bui-muted-color, #57606a);
  background: transparent;
  cursor: pointer;
  font: inherit;
  line-height: 34px;
}

.underline-tabs-tab:hover {
  color: var(--bui-primary-link-color, #0969da);
}

.underline-tabs-tab.active {
  color: var(--bui-primary-link-color, #0969da);
}

.underline-tabs-tab.active::after {
  position: absolute;
  right: 0;
  bottom: -1px;
  left: 0;
  height: 2px;
  background: var(--bui-primary-link-color, #0969da);
  content: "";
}

.underline-tabs-tab:disabled {
  color: var(--bui-disabled-color, #8c959f);
  cursor: not-allowed;
}
</style>

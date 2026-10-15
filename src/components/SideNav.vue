<template>
  <nav class="bui-side-nav" :class="{ 'is-collapsed': collapsed }">
    <div v-if="section" class="bui-side-nav__section">{{ section }}</div>
    <ul class="bui-side-nav__list">
      <li
        v-for="item in items"
        :key="itemKey(item)"
        class="bui-side-nav__item"
        :class="{ 'is-open': isOpen(item), 'has-active': hasActiveChild(item) }"
      >
        <a
          v-if="hasChildren(item)"
          class="bui-side-nav__link bui-side-nav__link--group"
          :href="item.path || 'javascript:void(0)'"
          :aria-expanded="isOpen(item)"
          @click.prevent="toggle(item)"
        >
          <span v-if="item.icon" class="bui-side-nav__icon">
            <component :is="item.icon" />
          </span>
          <span class="bui-side-nav__label">{{ item.title }}</span>
          <span class="bui-side-nav__caret" aria-hidden="true" />
        </a>
        <a
          v-else
          class="bui-side-nav__link"
          :class="{ 'is-active': isActive(item) }"
          :href="item.path"
          @click.prevent="emit('navigate', item.path)"
        >
          <span v-if="item.icon" class="bui-side-nav__icon">
            <component :is="item.icon" />
          </span>
          <span class="bui-side-nav__label">{{ item.title }}</span>
        </a>
        <ul v-if="hasChildren(item)" v-show="!collapsed && isOpen(item)" class="bui-side-nav__tree">
          <li v-for="child in item.children" :key="child.path" class="bui-side-nav__item">
            <a
              class="bui-side-nav__link"
              :class="{ 'is-active': isActive(child) }"
              :href="child.path"
              @click.prevent="emit('navigate', child.path)"
            >
              <span v-if="child.icon" class="bui-side-nav__icon">
                <component :is="child.icon" />
              </span>
              <span class="bui-side-nav__label">{{ child.title }}</span>
            </a>
          </li>
        </ul>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { SideNavItem } from './side-nav'

const props = withDefaults(
  defineProps<{
    items: SideNavItem[]
    /** 当前路由路径；用于高亮叶子项、给含激活项的分组画左侧主色条并自动展开。 */
    activePath?: string
    /** 菜单区标题（可选，如「导航」）。 */
    section?: string
    /**
     * 手风琴：同时只展开一个分组（点击分组标题展开时收起其它组），默认开启。
     * 关掉后分组各自独立展开/收起。
     */
    accordion?: boolean
    /** 窄屏收起态：只留图标，隐藏文字、分组子项与箭头（宿主按视口宽度切换）。 */
    collapsed?: boolean
  }>(),
  { activePath: '', section: '', accordion: true, collapsed: false },
)

const emit = defineEmits<{ navigate: [path: string] }>()

function hasChildren(item: SideNavItem): boolean {
  return Array.isArray(item.children) && item.children.length > 0
}

/** 分组的稳定键：有 path 用 path，纯分组用标题。 */
function itemKey(item: SideNavItem): string {
  return item.path || item.title
}

function isActive(item: SideNavItem): boolean {
  return props.activePath !== '' && item.path === props.activePath
}

/** 分组内（含更深层）是否有当前条目：决定是否画左侧主色条。 */
function hasActiveChild(item: SideNavItem): boolean {
  return (item.children ?? []).some((child) => isActive(child) || hasActiveChild(child))
}

const openKeys = ref<Set<string>>(new Set())

/**
 * 展开当前条目所在的分组（其它分组收起）。菜单位置随路由变化时重新对齐，
 * 与门户侧栏一致：默认只露出当前所在的分组，避免长菜单把侧栏撑满。
 */
function openActiveGroups(): void {
  const next = new Set<string>(props.accordion ? [] : openKeys.value)
  props.items.forEach((item) => {
    if (hasChildren(item) && hasActiveChild(item)) next.add(itemKey(item))
  })
  openKeys.value = next
}

openActiveGroups()
watch(() => props.activePath, openActiveGroups)

function isOpen(item: SideNavItem): boolean {
  return openKeys.value.has(itemKey(item))
}

function toggle(item: SideNavItem): void {
  const key = itemKey(item)
  const next = new Set<string>(props.accordion ? [] : openKeys.value)
  if (!openKeys.value.has(key)) next.add(key)
  openKeys.value = next
}
</script>

<!-- 样式在 src/styles/side-nav.css（库只导出样式入口，消费端显式引入）。 -->

<template>
  <div class="data-grid">
    <div v-if="showLoadingIndicator" class="data-grid-loading-indicator">
      <t-loading size="small" />
      <span>{{ loadingText }}</span>
    </div>
    <div v-if="showTopToolbar" class="data-gridbar data-gridbar-top">
      <div class="data-gridbar-actions">
        <t-button
          v-for="action in visibleActions"
          :key="action.code"
          :class="actionClass(action)"
          theme="default"
          :variant="action.variant || 'text'"
          size="small"
          @click="triggerAction(action)"
        >
          <template v-if="action.icon" #icon>
            <component :is="action.icon" />
          </template>
          {{ action.label }}
        </t-button>
        <span v-if="selectable && selectedRowKeys.length > 0" class="data-grid-selection">
          已选择 <strong>{{ selectedRowKeys.length }}</strong> 条
        </span>
      </div>
      <div class="data-gridbar-view">
        <t-popup
          v-if="columnConfigurable"
          v-model="topColumnPopupVisible"
          trigger="click"
          placement="bottom-right"
          overlay-inner-class-name="data-grid-column-popup"
          @visible-change="onColumnPopupVisibleChange('top', $event)"
        >
          <t-button size="small" variant="text" shape="square" title="显示列">
            <template #icon><ViewColumnIcon /></template>
          </t-button>
          <template #content>
            <div class="data-grid-column-panel">
              <div class="data-grid-column-panel-title">显示列</div>
              <div class="data-grid-column-actions">
                <button type="button" @click="showAllColumns">全选</button>
                <button type="button" @click="resetColumns">恢复默认</button>
              </div>
              <div class="data-grid-column-list">
                <t-checkbox
                  v-for="option in columnOptions"
                  :key="option.key"
                  :checked="visibleColumnKeys.includes(option.key)"
                  :disabled="isLastVisibleColumn(option.key)"
                  @change="toggleColumn(option.key, Boolean($event))"
                >
                  {{ option.title }}
                </t-checkbox>
              </div>
            </div>
          </template>
        </t-popup>
        <div v-if="showPager" class="data-grid-pager">
          <t-button v-if="hasPagination && pageCurrent > 1" size="small" variant="text" shape="square" @click="goPage(1)">
            <template #icon><PageFirstIcon /></template>
          </t-button>
          <t-button v-if="hasPagination && pageCurrent > 1" size="small" variant="text" shape="square" @click="goPage(pageCurrent - 1)">
            <template #icon><ChevronLeftIcon /></template>
          </t-button>
          <t-popup
            v-if="hasPagination"
            v-model="topPagerPopupVisible"
            trigger="click"
            placement="bottom"
            overlay-inner-class-name="data-grid-pager-popup"
            @visible-change="onPagerPopupVisibleChange('top', $event)"
          >
            <button class="data-grid-pager-summary" type="button" title="点击设置页码和每页条数">
              {{ pageFrom }}-{{ pageTo }} of {{ pageTotal }}
            </button>
            <template #content>
              <div class="data-grid-pager-editor">
                <label class="data-grid-pager-field">
                  <span>每页</span>
                  <t-select v-model="pageSizeDraft" size="small">
                    <t-option v-for="size in pageSizeOptions" :key="size" :label="`${size} 条`" :value="size" />
                  </t-select>
                </label>
                <label class="data-grid-pager-field">
                  <span>页码</span>
                  <span class="data-grid-page-input">
                    <t-input-number v-model="pageDraft" size="small" theme="normal" :min="1" :max="pageCount" />
                    <span class="data-grid-page-total">/ {{ pageCount }}</span>
                  </span>
                </label>
                <t-button size="small" theme="primary" @click="applyPager">确定</t-button>
              </div>
            </template>
          </t-popup>
          <span v-else class="data-grid-pager-summary data-grid-pager-summary-static">
            {{ pageFrom }}-{{ pageTo }} of {{ pageTotal }}
          </span>
          <t-button v-if="hasPagination && pageCurrent < pageCount" size="small" variant="text" shape="square" @click="goPage(pageCurrent + 1)">
            <template #icon><ChevronRightIcon /></template>
          </t-button>
          <t-button v-if="hasPagination && pageCurrent < pageCount" size="small" variant="text" shape="square" @click="goPage(pageCount)">
            <template #icon><PageLastIcon /></template>
          </t-button>
        </div>
      </div>
    </div>

    <t-table
      :row-key="rowKey"
      size="small"
      :data="data"
      :columns="computedColumns"
      :loading="tableLoading"
      :selected-row-keys="selectedRowKeys"
      :sort="tableSort"
      :row-class-name="rowClassName"
      cell-empty-content="-"
      @row-click="onRowClick"
      @select-change="onSelectChange"
      @sort-change="onSortChange"
    />

    <div v-if="showBottomToolbar" class="data-gridbar data-gridbar-bottom">
      <div class="data-gridbar-actions">
        <t-button
          v-for="action in visibleActions"
          :key="action.code"
          :class="actionClass(action)"
          theme="default"
          :variant="action.variant || 'text'"
          size="small"
          @click="triggerAction(action)"
        >
          <template v-if="action.icon" #icon>
            <component :is="action.icon" />
          </template>
          {{ action.label }}
        </t-button>
        <span v-if="selectable && selectedRowKeys.length > 0" class="data-grid-selection">
          已选择 <strong>{{ selectedRowKeys.length }}</strong> 条
        </span>
      </div>
      <div class="data-gridbar-view">
        <t-popup
          v-if="columnConfigurable"
          v-model="bottomColumnPopupVisible"
          trigger="click"
          placement="top-right"
          overlay-inner-class-name="data-grid-column-popup"
          @visible-change="onColumnPopupVisibleChange('bottom', $event)"
        >
          <t-button size="small" variant="text" shape="square" title="显示列">
            <template #icon><ViewColumnIcon /></template>
          </t-button>
          <template #content>
            <div class="data-grid-column-panel">
              <div class="data-grid-column-panel-title">显示列</div>
              <div class="data-grid-column-actions">
                <button type="button" @click="showAllColumns">全选</button>
                <button type="button" @click="resetColumns">恢复默认</button>
              </div>
              <div class="data-grid-column-list">
                <t-checkbox
                  v-for="option in columnOptions"
                  :key="option.key"
                  :checked="visibleColumnKeys.includes(option.key)"
                  :disabled="isLastVisibleColumn(option.key)"
                  @change="toggleColumn(option.key, Boolean($event))"
                >
                  {{ option.title }}
                </t-checkbox>
              </div>
            </div>
          </template>
        </t-popup>
        <div v-if="showPager" class="data-grid-pager">
          <t-button v-if="hasPagination && pageCurrent > 1" size="small" variant="text" shape="square" @click="goPage(1)">
            <template #icon><PageFirstIcon /></template>
          </t-button>
          <t-button v-if="hasPagination && pageCurrent > 1" size="small" variant="text" shape="square" @click="goPage(pageCurrent - 1)">
            <template #icon><ChevronLeftIcon /></template>
          </t-button>
          <t-popup
            v-if="hasPagination"
            v-model="bottomPagerPopupVisible"
            trigger="click"
            placement="top"
            overlay-inner-class-name="data-grid-pager-popup"
            @visible-change="onPagerPopupVisibleChange('bottom', $event)"
          >
            <button class="data-grid-pager-summary" type="button" title="点击设置页码和每页条数">
              {{ pageFrom }}-{{ pageTo }} of {{ pageTotal }}
            </button>
            <template #content>
              <div class="data-grid-pager-editor">
                <label class="data-grid-pager-field">
                  <span>每页</span>
                  <t-select v-model="pageSizeDraft" size="small">
                    <t-option v-for="size in pageSizeOptions" :key="size" :label="`${size} 条`" :value="size" />
                  </t-select>
                </label>
                <label class="data-grid-pager-field">
                  <span>页码</span>
                  <span class="data-grid-page-input">
                    <t-input-number v-model="pageDraft" size="small" theme="normal" :min="1" :max="pageCount" />
                    <span class="data-grid-page-total">/ {{ pageCount }}</span>
                  </span>
                </label>
                <t-button size="small" theme="primary" @click="applyPager">确定</t-button>
              </div>
            </template>
          </t-popup>
          <span v-else class="data-grid-pager-summary data-grid-pager-summary-static">
            {{ pageFrom }}-{{ pageTo }} of {{ pageTotal }}
          </span>
          <t-button v-if="hasPagination && pageCurrent < pageCount" size="small" variant="text" shape="square" @click="goPage(pageCurrent + 1)">
            <template #icon><ChevronRightIcon /></template>
          </t-button>
          <t-button v-if="hasPagination && pageCurrent < pageCount" size="small" variant="text" shape="square" @click="goPage(pageCount)">
            <template #icon><PageLastIcon /></template>
          </t-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" generic="T extends Record<string, unknown>">
import { computed, h, ref, watch } from 'vue'
import type { PageInfo, PrimaryTableCol, TableSort } from 'tdesign-vue-next'
import { ChevronLeftIcon, ChevronRightIcon, PageFirstIcon, PageLastIcon, ViewColumnIcon } from 'tdesign-icons-vue-next'
import type { DataGridAction, DataGridColumn, DataGridLoadingMode, DataGridToolbarPlacement } from './data-grid'

interface DataGridPagination {
  current?: number
  pageSize?: number
  total?: number
}

const props = withDefaults(defineProps<{
  rowKey: string
  data: T[]
  columns: DataGridColumn[]
  loading?: boolean
  loadingMode?: DataGridLoadingMode
  loadingText?: string
  pagination?: DataGridPagination
  selectable?: boolean
  actions?: DataGridAction[]
  pageSizeOptions?: number[]
  toolbarPlacement?: DataGridToolbarPlacement
  bottomToolbarThreshold?: number
  columnConfigurable?: boolean
  sort?: string
}>(), {
  loading: false,
  loadingMode: 'mask',
  loadingText: '加载中',
  pagination: undefined,
  selectable: false,
  actions: () => [],
  pageSizeOptions: () => [30, 50, 100, 300, 500, 1000],
  toolbarPlacement: 'both',
  bottomToolbarThreshold: 50,
  columnConfigurable: false,
  sort: '',
})

const emit = defineEmits<{
  pageChange: [page: PageInfo]
  sortChange: [sort: string]
  action: [payload: { action: DataGridAction; selectedRowKeys: Array<string | number>; selectedRows: T[] }]
  selectChange: [keys: Array<string | number>, rows: T[]]
}>()

const selectedRowKeys = ref<Array<string | number>>([])
const topPagerPopupVisible = ref(false)
const bottomPagerPopupVisible = ref(false)
const topColumnPopupVisible = ref(false)
const bottomColumnPopupVisible = ref(false)
const pageDraft = ref(1)
const pageSizeDraft = ref(20)
const visibleColumnKeys = ref<string[]>([])
const tableLoading = computed(() => props.loading && props.loadingMode === 'mask')
const showLoadingIndicator = computed(() => props.loading && props.loadingMode === 'indicator')
const selectionColumnWidth = 40

const computedColumns = computed<PrimaryTableCol<T>[]>(() => {
  const visibleColumns = normalizeSelectableColumnWidths(
    props.columns.filter((col) => shouldShowColumn(col)).map(withSort),
  ) as unknown as PrimaryTableCol<T>[]
  if (!props.selectable) return visibleColumns
  if (visibleColumns.some((col) => col.type === 'multiple' || col.type === 'single')) return visibleColumns
  return [
    {
      colKey: 'row-select',
      type: 'multiple',
      width: selectionColumnWidth,
      minWidth: selectionColumnWidth,
      align: 'center',
      fixed: 'left',
      className: 'data-grid-selection-column',
      thClassName: 'data-grid-selection-column',
    },
    ...visibleColumns,
  ]
})

const configurableColumns = computed(() => props.columns.filter((col) => isConfigurableColumn(col)))

const columnOptions = computed(() => configurableColumns.value.map((col) => ({
  key: String(col.colKey),
  title: typeof col.title === 'string' ? col.title : String(col.colKey),
})))

const selectedRows = computed(() => {
  const keySet = new Set(selectedRowKeys.value)
  return props.data.filter((row) => keySet.has(rowKeyOf(row)))
})

const visibleActions = computed(() => {
  const count = selectedRowKeys.value.length
  return props.actions.filter((action) => {
    switch (action.selection || 'none') {
      case 'none':
        return true
      case 'one':
        return count === 1
      case 'oneOrMore':
        return count >= 1
      case 'many':
        return count > 1
      default:
        return true
    }
  })
})

const hasPagination = computed(() => Boolean(props.pagination))
const showPager = computed(() => hasPagination.value || props.pagination === undefined)
const hasLongPage = computed(() => props.data.length >= props.bottomToolbarThreshold)
const showTopToolbar = computed(() => props.toolbarPlacement !== 'bottom')
const showBottomToolbar = computed(() => {
  if (props.toolbarPlacement === 'both' || props.toolbarPlacement === 'bottom') return true
  if (props.toolbarPlacement === 'auto') return hasLongPage.value
  return false
})
const pageCurrent = computed(() => Math.max(1, Number(props.pagination?.current || 1)))
const pageSize = computed(() => Math.max(1, Number(props.pagination?.pageSize || props.data.length || 20)))
const pageTotal = computed(() => Math.max(0, Number(props.pagination?.total ?? props.data.length)))
const pageCount = computed(() => Math.max(1, Math.ceil(pageTotal.value / pageSize.value)))
const pageFrom = computed(() => {
  if (pageTotal.value === 0) return 0
  return (pageCurrent.value - 1) * pageSize.value + 1
})
const pageTo = computed(() => Math.min(pageCurrent.value * pageSize.value, pageTotal.value))
const tableSort = computed<TableSort | undefined>(() => {
  if (!props.sort) return undefined
  const descending = props.sort.startsWith('-')
  const key = descending ? props.sort.substring(1) : props.sort
  return { sortBy: tableSortKeyOf(key), descending }
})

watch(
  () => props.data,
  () => {
    selectedRowKeys.value = []
  },
)

watch(
  () => props.columns,
  () => {
    const configurableKeys = configurableColumns.value.map((col) => String(col.colKey))
    const currentKeys = visibleColumnKeys.value.filter((key) => configurableKeys.includes(key))
    visibleColumnKeys.value = currentKeys.length > 0 ? currentKeys : defaultVisibleColumnKeys()
  },
  { immediate: true },
)

watch(
  () => [pageCurrent.value, pageSize.value],
  () => {
    pageDraft.value = pageCurrent.value
    pageSizeDraft.value = pageSize.value
  },
  { immediate: true },
)

function rowKeyOf(row: T): string | number {
  return row[props.rowKey] as string | number
}

function isConfigurableColumn(column: DataGridColumn) {
  return Boolean(props.columnConfigurable && column.colKey && column.configurable !== false && !column.type)
}

function isSortableColumn(column: DataGridColumn) {
  return Boolean(!column.type && column.colKey && (column.sortable || column.sortKey))
}

function sortKeyOf(column: DataGridColumn) {
  return column.sortKey || String(column.colKey)
}

function withSort(column: DataGridColumn): DataGridColumn {
  if (!isSortableColumn(column)) return column
  return {
    ...column,
    title: sortableColumnTitle(column),
    thClassName: sortableThClassName(column),
    attrs: sortableThAttrs(column),
    sorter: true,
    sortType: 'all',
  }
}

function normalizeSelectableColumnWidths(columns: DataGridColumn[]): DataGridColumn[] {
  if (!props.selectable) return columns
  if (columns.some((col) => col.type === 'multiple' || col.type === 'single')) return columns
  const percentColumns = columns
    .map((column) => ({ column, percent: percentWidthValue(column.width) }))
    .filter((item): item is { column: DataGridColumn; percent: number } => item.percent !== undefined)
  const percentTotal = percentColumns.reduce((total, item) => total + item.percent, 0)
  if (percentTotal <= 0) return columns
  return columns.map((column) => {
    const percent = percentWidthValue(column.width)
    if (percent === undefined) return column
    return {
      ...column,
      width: `calc((100% - ${selectionColumnWidth}px) * ${percent} / ${percentTotal})`,
    }
  })
}

function percentWidthValue(width: DataGridColumn['width']) {
  if (typeof width !== 'string') return undefined
  const match = width.trim().match(/^(\d+(?:\.\d+)?)%$/)
  return match ? Number(match[1]) : undefined
}

function tableSortKeyOf(sortKey: string) {
  const column = props.columns.find((col) => sortKeyOf(col) === sortKey)
  return column?.colKey ? String(column.colKey) : sortKey
}

function sortableThClassName(column: DataGridColumn) {
  const classNames = Array.isArray(column.thClassName)
    ? column.thClassName
    : column.thClassName
      ? [column.thClassName]
      : []
  return [...classNames, 'sortable-header']
}

function sortableColumnTitle(column: DataGridColumn): DataGridColumn['title'] {
  if (typeof column.title !== 'string') return column.title
  return () => h('span', { class: 'data-grid-sort-title-text', title: sortableTitle(column) }, column.title as string)
}

function sortableThAttrs(column: DataGridColumn): DataGridColumn['attrs'] {
  return (context) => {
    const originAttrs = typeof column.attrs === 'function' ? column.attrs(context) : column.attrs || {}
    if (context.type !== 'th') return originAttrs
    const originClick = originAttrs.onClick
    const attrsWithoutTitle = { ...originAttrs }
    delete attrsWithoutTitle.title
    return {
      ...attrsWithoutTitle,
      onClickCapture: (event: MouseEvent) => {
        if (!eventTargetInSortIcon(event.target)) return
        event.preventDefault()
        event.stopPropagation()
        toggleSort(column)
      },
      onClick: (event: MouseEvent) => {
        if (eventTargetInSortIcon(event.target)) return
        if (typeof originClick === 'function') originClick(event)
        if (!event.defaultPrevented) toggleSort(column)
      },
    }
  }
}

function sortableTitle(column: DataGridColumn) {
  const title = columnTitleOf(column)
  const key = sortKeyOf(column)
  if (props.sort === key) return `${title}，点击降序`
  if (props.sort === `-${key}`) return `${title}，点击取消排序`
  return `${title}，点击升序`
}

function columnTitleOf(column: DataGridColumn) {
  return typeof column.title === 'string' ? column.title : String(column.colKey || '')
}

function eventTargetInSortIcon(target: EventTarget | null) {
  return target instanceof HTMLElement && Boolean(target.closest('.t-table__cell--sort-trigger'))
}

function toggleSort(column: DataGridColumn) {
  const key = sortKeyOf(column)
  if (props.sort === key) {
    emit('sortChange', `-${key}`)
  } else if (props.sort === `-${key}`) {
    emit('sortChange', '')
  } else {
    emit('sortChange', key)
  }
}

function shouldShowColumn(column: DataGridColumn) {
  if (!isConfigurableColumn(column)) return true
  return visibleColumnKeys.value.includes(String(column.colKey))
}

function defaultVisibleColumnKeys() {
  const defaultKeys = configurableColumns.value
    .filter((col) => col.defaultVisible !== false)
    .map((col) => String(col.colKey))
  return defaultKeys.length > 0 ? defaultKeys : configurableColumns.value.slice(0, 1).map((col) => String(col.colKey))
}

function showAllColumns() {
  visibleColumnKeys.value = configurableColumns.value.map((col) => String(col.colKey))
}

function resetColumns() {
  visibleColumnKeys.value = defaultVisibleColumnKeys()
}

function toggleColumn(key: string, checked: boolean) {
  const next = new Set(visibleColumnKeys.value)
  if (checked) next.add(key)
  else if (next.size > 1) next.delete(key)
  visibleColumnKeys.value = [...next]
}

function isLastVisibleColumn(key: string) {
  return visibleColumnKeys.value.includes(key) && visibleColumnKeys.value.length <= 1
}

function onSelectChange(keys: Array<string | number>) {
  selectedRowKeys.value = keys
  emit('selectChange', keys, selectedRows.value)
}

function onSortChange(sort: TableSort) {
  const current = Array.isArray(sort) ? sort[0] : sort
  if (!current?.sortBy) {
    emit('sortChange', '')
    return
  }
  const column = props.columns.find((col) => String(col.colKey) === current.sortBy)
  const sortKey = column ? sortKeyOf(column) : current.sortBy
  emit('sortChange', current.descending ? `-${sortKey}` : sortKey)
}

function onRowClick(context: { row: T; e?: MouseEvent }) {
  if (!props.selectable || isInteractiveTarget(context.e?.target)) return
  const key = rowKeyOf(context.row)
  const next = new Set(selectedRowKeys.value)
  if (next.has(key)) next.delete(key)
  else next.add(key)
  onSelectChange([...next])
}

function rowClassName({ row }: { row: T }) {
  return selectedRowKeys.value.includes(rowKeyOf(row)) ? 'data-grid-row-selected' : ''
}

function isInteractiveTarget(target: EventTarget | null | undefined): boolean {
  if (!(target instanceof HTMLElement)) return false
  return Boolean(target.closest('button,a,input,label,.t-checkbox,.t-radio,.t-switch,.t-dropdown'))
}

function triggerAction(action: DataGridAction) {
  emit('action', {
    action,
    selectedRowKeys: selectedRowKeys.value,
    selectedRows: selectedRows.value,
  })
}

function actionClass(action: DataGridAction) {
  return ['data-gridbar-action', `data-gridbar-action-${action.theme || 'default'}`]
}

function goPage(page: number, size = pageSize.value) {
  const nextPageSize = Math.max(1, size)
  const nextPageCount = Math.max(1, Math.ceil(pageTotal.value / nextPageSize))
  const nextCurrent = Math.min(Math.max(1, page), nextPageCount)
  emit('pageChange', {
    current: nextCurrent,
    previous: pageCurrent.value,
    pageSize: nextPageSize,
  })
}

function onPagerPopupVisibleChange(position: 'top' | 'bottom', visible: boolean) {
  if (!visible) return
  if (position === 'top') bottomPagerPopupVisible.value = false
  else topPagerPopupVisible.value = false
}

function onColumnPopupVisibleChange(position: 'top' | 'bottom', visible: boolean) {
  if (!visible) return
  if (position === 'top') bottomColumnPopupVisible.value = false
  else topColumnPopupVisible.value = false
}

function applyPager() {
  goPage(Number(pageDraft.value || 1), Number(pageSizeDraft.value || pageSize.value))
  topPagerPopupVisible.value = false
  bottomPagerPopupVisible.value = false
}
</script>

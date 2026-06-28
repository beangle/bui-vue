import type { Component } from 'vue'
import type { PrimaryTableCol } from 'tdesign-vue-next'

export type DataGridActionRequirement = 'none' | 'one' | 'oneOrMore' | 'many'
export type DataGridToolbarPlacement = 'top' | 'bottom' | 'both' | 'auto'

export interface DataGridColumnConfig {
  configurable?: boolean
  defaultVisible?: boolean
  sortable?: boolean
  sortKey?: string
}

export type DataGridColumn = PrimaryTableCol & DataGridColumnConfig

export interface DataGridAction {
  code: string
  label: string
  selection?: DataGridActionRequirement
  icon?: Component
  theme?: 'default' | 'primary' | 'danger' | 'warning' | 'success'
  variant?: 'base' | 'outline' | 'dashed' | 'text'
}

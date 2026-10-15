import type { Component } from 'vue'

/**
 * 侧栏菜单项。带 `children` 的条目渲染成可折叠分组；分组的 `path` 为空时标题只负责展开/收起。
 * 标题由宿主负责翻译（Host apps translate titles themselves）。
 */
export interface SideNavItem {
  /** 路由路径；分组条目（带 children）不导航，可留空。 */
  path: string
  title: string
  icon?: Component
  /** 子菜单：非空时本条目渲染成可折叠分组，子项整层缩进。 */
  children?: SideNavItem[]
}

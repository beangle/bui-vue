# @beangle/bui-vue

Shared Vue 3 UI components and style entries for Beangle front-ends, built on top of
[TDesign Vue Next](https://tdesign.tencent.com/vue-next).

- **Components**: `DataGrid`, `SideNav`, `UnderlineTabs`
- **Styles**: the package ships only *style entries* — components carry no SFC styles, so apps import them explicitly
- **Theme / palette / locale**: three small utility modules that persist to `localStorage` and broadcast changes via `CustomEvent`

## Install

```bash
npm i @beangle/bui-vue
```

Peer dependencies are installed by the host app: `vue@^3.5`, `tdesign-vue-next@^1.20`, `tdesign-icons-vue-next@^0.4`.

## Quick Start

Components carry no SFC styles, so style entries must be imported explicitly:

```ts
import { createApp } from 'vue'
import TDesign from 'tdesign-vue-next'
import 'tdesign-vue-next/es/style/index.css'
import '@beangle/bui-vue/styles/theme.css'

createApp(App).use(TDesign).mount('#app')
```

A typical list page — query panel plus data grid:

```vue
<script setup lang="ts">
import { DataGrid, type DataGridColumn } from '@beangle/bui-vue'
import '@beangle/bui-vue/styles/data-grid.css'
import '@beangle/bui-vue/styles/query-form.css'
import '@beangle/bui-vue/styles/workbench.css'

const columns: DataGridColumn[] = [
  { colKey: 'name', title: 'Name', width: '20%' },
  { colKey: 'ip', title: 'IP Address' },
]
const data = [{ id: 1, name: 'web33', ip: '10.0.0.1' }]
</script>

<template>
  <DataGrid row-key="id" :data="data" :columns="columns" selectable />
</template>
```

## Components

| Component | Description |
| --- | --- |
| `DataGrid` | Data table for list pages: columns, pagination, selection, row actions, configurable columns, toolbars, tree data; extra attributes are passed through to TDesign `t-table` |
| `SideNav` | Side menu: collapsible groups, active leaf highlight, accordion mode, collapsed (icon-only) mode |
| `UnderlineTabs` | Underlined tabs with `v-model`, supports disabled items |

Common `DataGrid` props: `rowKey`, `data`, `columns`, `pagination`, `selectable`, `actions`, `tree`,
`loadingMode`, `toolbarPlacement`, `bottomToolbarThreshold`, `columnConfigurable`, `sort`.

## Style Entries

| Entry | Purpose |
| --- | --- |
| `styles/theme.css` | Base theme variables, including dark mode |
| `styles/table.css` | Compact table utility class `.table-mini` |
| `styles/data-grid.css` | Styles for `DataGrid`, plus classic BUI grid palette defaults |
| `styles/query-form.css` | List-page query panel `.query-panel` |
| `styles/workbench.css` | List-page workbench frame, pairs with the query panel |
| `styles/drawer-form.css` | Compact form inside drawers `.drawer-form` |
| `styles/underline-tabs.css` | Styles for `UnderlineTabs` |
| `styles/side-nav.css` | Styles for `SideNav` |

## Theme, Palette and Locale

```ts
import {
  // Theme: light / dark, written to <html theme-mode>
  applyDocumentTheme, getStoredTheme, setStoredThemeAndNotify, onThemeChange,
  // Palette: expose portal colors as --bui-* custom properties
  applyPaletteVars, getStoredPalette, applyStoredPaletteIfPresent, normalizePalette,
  // Locale: zh-CN / en-US
  getStoredLocale, setStoredLocaleAndNotify, onLocaleChange, normalizeLocale,
} from '@beangle/bui-vue'
```

## Development

```bash
pnpm install
pnpm test        # vitest
pnpm typecheck   # vue-tsc --noEmit
pnpm build       # outputs dist/
```

## Releasing

Releasing is handled outside this repository by the generic scripts in `~/bin`:

- `npm-release.sh` — stable releases: merge develop into main, tag, publish, then bump develop to the next version
- `npm-release-dev.sh` — dev previews `X.Y.Z-dev.<UTC timestamp>` published against a local registry proxy (no VCS operations)

## License

[GPL-3.0-or-later](./LICENSE)

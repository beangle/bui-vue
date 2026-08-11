/**
 * Portal 主题色板（bui 的 `beangle.ui.theme` JSON）读取与变量应用。
 *
 * 门户侧（ems-shell）会把主题色 JSON 存入 localStorage 的 `beangle.ui.theme`，
 * 结构为 `NavTheme`：primaryColor / navbarBgColor / searchBgColor / gridbarBgColor / gridBorderColor。
 *
 * 独立运行（不经门户嵌入）时 bui-vue 应用可从本地主动读取并写入 CSS 变量，
 * 与门户 `applyThemeVars` 写入的变量名保持一致，保证两种形态主题一致。
 */

/** localStorage key：门户主题色板（JSON），与 bui / ems-shell 共享。 */
export const PALETTE_STORAGE_KEY = 'beangle.ui.theme'

export interface NavThemePalette {
  primaryColor: string
  navbarBgColor: string
  searchBgColor: string
  gridbarBgColor: string
  gridHeaderBgColor?: string
  gridBorderColor: string
}

const EMPTY_PALETTE: NavThemePalette = {
  primaryColor: '',
  navbarBgColor: '',
  searchBgColor: '',
  gridbarBgColor: '',
  gridBorderColor: '',
}

/** 归一化：缺失字段回退为空串（无效输入返回空色板）。 */
export function normalizePalette(raw: unknown): NavThemePalette {
  if (raw == null || typeof raw !== 'object') return { ...EMPTY_PALETTE }
  const obj = raw as Partial<NavThemePalette>
  return {
    primaryColor: typeof obj.primaryColor === 'string' ? obj.primaryColor : '',
    navbarBgColor: typeof obj.navbarBgColor === 'string' ? obj.navbarBgColor : '',
    searchBgColor: typeof obj.searchBgColor === 'string' ? obj.searchBgColor : '',
    gridbarBgColor: typeof obj.gridbarBgColor === 'string' ? obj.gridbarBgColor : '',
    gridHeaderBgColor: typeof obj.gridHeaderBgColor === 'string' ? obj.gridHeaderBgColor : '',
    gridBorderColor: typeof obj.gridBorderColor === 'string' ? obj.gridBorderColor : '',
  }
}

/** 从 localStorage[`beangle.ui.theme`] 读取主题色板；缺失/损坏返回空色板。 */
export function getStoredPalette(): NavThemePalette {
  try {
    if (typeof localStorage === 'undefined') return { ...EMPTY_PALETTE }
    const raw = localStorage.getItem(PALETTE_STORAGE_KEY)
    if (!raw) return { ...EMPTY_PALETTE }
    return normalizePalette(JSON.parse(raw))
  } catch {
    return { ...EMPTY_PALETTE }
  }
}

/**
 * 从单一主色生成 TDesign 10 级 brand 色板近似值（color-mix 混白/混黑）。
 * - 级 1-6 混白（浅色系，focus/light 背景用）
 * - 级 7 为主色本身
 * - 级 8-10 混黑（深色系，active/文字链接用）
 */
function brandPaletteFromPrimary(primary: string): string[] {
  // 由浅到深：1..6 混白，7 主色，8..10 混黑
  const lightMix = [0.92, 0.78, 0.6, 0.44, 0.3, 0.18]
  const levels: string[] = []
  for (const mix of lightMix) {
    levels.push(`color-mix(in srgb, ${primary} ${Math.round((1 - mix) * 100)}%, #ffffff ${Math.round(mix * 100)}%)`)
  }
  levels.push(primary)
  for (const mix of [0.14, 0.3, 0.5]) {
    levels.push(`color-mix(in srgb, ${primary} ${Math.round((1 - mix) * 100)}%, #000000 ${Math.round(mix * 100)}%)`)
  }
  return levels
}

/**
 * 将主题色板写入 `:root` CSS 变量（与 ems-shell `applyThemeVars` 同名，门户优先不冲突），
 * 并把 primaryColor 映射到 TDesign brand 色板，让 TDesign 组件跟随门户主色。
 * - gridbarBgColor → --bui-gridbar-bg
 * - gridHeaderBgColor → --bui-grid-header-bg（缺省时回退 gridbarBgColor）
 * - gridBorderColor → --bui-grid-border-color
 * - searchBgColor → --bui-search-bg、--bui-panel-subtle-bg（查询面板背景）
 * - primaryColor → --primary-color、--bui-brand-color，及 --td-brand-color-* 系列
 */
export function applyPaletteVars(palette: NavThemePalette, root: HTMLElement = document.documentElement): void {
  if (palette.primaryColor) {
    root.style.setProperty('--primary-color', palette.primaryColor)
    root.style.setProperty('--bui-brand-color', palette.primaryColor)

    // 映射 TDesign 10 级 brand 色板（覆盖 light/dark 两套，值相同由 css 层选择）
    const levels = brandPaletteFromPrimary(palette.primaryColor)
    levels.forEach((value, index) => {
      root.style.setProperty(`--td-brand-color-${index + 1}`, value)
    })
    root.style.setProperty('--td-brand-color', palette.primaryColor)
    root.style.setProperty('--td-brand-color-hover', levels[5])
    root.style.setProperty('--td-brand-color-active', levels[7])
    root.style.setProperty('--td-brand-color-disabled', levels[2])
    root.style.setProperty('--td-brand-color-light', levels[0])
    root.style.setProperty('--td-brand-color-light-hover', levels[1])
    root.style.setProperty('--td-brand-color-focus', levels[1])
    root.style.setProperty('--td-text-color-brand', palette.primaryColor)
    root.style.setProperty('--td-text-color-link', levels[7])
  }
  if (palette.navbarBgColor) root.style.setProperty('--bui-navbar-bg', palette.navbarBgColor)
  if (palette.searchBgColor) {
    // 查询面板背景（.query-panel）与门户搜索区共用
    root.style.setProperty('--bui-search-bg', palette.searchBgColor)
    root.style.setProperty('--bui-panel-subtle-bg', palette.searchBgColor)
  }
  if (palette.gridbarBgColor) {
    root.style.setProperty('--bui-gridbar-bg', palette.gridbarBgColor)
  }
  if (palette.gridHeaderBgColor) {
    root.style.setProperty('--bui-grid-header-bg', palette.gridHeaderBgColor)
  } else if (palette.gridbarBgColor) {
    root.style.setProperty('--bui-grid-header-bg', palette.gridbarBgColor)
  }
  if (palette.gridBorderColor) root.style.setProperty('--bui-grid-border-color', palette.gridBorderColor)
}

/** 读取并应用本地主题色板；有可用颜色时返回 true。 */
export function applyStoredPaletteIfPresent(): boolean {
  const palette = getStoredPalette()
  const hasAny = Object.values(palette).some((value) => value !== '')
  if (!hasAny) return false
  applyPaletteVars(palette)
  return true
}

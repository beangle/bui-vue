/** localStorage key shared with portal / micro-apps (mirrors beangle.ui.locale). */
export const THEME_STORAGE_KEY = 'beangle.ui.theme-mode'

export type UiTheme = 'light' | 'dark'

const LIGHT = new Set(['light', 'day', 'default'])
const DARK = new Set(['dark', 'night'])

/** Normalize portal / stored theme tags to light | dark. */
export function normalizeTheme(raw: unknown): UiTheme | null {
  if (raw == null) return null
  const value = String(raw).trim()
  if (!value) return null
  const lower = value.toLowerCase()
  if (LIGHT.has(value) || LIGHT.has(lower)) return 'light'
  if (DARK.has(value) || DARK.has(lower)) return 'dark'
  return null
}

/** Read theme from localStorage[`beangle.ui.theme-mode`]. */
export function getStoredTheme(): UiTheme | null {
  try {
    if (typeof localStorage === 'undefined') return null
    return normalizeTheme(localStorage.getItem(THEME_STORAGE_KEY))
  } catch {
    return null
  }
}

/** Persist theme to localStorage[`beangle.ui.theme-mode`]. */
export function setStoredTheme(theme: UiTheme | string): UiTheme | null {
  const normalized = normalizeTheme(theme)
  if (!normalized) return null
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(THEME_STORAGE_KEY, normalized)
    }
  } catch {
    // ignore quota / private mode
  }
  return normalized
}

/** Apply TDesign theme-mode on `<html>`. */
export function applyDocumentTheme(theme: UiTheme): void {
  if (typeof document === 'undefined') return
  document.documentElement.setAttribute('theme-mode', theme)
}

export type ThemeChangeListener = (theme: UiTheme) => void

/**
 * Listen for same-tab and cross-tab theme changes.
 * Same-tab writes via setStoredThemeAndNotify dispatch a CustomEvent;
 * cross-tab changes arrive via the storage event.
 */
export function onThemeChange(listener: ThemeChangeListener): () => void {
  if (typeof window === 'undefined') return () => {}

  const onCustom = (event: Event) => {
    const detail = (event as CustomEvent<unknown>).detail
    const next = normalizeTheme(detail)
    if (next) listener(next)
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key !== THEME_STORAGE_KEY || event.storageArea !== localStorage) return
    const next = normalizeTheme(event.newValue)
    if (next) listener(next)
  }

  window.addEventListener(THEME_CHANGE_EVENT, onCustom)
  window.addEventListener('storage', onStorage)

  return () => {
    window.removeEventListener(THEME_CHANGE_EVENT, onCustom)
    window.removeEventListener('storage', onStorage)
  }
}

const THEME_CHANGE_EVENT = 'beangle.ui.themechange'

/** Persist and notify same-tab listeners (skips notify when value unchanged). */
export function setStoredThemeAndNotify(theme: UiTheme | string): UiTheme | null {
  const normalized = normalizeTheme(theme)
  if (!normalized) return null
  const prev = getStoredTheme()
  setStoredTheme(normalized)
  if (prev === normalized || typeof window === 'undefined') return normalized
  window.dispatchEvent(new CustomEvent(THEME_CHANGE_EVENT, { detail: normalized }))
  return normalized
}

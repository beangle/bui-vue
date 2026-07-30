/** localStorage key shared with portal / micro-apps (mirrors beangle.ui.theme). */
export const LOCALE_STORAGE_KEY = 'beangle.ui.locale'

export type UiLocale = 'zh-CN' | 'en-US'

const ENGLISH = new Set(['en', 'en-us', 'en_us', 'en-US', 'en_US'])
const CHINESE = new Set(['zh', 'zh-cn', 'zh_cn', 'zh-CN', 'zh_CN', 'zh-hans', 'zh_hans'])

/** Normalize portal / browser locale tags to zh-CN | en-US. */
export function normalizeLocale(raw: unknown): UiLocale | null {
  if (raw == null) return null
  const value = String(raw).trim()
  if (!value) return null
  const lower = value.toLowerCase().replace(/_/g, '-')
  if (ENGLISH.has(value) || ENGLISH.has(lower) || lower.startsWith('en')) return 'en-US'
  if (CHINESE.has(value) || CHINESE.has(lower) || lower.startsWith('zh')) return 'zh-CN'
  return null
}

/** Read locale from localStorage[`beangle.ui.locale`]. */
export function getStoredLocale(): UiLocale | null {
  try {
    if (typeof localStorage === 'undefined') return null
    return normalizeLocale(localStorage.getItem(LOCALE_STORAGE_KEY))
  } catch {
    return null
  }
}

/** Persist locale to localStorage[`beangle.ui.locale`]. */
export function setStoredLocale(locale: UiLocale | string): UiLocale | null {
  const normalized = normalizeLocale(locale)
  if (!normalized) return null
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(LOCALE_STORAGE_KEY, normalized)
    }
  } catch {
    // ignore quota / private mode
  }
  return normalized
}

export type LocaleChangeListener = (locale: UiLocale) => void

/**
 * Listen for same-tab and cross-tab locale changes.
 * Same-tab writes via setStoredLocaleAndNotify dispatch a CustomEvent;
 * cross-tab changes arrive via the storage event.
 */
export function onLocaleChange(listener: LocaleChangeListener): () => void {
  if (typeof window === 'undefined') return () => {}

  const onCustom = (event: Event) => {
    const detail = (event as CustomEvent<unknown>).detail
    const next = normalizeLocale(detail)
    if (next) listener(next)
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key !== LOCALE_STORAGE_KEY || event.storageArea !== localStorage) return
    const next = normalizeLocale(event.newValue)
    if (next) listener(next)
  }

  window.addEventListener(LOCALE_CHANGE_EVENT, onCustom)
  window.addEventListener('storage', onStorage)

  return () => {
    window.removeEventListener(LOCALE_CHANGE_EVENT, onCustom)
    window.removeEventListener('storage', onStorage)
  }
}

const LOCALE_CHANGE_EVENT = 'beangle.ui.localechange'

/** Persist and notify same-tab listeners (skips notify when value unchanged). */
export function setStoredLocaleAndNotify(locale: UiLocale | string): UiLocale | null {
  const normalized = normalizeLocale(locale)
  if (!normalized) return null
  const prev = getStoredLocale()
  setStoredLocale(normalized)
  if (prev === normalized || typeof window === 'undefined') return normalized
  window.dispatchEvent(new CustomEvent(LOCALE_CHANGE_EVENT, { detail: normalized }))
  return normalized
}

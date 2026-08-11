import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  applyDocumentTheme,
  getStoredTheme,
  normalizeTheme,
  onThemeChange,
  setStoredTheme,
  setStoredThemeAndNotify,
  THEME_STORAGE_KEY,
} from '../src/theme'

beforeEach(() => localStorage.clear())
afterEach(() => {
  localStorage.clear()
  document.documentElement.removeAttribute('theme-mode')
})

describe('theme', () => {
  it('normalizeTheme 归一 light/dark', () => {
    expect(normalizeTheme('light')).toBe('light')
    expect(normalizeTheme('night')).toBe('dark')
    expect(normalizeTheme('DARK')).toBe('dark')
    expect(normalizeTheme('blue')).toBeNull()
    expect(normalizeTheme(null)).toBeNull()
  })

  it('localStorage 读写与 applyDocumentTheme', () => {
    expect(setStoredTheme('dark')).toBe('dark')
    expect(getStoredTheme()).toBe('dark')
    expect(setStoredTheme('invalid')).toBeNull()
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark')

    applyDocumentTheme('dark')
    expect(document.documentElement.getAttribute('theme-mode')).toBe('dark')
  })

  it('onThemeChange 监听同页与跨页事件', () => {
    const listener = vi.fn()
    const off = onThemeChange(listener)
    setStoredThemeAndNotify('dark')
    expect(listener).toHaveBeenCalledWith('dark')
    window.dispatchEvent(
      new StorageEvent('storage', { key: THEME_STORAGE_KEY, newValue: 'light', storageArea: localStorage }),
    )
    expect(listener).toHaveBeenCalledWith('light')
    off()
  })
})

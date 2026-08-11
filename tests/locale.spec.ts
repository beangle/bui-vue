import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  getStoredLocale,
  LOCALE_STORAGE_KEY,
  normalizeLocale,
  onLocaleChange,
  setStoredLocale,
  setStoredLocaleAndNotify,
} from '../src/locale'

beforeEach(() => localStorage.clear())
afterEach(() => localStorage.clear())

describe('locale', () => {
  it('normalizeLocale 兼容中英文标签', () => {
    expect(normalizeLocale('en-US')).toBe('en-US')
    expect(normalizeLocale('en_us')).toBe('en-US')
    expect(normalizeLocale('zh-CN')).toBe('zh-CN')
    expect(normalizeLocale('zh_hans')).toBe('zh-CN')
    expect(normalizeLocale('')).toBeNull()
    expect(normalizeLocale(null)).toBeNull()
    expect(normalizeLocale('fr')).toBeNull()
  })

  it('localStorage 读写与无效值忽略', () => {
    expect(setStoredLocale('en-US')).toBe('en-US')
    expect(getStoredLocale()).toBe('en-US')
    expect(setStoredLocale('invalid')).toBeNull()
    expect(localStorage.getItem(LOCALE_STORAGE_KEY)).toBe('en-US')
  })

  it('onLocaleChange 监听同页事件与跨页 storage 事件', () => {
    const listener = vi.fn()
    const off = onLocaleChange(listener)
    setStoredLocaleAndNotify('en-US')
    expect(listener).toHaveBeenCalledWith('en-US')

    window.dispatchEvent(
      new StorageEvent('storage', { key: LOCALE_STORAGE_KEY, newValue: 'zh-CN', storageArea: localStorage }),
    )
    expect(listener).toHaveBeenCalledWith('zh-CN')
    off()
  })

  it('setStoredLocaleAndNotify 值未变化时不重复通知', () => {
    setStoredLocale('zh-CN')
    const listener = vi.fn()
    const off = onLocaleChange(listener)
    setStoredLocaleAndNotify('zh-CN')
    expect(listener).not.toHaveBeenCalled()
    off()
  })
})

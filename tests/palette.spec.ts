import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  applyPaletteVars,
  getStoredPalette,
  normalizePalette,
  PALETTE_STORAGE_KEY,
} from '../src/palette'

beforeEach(() => localStorage.clear())
afterEach(() => {
  localStorage.clear()
  document.documentElement.style.cssText = ''
})

describe('palette', () => {
  it('normalizePalette 缺失字段回退空串，非法输入返回空色板', () => {
    expect(normalizePalette({ primaryColor: '#123456', navbarBgColor: 42 })).toEqual({
      primaryColor: '#123456',
      navbarBgColor: '',
      searchBgColor: '',
      gridbarBgColor: '',
      gridHeaderBgColor: '',
      gridBorderColor: '',
    })
    expect(normalizePalette(null)).toEqual({
      primaryColor: '',
      navbarBgColor: '',
      searchBgColor: '',
      gridbarBgColor: '',
      gridBorderColor: '',
    })
  })

  it('getStoredPalette 从 localStorage 读取，损坏 JSON 返回空色板', () => {
    localStorage.setItem(PALETTE_STORAGE_KEY, JSON.stringify({ primaryColor: '#fff' }))
    expect(getStoredPalette().primaryColor).toBe('#fff')
    localStorage.setItem(PALETTE_STORAGE_KEY, '{broken')
    expect(getStoredPalette().primaryColor).toBe('')
  })

  it('applyPaletteVars 写入 CSS 变量与 TDesign brand 色板', () => {
    const root = document.createElement('div')
    applyPaletteVars({ primaryColor: '#ff0000', navbarBgColor: '#111', gridBorderColor: '#eee' }, root)
    expect(root.style.getPropertyValue('--primary-color')).toBe('#ff0000')
    expect(root.style.getPropertyValue('--bui-navbar-bg')).toBe('#111')
    expect(root.style.getPropertyValue('--td-brand-color')).toBe('#ff0000')
    expect(root.style.getPropertyValue('--bui-grid-border-color')).toBe('#eee')
  })
})

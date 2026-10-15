import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const css = readFileSync(resolve(process.cwd(), 'src/styles/drawer-form.css'), 'utf-8')
const pkg = JSON.parse(readFileSync(resolve(process.cwd(), 'package.json'), 'utf-8')) as {
  exports: Record<string, string>
}

describe('drawer-form 紧凑抽屉表单', () => {
  it('对外暴露样式入口，宿主才能 import', () => {
    expect(pkg.exports['./styles/drawer-form.css']).toBe('./src/styles/drawer-form.css')
  })

  it('两列栅格 + 宽控件跨行 + 单列降级', () => {
    expect(css).toContain('grid-template-columns: repeat(2, minmax(0, 1fr))')
    expect(css).toContain('grid-column: 1 / -1')
    expect(css).toContain('grid-template-columns: 1fr')
  })

  it('用更高的特异性压掉 TDesign 的表单项下边距，保住 12px 行距', () => {
    // .t-form__item-with-extra 也是 (0,2,0) 且排在产物后面，必须多一层 .drawer-form
    expect(css).toContain('.drawer-form .drawer-form-grid > .t-form__item {')
    expect(css).toMatch(/\.drawer-form \.drawer-form-grid > \.t-form__item \{[^}]*margin-bottom: 0/)
  })

  it('校验提示/字段说明回到文档流，避免绝对定位压住下一行', () => {
    expect(css).toMatch(/\.t-form__controls > \.t-input__extra \{[^}]*position: static/)
    expect(css).toContain('.t-form__controls > .t-input__help')
  })

  it('动作条抵消 TDesign 页脚按钮的 margin-left，统一走 gap', () => {
    expect(css).toMatch(/\.drawer-actions \.t-button \+ \.t-button \{[^}]*margin-left: 0/)
  })
})

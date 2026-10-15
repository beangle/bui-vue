import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import TDesign from 'tdesign-vue-next'
import DataGrid from '../src/components/DataGrid.vue'

describe('DataGrid', () => {
  it('渲染列与数据行', () => {
    const wrapper = mount(DataGrid, {
      props: {
        rowKey: 'id',
        data: [{ id: 1, name: '测试课程' }],
        columns: [{ colKey: 'name', title: '课程名称' }],
      },
      global: { plugins: [TDesign] },
    })
    expect(wrapper.find('.data-grid').exists()).toBe(true)
    expect(wrapper.text()).toContain('课程名称')
    expect(wrapper.text()).toContain('测试课程')
  })

  it('tree 配置透传给 t-table，按 childrenKey 渲染子树', async () => {
    const wrapper = mount(DataGrid, {
      props: {
        rowKey: 'id',
        tree: { childrenKey: 'children', defaultExpandAll: true },
        data: [
          { id: 1, name: '父菜单', children: [{ id: 2, name: '子菜单' }] },
        ],
        columns: [{ colKey: 'name', title: '菜单名称' }],
      },
      global: { plugins: [TDesign] },
    })
    await nextTick()
    await nextTick()
    expect(wrapper.text()).toContain('父菜单')
    expect(wrapper.text()).toContain('子菜单')
  })

  it('可选中表格按声明的百分比列宽渲染，不做 calc 换算', async () => {
    // Chrome 的 table-layout: fixed 只认 %/px，calc() 列宽会被忽略并退化成各列平分，
    // 因此 DataGrid 必须把百分比原样交给 t-table（回归：曾把列宽换算成 calc 导致列宽失效）。
    const wrapper = mount(DataGrid, {
      props: {
        rowKey: 'id',
        selectable: true,
        data: [{ id: 1, name: 'web33', ip: '10.0.0.1' }],
        columns: [
          { colKey: 'name', title: '名称', width: '10%' },
          { colKey: 'ip', title: 'IP地址', width: '13%' },
        ],
      },
      global: { plugins: [TDesign] },
    })
    await nextTick()
    const widths = wrapper.findAll('col').map((col) => {
      const match = (col.attributes('style') || '').match(/width:\s*([^;]+)/)
      return match ? match[1].trim() : ''
    })
    expect(widths).toContain('10%')
    expect(widths).toContain('13%')
    expect(widths.some((width) => width.includes('calc('))).toBe(false)
  })
})

describe('data-grid 主题色板', () => {
  const css = readFileSync(resolve(process.cwd(), 'src/styles/data-grid.css'), 'utf-8')

  it('自带经典 BUI 色板缺省值，不再依赖宿主声明', () => {
    for (const name of ['--bui-gridbar-bg', '--bui-grid-header-bg', '--bui-grid-row-hover-bg', '--bui-grid-row-selected-bg']) {
      expect(css).toContain(`${name}:`)
    }
  })

  it('深色模式覆盖表格色板，避免浅色缺省值泄漏到深色主题', () => {
    const dark = css.slice(css.indexOf(':is(html[theme-mode="dark"])'))
    expect(dark).toContain('--bui-grid-row-hover-bg:')
    expect(dark).toContain('--bui-grid-row-selected-bg:')
    expect(dark).toContain('--bui-grid-header-bg:')
  })
})

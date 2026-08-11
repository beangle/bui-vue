import { describe, expect, it } from 'vitest'
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
})

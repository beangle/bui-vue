import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import UnderlineTabs from '../src/components/UnderlineTabs.vue'

const tabs = [
  { value: 'a', label: '标签A' },
  { value: 'b', label: '标签B', disabled: true },
]

describe('UnderlineTabs', () => {
  it('渲染标签、高亮选中项并禁用标记', () => {
    const wrapper = mount(UnderlineTabs, { props: { tabs, modelValue: 'a' } })
    const buttons = wrapper.findAll('button')
    expect(buttons).toHaveLength(2)
    expect(buttons[0].text()).toBe('标签A')
    expect(buttons[0].classes()).toContain('active')
    expect(buttons[0].attributes('aria-selected')).toBe('true')
    expect(buttons[1].attributes('disabled')).toBeDefined()
  })

  it('点击可选项触发 update:modelValue 与 change，禁用项不触发', async () => {
    const wrapper = mount(UnderlineTabs, { props: { tabs, modelValue: 'a' } })
    const buttons = wrapper.findAll('button')

    await buttons[1].trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()

    await buttons[0].trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['a'])
    expect(wrapper.emitted('change')?.[0]).toEqual(['a'])
  })
})

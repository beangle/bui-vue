import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import SideNav from '../src/components/SideNav.vue'
import type { SideNavItem } from '../src/components/side-nav'

const items: SideNavItem[] = [
  { path: '/home', title: '概览' },
  {
    path: '',
    title: '平台配置',
    children: [
      { path: '/profiles', title: '项目配置' },
      { path: '/farms', title: '群集管理' },
    ],
  },
  {
    path: '',
    title: '应用与菜单',
    children: [{ path: '/menus', title: '菜单管理' }],
  },
]

function groupByTitle(wrapper: ReturnType<typeof mount>, title: string) {
  return wrapper.findAll('.bui-side-nav__item').find((item) => item.find('.bui-side-nav__label').text() === title)!
}

describe('SideNav', () => {
  it('高亮当前叶子，给所在分组画激活条并只手风琴展开该分组', () => {
    const wrapper = mount(SideNav, { props: { items, activePath: '/farms' } })
    const active = wrapper.findAll('.bui-side-nav__link').find((link) => link.text() === '群集管理')!
    expect(active.classes()).toContain('is-active')

    const activeGroup = groupByTitle(wrapper, '平台配置')
    expect(activeGroup.classes()).toContain('has-active')
    expect(activeGroup.classes()).toContain('is-open')
    expect(groupByTitle(wrapper, '应用与菜单').classes()).not.toContain('is-open')
  })

  it('点击分组只展开/收起、不发导航事件；点击叶子发 navigate', async () => {
    const wrapper = mount(SideNav, { props: { items, activePath: '/home' } })
    await groupByTitle(wrapper, '应用与菜单').find('.bui-side-nav__link--group').trigger('click')
    expect(groupByTitle(wrapper, '应用与菜单').classes()).toContain('is-open')
    expect(wrapper.emitted('navigate')).toBeUndefined()

    await groupByTitle(wrapper, '应用与菜单').findAll('.bui-side-nav__link')[1].trigger('click')
    expect(wrapper.emitted('navigate')?.[0]).toEqual(['/menus'])
  })

  it('accordion=false 时各分组独立展开', async () => {
    const wrapper = mount(SideNav, { props: { items, activePath: '/home', accordion: false } })
    await groupByTitle(wrapper, '平台配置').find('.bui-side-nav__link--group').trigger('click')
    await groupByTitle(wrapper, '应用与菜单').find('.bui-side-nav__link--group').trigger('click')
    expect(groupByTitle(wrapper, '平台配置').classes()).toContain('is-open')
    expect(groupByTitle(wrapper, '应用与菜单').classes()).toContain('is-open')
  })

  it('收起态隐藏文字与分组子项', () => {
    const wrapper = mount(SideNav, { props: { items, activePath: '/farms', collapsed: true } })
    expect(wrapper.find('.bui-side-nav').classes()).toContain('is-collapsed')
    expect(wrapper.find('.bui-side-nav__tree').element.style.display).toBe('none')
  })
})

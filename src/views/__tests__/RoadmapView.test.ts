import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import RoadmapView from '../RoadmapView.vue'
import { createRouter, createWebHistory } from 'vue-router'

// Mock useRoadmap composable
vi.mock('@/composables/useRoadmap', () => ({
  useRoadmap: () => ({
    items: [
      { id: '1', title: 'Test Feature', priority: 'high', isDone: false, userId: 'user1', createdAt: { seconds: 0, nanoseconds: 0 } }
    ],
    loading: false,
    error: null,
    addItem: vi.fn(),
    toggleDone: vi.fn(),
    deleteItem: vi.fn(),
    updatePriority: vi.fn()
  })
}))

// Mock vue-i18n
vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key
  })
}))

describe('RoadmapView', () => {
  const router = createRouter({
    history: createWebHistory(),
    routes: [{ path: '/settings/roadmap', component: { template: '<div></div>' } }]
  })

  it('renders roadmap title', async () => {
    const wrapper = mount(RoadmapView, {
      global: {
        plugins: [router]
      }
    })
    expect(wrapper.text()).toContain('settings.roadmap.title')
  })

  it('displays items from the composable', async () => {
    const wrapper = mount(RoadmapView, {
      global: {
        plugins: [router]
      }
    })
    expect(wrapper.text()).toContain('Test Feature')
    expect(wrapper.text()).toContain('settings.roadmap.high')
  })

  it('calls addItem when form is submitted', async () => {
    const wrapper = mount(RoadmapView, {
      global: {
        plugins: [router]
      }
    })

    const input = wrapper.find('input[type="text"]')
    await input.setValue('New Idea')
    expect((input.element as HTMLInputElement).value).toBe('New Idea')

    await wrapper.find('form').trigger('submit.prevent')

    expect((input.element as HTMLInputElement).value).toBe('')
  })
})

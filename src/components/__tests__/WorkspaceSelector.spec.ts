import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import WorkspaceSelector from '../WorkspaceSelector.vue'
import { ref } from 'vue'

// Mock useWorkspaces
vi.mock('@/composables/useWorkspaces', () => ({
  useWorkspaces: () => ({
    workspaces: ref([
      { id: '1', name: 'Workspace 1', userId: 'user1', createdAt: { seconds: 0, nanoseconds: 0 } },
      { id: '2', name: 'Workspace 2', userId: 'user1', createdAt: { seconds: 0, nanoseconds: 0 } }
    ]),
    currentWorkspace: ref({ id: '1', name: 'Workspace 1', userId: 'user1', createdAt: { seconds: 0, nanoseconds: 0 } }),
    setCurrentWorkspace: vi.fn(),
    createWorkspace: vi.fn(),
    updateWorkspace: vi.fn(),
    deleteWorkspace: vi.fn(),
    loading: ref(false)
  })
}))

// Mock Firestore count logic (since it's inside WorkspaceSelector)
vi.mock('firebase/firestore', () => ({
  getDocs: vi.fn(),
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn()
}))

describe('WorkspaceSelector', () => {
  it('renders current workspace name', () => {
    const wrapper = mount(WorkspaceSelector)
    expect(wrapper.text()).toContain('Workspace 1')
  })

  it('toggles dropdown on click', async () => {
    const wrapper = mount(WorkspaceSelector)
    const button = wrapper.find('button')
    await button.trigger('click')
    expect(wrapper.find('.absolute').exists()).toBe(true)
  })

  it('lists all workspaces in dropdown', async () => {
    const wrapper = mount(WorkspaceSelector)
    await wrapper.find('button').trigger('click')
    const items = wrapper.findAll('.flex-1.text-left')
    expect(items.length).toBe(2)
    expect(items[0]!.text()).toBe('Workspace 1')
    expect(items[1]!.text()).toBe('Workspace 2')
  })

  it('opens meatball menu on click', async () => {
    const wrapper = mount(WorkspaceSelector)
    await wrapper.find('button').trigger('click') // Open dropdown

    // Find the meatball button using its icon path
    const meatballButton = wrapper.findAll('.relative button').find(b => b.html().includes('M12 5v.01'))
    expect(meatballButton?.exists()).toBe(true)
    await meatballButton?.trigger('click')

    expect(wrapper.text()).toContain('Rename')
    expect(wrapper.text()).toContain('Delete')
  })
})

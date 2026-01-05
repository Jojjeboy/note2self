import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import SettingsView from '../SettingsView.vue'

// Mock composables
vi.mock('@/composables/useTheme', () => ({
    useTheme: () => ({
        isDark: { value: false },
        toggleTheme: vi.fn()
    })
}))

vi.mock('@/composables/useAuth', () => ({
    useAuth: () => ({
        logout: vi.fn()
    })
}))

vi.mock('@/composables/useWorkspaces', () => ({
    useWorkspaces: () => ({
        currentWorkspace: ref({
            id: '123',
            name: 'Test Workspace',
            userId: 'user1',
            createdAt: { seconds: 0, nanoseconds: 0 }
        })
    })
}))

vi.mock('vue-router', () => ({
    useRouter: () => ({
        push: vi.fn()
    })
}))

vi.mock('vue-i18n', () => ({
    useI18n: () => ({
        t: (key: string) => key,
        locale: { value: 'en' }
    }),
}))

describe('SettingsView', () => {
    it('renders settings sections', () => {
        const wrapper = mount(SettingsView)
        expect(wrapper.text()).toContain('settings.title')
        expect(wrapper.text()).toContain('common.language')
        expect(wrapper.text()).toContain('common.theme')
        expect(wrapper.text()).toContain('settings.account')
        expect(wrapper.text()).toContain('Data') // Export section
    })

    it('has an export button', () => {
        const wrapper = mount(SettingsView)
        const exportBtn = wrapper.findComponent({ name: 'ExportButton' })
        expect(exportBtn.exists()).toBe(true)
    })
})

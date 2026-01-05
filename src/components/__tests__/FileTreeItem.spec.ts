import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import type { Timestamp } from 'firebase/firestore'
import FileTreeItem from '../FileTreeItem.vue'
import type { NoteItem } from '@/composables/useNotes'

// Mock useI18n
vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}))

describe('FileTreeItem', () => {
    const mockItem: NoteItem = {
        id: '1',
        title: 'Test Note',
        content: '',
        type: 'note',
        parentId: null,
        createdAt: { seconds: 0, nanoseconds: 0, toDate: () => new Date(), valueOf: () => '0' } as unknown as Timestamp,
        workspaceId: 'ws1',
        userId: 'user1'
    }

    it('renders note title properly', () => {
        const wrapper = mount(FileTreeItem, {
            props: {
                item: mockItem,
                depth: 0,
                isExpanded: false
            }
        })
        expect(wrapper.text()).toContain('Test Note')
    })

    it('emits select event when clicked', async () => {
        const wrapper = mount(FileTreeItem, {
            props: {
                item: mockItem,
                depth: 0,
                isExpanded: false
            }
        })

        await wrapper.find('.cursor-pointer').trigger('click')
        expect(wrapper.emitted('select')?.[0]).toEqual([mockItem])
    })
})

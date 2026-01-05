<script setup lang="ts">
import { ref } from 'vue'
import InputModal from '@/components/InputModal.vue'
import type { NoteItem } from '@/composables/useNotes'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps<{
  item: NoteItem
  depth: number
  isExpanded: boolean
}>()

const emit = defineEmits<{
  (e: 'select', item: NoteItem): void
  (e: 'toggle', item: NoteItem): void
  (e: 'create-folder', id: string): void
  (e: 'create-note', id: string): void
  (e: 'rename', item: NoteItem, newName: string): void
  (e: 'delete', item: NoteItem): void
}>()

const isMenuOpen = ref(false)
const isRenameModalOpen = ref(false)

// Close menu when clicking outside
// const closeMenu = () => {
//   isMenuOpen.value = false
// }

// Simple click-outside directive logic or just use a blurry backing
// For simplicity in this file, we can use a fixed transparent overlay when menu is open
// or just rely on a simple blur handler if focusing.

const toggleMenu = (e: Event) => {
  e.stopPropagation()
  isMenuOpen.value = !isMenuOpen.value
}

const handleRenameSubmit = (newName: string) => {
  emit('rename', props.item, newName)
  isRenameModalOpen.value = false
  isMenuOpen.value = false
}

const openRename = () => {
    isRenameModalOpen.value = true
    isMenuOpen.value = false
}

const handleAction = (action: 'create-folder' | 'create-note' | 'delete') => {
  if (action === 'delete') emit('delete', props.item)
  if (action === 'create-folder') emit('create-folder', props.item.id)
  if (action === 'create-note') emit('create-note', props.item.id)
  isMenuOpen.value = false
}

</script>

<template>
  <div class="relative group">
    <div
      @click="emit('select', item)"
      class="flex items-center justify-between gap-2 px-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg cursor-pointer transition-colors"
      :style="{ paddingLeft: `${depth * 20 + 12}px` }"
    >
      <div class="flex items-center gap-2 overflow-hidden flex-1 min-w-0">
         <!-- Folder Icon (clickable to toggle) -->
         <div v-if="item.type === 'folder'" @click.stop="emit('toggle', item)" class="p-1 -ml-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded cursor-pointer">
            <svg class="w-4 h-4 text-yellow-500 transition-transform duration-200" :class="{ 'transform rotate-90': isExpanded }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
         </div>
        <!-- Note Icon -->
        <span v-else class="text-gray-400 flex-shrink-0">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
        </span>

        <span class="text-sm truncate select-none text-gray-700 dark:text-gray-200">{{ item.title }}</span>
      </div>

      <!-- Meatball Menu Button -->
      <button
        @click="toggleMenu"
        class="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none transition-colors"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
        </svg>
      </button>

      <!-- Dropdown Menu -->
      <div v-if="isMenuOpen" class="absolute right-0 top-8 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 border border-gray-200 dark:border-gray-700 z-20">
        <!-- Overlay to close on click outside -->
        <div class="fixed inset-0 z-10" @click.stop="isMenuOpen = false"></div>

        <div class="relative z-20">
            <div v-if="item.type === 'folder'" class="border-b border-gray-100 dark:border-gray-700 mb-1 pb-1">
                <button @click.stop="handleAction('create-note')" class="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                    New Note
                </button>
                <button @click.stop="handleAction('create-folder')" class="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                    New Folder
                </button>
            </div>

            <button @click.stop="openRename" class="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                Rename
            </button>
            <button @click.stop="handleAction('delete')" class="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
                Delete
            </button>
        </div>
      </div>
    </div>

    <!-- Rename Modal -->
    <InputModal
      :isOpen="isRenameModalOpen"
      :title="t('file_tree.rename_item')"
      :defaultValue="item.title"
      :submitText="t('common.rename')"
      @close="isRenameModalOpen = false"
      @submit="handleRenameSubmit"
    />
  </div>
</template>

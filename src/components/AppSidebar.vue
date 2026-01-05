<script setup lang="ts">
import { ref, computed } from 'vue'
import { useWorkspaces } from '@/composables/useWorkspaces'
import { useNotes, type NoteItem } from '@/composables/useNotes'
import { useAuth } from '@/composables/useAuth'
import { useRouter } from 'vue-router'
import WorkspaceSelector from '@/components/WorkspaceSelector.vue'
import FileTree from '@/components/FileTree.vue'
import ExportButton from '@/components/ExportButton.vue'
import InputModal from '@/components/InputModal.vue'
import { useTheme } from '@/composables/useTheme'

const emit = defineEmits<{
  (e: 'close'): void
}>()

const { user, logout } = useAuth()
const { currentWorkspace } = useWorkspaces()
const router = useRouter()
const { isDark, toggleTheme } = useTheme()

// Fetch notes for the current workspace
const { items, createItem } = useNotes(computed(() => currentWorkspace.value?.id))

// Modal state
const isCreateModalOpen = ref(false)
const modalTitle = ref('')
const modalPlaceholder = ref('')
const pendingAction = ref<{ type: 'folder' | 'note', parentId: string | null } | null>(null)

const handleSelect = (item: NoteItem) => {
  if (item.type === 'note') {
    router.push({
        name: 'workspace',
        params: { id: currentWorkspace.value?.id },
        query: { noteId: item.id }
    })
  } else if (item.type === 'folder') {
      router.push({
          name: 'workspace',
          params: { id: currentWorkspace.value?.id },
          query: { folderId: item.id }
      })
  }
  emit('close')
}

const handleCreateFolder = (parentId: string | null) => {
  pendingAction.value = { type: 'folder', parentId }
  modalTitle.value = 'Create Folder'
  modalPlaceholder.value = 'Folder name...'
  isCreateModalOpen.value = true
}

const handleCreateNote = (parentId: string | null) => {
  pendingAction.value = { type: 'note', parentId }
  modalTitle.value = 'Create Note'
  modalPlaceholder.value = 'Note title...'
  isCreateModalOpen.value = true
}

const handleModalSubmit = async (name: string) => {
  if (pendingAction.value) {
    const { type, parentId } = pendingAction.value
    await createItem(name, type, parentId, type === 'note' ? '# ' + name : undefined)
  }
  isCreateModalOpen.value = false
  pendingAction.value = null
}

const handleLogout = async () => {
  await logout()
  router.push('/login')
}
</script>

<template>
  <aside
    class="w-64 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex flex-col h-full transition-colors duration-300 transform md:translate-x-0 z-30"
  >
    <!-- Header / Workspace Selector -->
    <div class="p-2 border-b border-gray-200 dark:border-gray-700">
      <div class="mb-2 px-2 flex items-center justify-between">
         <h1
            @click="router.push('/')"
            class="font-bold text-lg tracking-tight cursor-pointer hover:text-blue-600 transition-colors"
         >
            Note <span class="text-blue-600">2</span> Self
         </h1>
         <!-- Mobile Close Button (Visible only on mobile sidebar) -->
         <button @click="$emit('close')" class="md:hidden text-gray-500">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
         </button>
      </div>
      <WorkspaceSelector />
    </div>

    <!-- File Tree -->
    <div class="flex-1 overflow-y-auto py-2">
      <div v-if="currentWorkspace" class="px-3">
        <div class="flex items-center justify-between mb-2 px-2">
           <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Storage</span>
           <div class="flex gap-1">
             <button @click="handleCreateFolder(null)" class="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-500" title="New Folder">
               <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"></path></svg>
             </button>
             <button @click="handleCreateNote(null)" class="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-500" title="New Note">
               <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
             </button>
           </div>
        </div>

        <!-- Pass move handler? FileTree needs update to support actions? For now, simplistic. -->
        <FileTree
          :items="items"
          :parentId="null"
          @select="handleSelect"
          @create-folder="handleCreateFolder"
          @create-note="handleCreateNote"
        />

        <!-- Temp: Move Modal Trigger (Hidden for now until Context Menu is implemented) -->
        <!-- Just an 'Export' button at the bottom -->
      </div>
      <div v-else class="text-center text-sm text-gray-500 mt-10 px-4">
        Select or create a workspace.
      </div>
    </div>

    <!-- Footer -->
     <div class="p-4 border-t border-gray-200 dark:border-gray-700 space-y-3">

        <div v-if="currentWorkspace" class="flex justify-between items-center px-1">
            <ExportButton
                :workspaceId="currentWorkspace.id"
                :workspaceName="currentWorkspace.name"
            />

            <button
                @click="toggleTheme"
                class="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                :title="isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
            >
                <!-- Sun -->
                <svg v-if="isDark" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                <!-- Moon -->
                <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
            </button>
        </div>

        <div v-if="user" class="flex items-center gap-3 pt-2 border-t border-gray-200 dark:border-gray-800">
           <img
            v-if="user.photoURL"
            :src="user.photoURL"
            alt="User avatar"
            class="w-8 h-8 rounded-full"
          >
          <div class="overflow-hidden flex-1">
             <p class="text-sm font-medium truncate">{{ user.displayName }}</p>
             <button @click="handleLogout" class="text-xs text-red-500 hover:text-red-700">Sign Out</button>
          </div>
        </div>
      </div>
  </aside>

   <InputModal
     :isOpen="isCreateModalOpen"
     :title="modalTitle"
     :placeholder="modalPlaceholder"
     @close="isCreateModalOpen = false"
     @submit="handleModalSubmit"
   />
</template>

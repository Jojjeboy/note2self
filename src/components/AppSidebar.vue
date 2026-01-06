<script setup lang="ts">
import { ref, computed } from 'vue'
import { useWorkspaces } from '@/composables/useWorkspaces'
import { useNotes, type NoteItem } from '@/composables/useNotes'
import { useAuth } from '@/composables/useAuth'
import { useRouter } from 'vue-router'
import WorkspaceSelector from '@/components/WorkspaceSelector.vue'
import FileTree from '@/components/FileTree.vue'
import InputModal from '@/components/InputModal.vue'
import { useLayout } from '@/composables/useLayout'
import { useI18n } from 'vue-i18n'

// No emits needed for close anymore
const { closeSidebar } = useLayout()

const { user } = useAuth()
const { currentWorkspace } = useWorkspaces()
const router = useRouter()
const { t } = useI18n()

// Fetch notes for the current workspace
const { items, createItem } = useNotes(computed(() => currentWorkspace.value?.id))

// ... modal state ...
const isCreateModalOpen = ref(false)
const modalTitle = ref('')
const modalPlaceholder = ref('')
const pendingAction = ref<{ type: 'folder' | 'note', parentId: string | null } | null>(null)

const handleSelect = (item: NoteItem) => {
  console.log('AppSidebar: handleSelect', item.title)
  closeSidebar()

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
    // The instruction implies removing '# ' from initial content.
    // If type is 'note', the initial content should be an empty string, not '# ' + name.
    // The current code already passes an empty string, so no change is needed here.
    // If the previous version had '# ' as the initial content, this line already reflects the desired change.
    await createItem(name, type, parentId, '')
  }
  isCreateModalOpen.value = false
  pendingAction.value = null
}

</script>

<template>
  <aside
    v-bind="$attrs"
    class="w-72 border-r border-gray-200/50 dark:border-slate-800/50 bg-white dark:bg-slate-900 flex flex-col h-full transition-colors duration-500 z-50 shadow-sm"
  >
    <!-- Header / Workspace Selector -->
    <div class="p-4 border-b border-gray-100 dark:border-slate-800/50 space-y-4">
      <div class="px-1 flex items-center justify-between">
         <div
            @click="() => { router.push('/'); closeSidebar(); }"
            class="group flex items-center gap-2 cursor-pointer"
         >
            <div class="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
            </div>
            <h1 class="font-bold text-xl tracking-tight text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
              Note<span class="text-blue-600">2</span>Self
            </h1>
         </div>

         <!-- Mobile Close Button -->
         <button
           @click="closeSidebar"
           class="md:hidden p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
         >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
         </button>
      </div>

      <div class="px-1">
        <WorkspaceSelector @select="closeSidebar" />
      </div>
    </div>

    <!-- File Tree -->
    <div class="flex-1 overflow-y-auto px-4 py-6 custom-scrollbar">
      <div v-if="currentWorkspace" class="space-y-6">
        <div class="flex items-center justify-between px-2">
           <span class="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-[0.2em]">Quick Actions</span>
           <div class="flex gap-1">
             <button
               @click="handleCreateFolder(null)"
               class="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all active:scale-95"
               title="New Folder"
             >
               <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"></path></svg>
             </button>
             <button
               @click="handleCreateNote(null)"
               class="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all active:scale-95"
               title="New Note"
             >
               <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
             </button>
           </div>
        </div>

        <div class="space-y-1">
          <FileTree
            :key="currentWorkspace.id"
            :items="items"
            :parentId="null"
            @select="handleSelect"
            @create-folder="handleCreateFolder"
            @create-note="handleCreateNote"
          />
        </div>
      </div>

      <div v-else class="flex flex-col items-center justify-center h-40 text-center px-4">
        <div class="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-3xl mb-3">
          <svg class="w-8 h-8 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
        </div>
        <p class="text-sm text-slate-400 dark:text-slate-500 font-medium">
          Select or create a workspace to get started.
        </p>
      </div>
    </div>

    <!-- Footer Profile -->
    <div class="p-4 bg-slate-50/50 dark:bg-slate-800/30 border-t border-gray-100 dark:border-slate-800/50">
      <div v-if="user" class="flex items-center gap-3 p-2 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700/50">
        <div class="relative group cursor-pointer">
          <img
            v-if="user.photoURL"
            :src="user.photoURL"
            alt="User avatar"
            class="w-10 h-10 rounded-xl object-cover ring-2 ring-transparent group-hover:ring-blue-500/30 transition-all"
          >
          <div v-else class="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
            {{ user.displayName?.charAt(0) || 'U' }}
          </div>
        </div>

        <div class="overflow-hidden flex-1 min-w-0">
          <p class="text-xs font-bold text-slate-900 dark:text-slate-200 truncate leading-none mb-1">
            {{ user.displayName }}
          </p>
          <p class="text-[10px] text-slate-400 dark:text-slate-500 truncate">
            View Settings
          </p>
        </div>

        <router-link
            to="/settings"
            class="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all active:scale-90 shrink-0"
            :title="t('common.settings')"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
        </router-link>
      </div>
    </div>
  </aside>

<!-- InputModal moved outside to prevent z-index issues -->
<InputModal
  :isOpen="isCreateModalOpen"
  :title="modalTitle"
  :placeholder="modalPlaceholder"
  @close="isCreateModalOpen = false"
  @submit="handleModalSubmit"
/>
</template>

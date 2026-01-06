<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useNotes, type NoteItem } from '@/composables/useNotes'
import NavBreadcrumbs from '@/components/NavBreadcrumbs.vue'
import NoteEditor from '@/components/NoteEditor.vue'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/firebase/config'

const props = defineProps<{
  id: string
}>()

const router = useRouter()
const route = useRoute()
const { items, loading, createItem } = useNotes(computed(() => props.id))

const selectedNoteId = computed(() => route.query.noteId as string | undefined)
const selectedFolderId = computed(() => route.query.folderId as string | undefined)

// Combined selection for Breadcrumbs context
const currentSelectionId = computed(() => selectedNoteId.value || selectedFolderId.value || null)

const selectedNote = ref<NoteItem | null>(null)

// Watch note selection
watch(selectedNoteId, async (newId) => {
  if (newId) {
    const note = items.value.find(i => i.id === newId)
    if (note) {
      selectedNote.value = note
    } else {
        // Fallback fetch
        try {
            const snap = await getDoc(doc(db, 'items', newId))
            if (snap.exists()) {
                selectedNote.value = { id: snap.id, ...snap.data() } as NoteItem
            }
        } catch (e) {
            console.error(e)
        }
    }
  } else {
    selectedNote.value = null
  }
}, { immediate: true })

// Compute path for Editor (File name based)
const getPath = (item: NoteItem): string => {
   if (!item.parentId) return ''
   const parent = items.value.find(i => i.id === item.parentId)
   return parent ? `${getPath(parent)}${parent.title} / ` : ''
}

const notePath = computed(() => {
    if (!selectedNote.value) return ''
    const path = getPath(selectedNote.value)
    return `${path}` // Just the folders
})

// Folder View Logic
const folderItems = computed(() => {
    if (!selectedFolderId.value) return []
    return items.value.filter(i => i.parentId === selectedFolderId.value)
        .sort((a, b) => {
            if (a.type === b.type) return a.title.localeCompare(b.title)
            return a.type === 'folder' ? -1 : 1
        })
})

const dashboardItems = computed(() => {
    // Show root items if no folder/note selected
    if (selectedFolderId.value || selectedNoteId.value) return []
    return items.value.filter(i => !i.parentId) // Root items
        .sort((a, b) => {
            if (a.type === b.type) return a.title.localeCompare(b.title)
            return a.type === 'folder' ? -1 : 1
        })
})

const currentFolder = computed(() => {
    return items.value.find(i => i.id === selectedFolderId.value)
})

const handleBreadcrumbNavigate = (id: string | null) => {
    if (!id) {
        // Root
        router.push({ name: 'workspace', params: { id: props.id } })
        return
    }
    const item = items.value.find(i => i.id === id)
    if (item) {
        if (item.type === 'folder') {
            router.push({ name: 'workspace', params: { id: props.id }, query: { folderId: item.id } })
        } else {
            router.push({ name: 'workspace', params: { id: props.id }, query: { noteId: item.id } })
        }
    }
}

const isInputModalOpen = ref(false)
const inputModalTitle = ref('')
const inputModalPlaceholder = ref('')
const inputModalType = ref<'folder' | 'note'>('note')

const alertModalOpen = ref(false)
const alertModalTitle = ref('')
const alertModalMessage = ref('')

const createInFolder = (type: 'folder' | 'note') => {
    inputModalType.value = type
    inputModalTitle.value = type === 'folder' ? 'Create Folder' : 'Create Note'
    inputModalPlaceholder.value = type === 'folder' ? 'Folder Name...' : 'Note Title...'
    isInputModalOpen.value = true
}

const handleInputSubmit = async (name: string) => {
    const parentId = selectedFolderId.value
    try {
        await createItem(name, inputModalType.value, parentId, '')
        isInputModalOpen.value = false
    } catch (e) {
        console.error(e)
        alertModalTitle.value = 'Error'
        alertModalMessage.value = 'Failed to create item'
        alertModalOpen.value = true
    }
}


const navigateToItem = (item: NoteItem) => {
    if (item.type === 'folder') {
        router.push({ query: { folderId: item.id } })
    } else {
        router.push({ query: { noteId: item.id } })
    }
}

// Move Modal Logic
import MoveModal from '@/components/MoveModal.vue'
import InputModal from '@/components/InputModal.vue'
import AlertModal from '@/components/AlertModal.vue'
import { useWorkspaces } from '@/composables/useWorkspaces'
const { currentWorkspace } = useWorkspaces()

const itemToMove = ref<NoteItem | null>(null)
const isMoveModalOpen = ref(false)

const openMoveModal = (item: NoteItem) => {
    itemToMove.value = item
    isMoveModalOpen.value = true
}

const workspaceName = computed(() => currentWorkspace.value?.name || 'Workspace')
</script>

<template>
  <div class="h-full flex flex-col">

    <!-- Mobile Breadcrumbs (Inline) -->
    <div class="border-b border-gray-200 dark:border-gray-800 p-2 bg-white dark:bg-gray-900 md:hidden">
        <NavBreadcrumbs
            :items="items"
            :currentParentId="currentSelectionId"
            :rootName="workspaceName"
            @navigate="handleBreadcrumbNavigate"
        />
    </div>

    <!-- Desktop Breadcrumbs (Portal to Header) -->
    <Teleport to="#header-portal">
        <NavBreadcrumbs
            :items="items"
            :currentParentId="currentSelectionId"
            :rootName="workspaceName"
            @navigate="handleBreadcrumbNavigate"
        />
    </Teleport>

    <!-- Content -->
    <div v-if="loading" class="flex-1 flex justify-center items-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>

    <!-- Note Editor -->
    <NoteEditor
      v-else-if="selectedNote"
      :key="selectedNote.id"
      :note="selectedNote"
      :path="notePath"
      @move="openMoveModal"
    />

    <!-- Folder View -->
    <div v-else-if="selectedFolderId" class="flex-1 overflow-y-auto">
        <div class="px-2 md:px-0">
          <div class="flex items-center justify-between mb-8">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-2xl flex items-center justify-center text-yellow-600 dark:text-yellow-500 shadow-sm transition-transform hover:scale-105">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg>
              </div>
              <div>
                <h2 class="text-2xl font-bold text-slate-900 dark:text-white leading-tight">
                  {{ currentFolder?.title || 'Folder' }}
                </h2>
                <p class="text-sm text-slate-400 dark:text-slate-500 font-medium">
                  {{ folderItems.length }} {{ folderItems.length === 1 ? 'item' : 'items' }} in this collection
                </p>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <button
                  v-if="currentFolder"
                  @click="openMoveModal(currentFolder)"
                  class="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all active:scale-90"
                  title="Move Folder"
              >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
              </button>

              <button
                @click="createInFolder('note')"
                class="hidden md:flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-500/20 active:scale-95"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"></path></svg>
                New Note
              </button>
            </div>
          </div>

          <div v-if="folderItems.length > 0" class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
              <div
                  v-for="item in folderItems"
                  :key="item.id"
                  class="relative group"
              >
                  <div
                      @click="navigateToItem(item)"
                      class="premium-card p-6 flex flex-col items-center text-center gap-4 group"
                  >
                      <div v-if="item.type === 'folder'" class="w-16 h-16 bg-yellow-50 dark:bg-yellow-900/10 rounded-2xl flex items-center justify-center text-yellow-500 shadow-sm group-hover:scale-110 transition-transform">
                          <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg>
                      </div>
                      <div v-else class="w-16 h-16 bg-blue-50 dark:bg-blue-900/10 rounded-2xl flex items-center justify-center text-blue-500 shadow-sm group-hover:scale-110 transition-transform">
                          <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                      </div>
                      <span class="text-sm font-bold text-slate-700 dark:text-slate-200 truncate w-full group-hover:text-blue-600 transition-colors">{{ item.title }}</span>
                  </div>
                  <!-- Quick Move Button on Card -->
                  <button
                      @click.stop="openMoveModal(item)"
                      class="absolute top-2 right-2 p-1.5 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:text-blue-600 shadow-sm border border-gray-100 dark:border-slate-700"
                      title="Move"
                  >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
                  </button>
              </div>
          </div>

          <div v-else class="flex flex-col items-center justify-center py-24 text-center">
              <div class="w-24 h-24 bg-slate-50 dark:bg-slate-900 rounded-[2rem] flex items-center justify-center mb-6 shadow-inner">
                <svg class="w-12 h-12 text-slate-200 dark:text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z"></path></svg>
              </div>
              <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-2">Empty Folder</h3>
              <p class="text-slate-400 dark:text-slate-500 mb-8 max-w-xs leading-relaxed">
                  Start fresh! Create a subfolder or a new note to organize your thoughts.
              </p>
              <div class="flex gap-3">
                  <button
                      @click="createInFolder('folder')"
                      class="px-6 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl font-bold text-sm text-slate-600 dark:text-slate-300 transition-all active:scale-95"
                  >
                      New Folder
                  </button>
                  <button
                      @click="createInFolder('note')"
                      class="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                  >
                      New Note
                  </button>
              </div>
          </div>
        </div>
    </div>

    <!-- Dashboard / Root View -->
    <div v-else class="flex-1 overflow-y-auto">
        <div class="px-2 md:px-0">
          <div class="flex items-center justify-between mb-8">
            <div>
              <h2 class="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {{ workspaceName }}
              </h2>
              <p class="text-sm text-slate-500 dark:text-slate-400 font-medium">
                Browsing your collection in this workspace
              </p>
            </div>
          </div>

          <div v-if="dashboardItems.length > 0" class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
               <div
                  v-for="item in dashboardItems"
                  :key="item.id"
                  class="relative group"
              >
                  <div
                      @click="navigateToItem(item)"
                      class="premium-card p-6 flex flex-col items-center text-center gap-4 group"
                  >
                      <div v-if="item.type === 'folder'" class="w-16 h-16 bg-yellow-50 dark:bg-yellow-900/10 rounded-2xl flex items-center justify-center text-yellow-500 shadow-sm group-hover:scale-110 transition-transform">
                          <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg>
                      </div>
                      <div v-else class="w-16 h-16 bg-blue-50 dark:bg-blue-900/10 rounded-2xl flex items-center justify-center text-blue-500 shadow-sm group-hover:scale-110 transition-transform">
                          <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                      </div>
                      <span class="text-sm font-bold text-slate-700 dark:text-slate-200 truncate w-full group-hover:text-blue-600 transition-colors leading-tight">{{ item.title }}</span>
                  </div>
                   <!-- Quick Move Button on Card -->
                  <button
                      @click.stop="openMoveModal(item)"
                      class="absolute top-2 right-2 p-1.5 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:text-blue-600 shadow-sm border border-gray-100 dark:border-slate-700"
                      title="Move"
                  >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
                  </button>
              </div>
          </div>

          <div v-else class="flex flex-col items-center justify-center py-24 text-center">
               <div class="w-24 h-24 bg-slate-50 dark:bg-slate-900 rounded-[2rem] flex items-center justify-center mb-6 shadow-inner border border-slate-100 dark:border-slate-800">
                  <svg class="w-12 h-12 text-slate-200 dark:text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
               </div>
               <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-2">Empty Workspace</h3>
               <p class="text-slate-400 dark:text-slate-500 mb-8 max-w-xs leading-relaxed">
                 This workspace doesn't have any content yet. Use the sidebar or create a new note below.
               </p>
               <button
                 @click="createInFolder('note')"
                 class="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all shadow-xl shadow-blue-500/20 active:scale-95"
               >
                 Create First Note
               </button>
          </div>
        </div>
    </div>

    <MoveModal
        :isOpen="isMoveModalOpen"
        :itemToMove="itemToMove"
        @close="isMoveModalOpen = false"
        @moved="() => {
            isMoveModalOpen = false
            // Optional: refresh or redirect
        }"
    />

    <InputModal
        :isOpen="isInputModalOpen"
        :title="inputModalTitle"
        :placeholder="inputModalPlaceholder"
        @close="isInputModalOpen = false"
        @submit="handleInputSubmit"
    />

    <AlertModal
        :isOpen="alertModalOpen"
        title="Error"
        :message="alertModalMessage"
        @close="alertModalOpen = false"
    />
  </div>
</template>
```

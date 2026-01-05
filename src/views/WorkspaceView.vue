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

const createInFolder = async (type: 'folder' | 'note') => {
    const parentId = selectedFolderId.value
    const name = prompt(type === 'folder' ? 'Folder Name:' : 'Note Title:')
    if (name) {
        try {
           await createItem(name, type, parentId, type === 'note' ? '# ' + name : undefined)
        } catch (e) {
            console.error(e)
            alert('Failed to create item')
        }
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
    <div v-else-if="selectedFolderId" class="flex-1 p-6 overflow-y-auto">
        <h2 class="text-2xl font-bold mb-6 flex items-center gap-2">
            <svg class="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg>
            {{ currentFolder?.title || 'Folder' }}

             <button
                v-if="currentFolder"
                @click="openMoveModal(currentFolder)"
                class="ml-4 p-1 text-gray-400 hover:text-blue-500"
                title="Move Folder"
            >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
            </button>
        </h2>

        <div v-if="folderItems.length > 0" class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <div
                v-for="item in folderItems"
                :key="item.id"
                class="relative group"
            >
                <div
                    @click="navigateToItem(item)"
                    class="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:shadow-md cursor-pointer transition-all flex flex-col items-center text-center gap-2"
                >
                    <div v-if="item.type === 'folder'" class="text-yellow-500 group-hover:scale-110 transition-transform">
                        <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg>
                    </div>
                    <div v-else class="text-blue-500 group-hover:scale-110 transition-transform">
                        <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    </div>
                    <span class="text-sm font-medium truncate w-full">{{ item.title }}</span>
                </div>
                <!-- Quick Move Button on Card -->
                <button
                    @click.stop="openMoveModal(item)"
                    class="absolute top-2 right-2 p-1 bg-white/80 dark:bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:text-blue-500"
                    title="Move"
                >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
                </button>
            </div>
        </div>

        <div v-else class="flex flex-col items-center justify-center py-20 text-gray-500">
            <svg class="w-16 h-16 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z"></path></svg>
            <p class="text-lg mb-6">This folder is empty</p>
            <div class="flex gap-4">
                <button
                    @click="createInFolder('folder')"
                    class="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors"
                >
                    Create Folder
                </button>
                <button
                    @click="createInFolder('note')"
                    class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-lg shadow-blue-500/30"
                >
                    Create Note
                </button>
            </div>
        </div>
    </div>

    <!-- Dashboard / Root View -->
    <div v-else class="flex-1 p-6 overflow-y-auto">
        <h2 class="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Workspace Overview</h2>

        <div v-if="dashboardItems.length > 0" class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
             <div
                v-for="item in dashboardItems"
                :key="item.id"
                class="relative group"
            >
                <div
                    @click="navigateToItem(item)"
                    class="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:shadow-md cursor-pointer transition-all flex flex-col items-center text-center gap-2"
                >
                    <div v-if="item.type === 'folder'" class="text-yellow-500 group-hover:scale-110 transition-transform">
                        <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg>
                    </div>
                    <div v-else class="text-blue-500 group-hover:scale-110 transition-transform">
                        <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    </div>
                    <span class="text-sm font-medium truncate w-full text-gray-700 dark:text-gray-200">{{ item.title }}</span>
                </div>
                 <!-- Quick Move Button on Card -->
                <button
                    @click.stop="openMoveModal(item)"
                    class="absolute top-2 right-2 p-1 bg-white/80 dark:bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:text-blue-500"
                    title="Move"
                >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
                </button>
            </div>
        </div>

        <div v-else class="flex flex-col items-center justify-center py-20 text-gray-500">
             <svg class="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
             <p class="text-lg font-medium">Workspace is empty</p>
             <p class="text-sm">Create items using the sidebar</p>
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
  </div>
</template>
```

<script setup lang="ts">
import { ref } from 'vue'
import { useWorkspaces, type Workspace } from '@/composables/useWorkspaces'
import InputModal from '@/components/InputModal.vue'
import ConfirmModal from '@/components/ConfirmModal.vue'

const { workspaces, currentWorkspace, setCurrentWorkspace, createWorkspace, updateWorkspace, deleteWorkspace, loading } = useWorkspaces()
const isOpen = ref(false)
const isCreating = ref(false)
const newWorkspaceName = ref('')

// Delete modal state
const isDeleteModalOpen = ref(false)
const workspaceToDelete = ref<Workspace | null>(null)

// Rename modal state
const isRenameModalOpen = ref(false)
const workspaceToRename = ref<Workspace | null>(null)

// Get item counts for each workspace
const workspaceItemCounts = ref<Record<string, number>>({})

// Fetch items for workspaces to check if they're empty
const updateWorkspaceItemCounts = async () => {
  for (const ws of workspaces.value) {
    // We cannot use useNotes inside a loop/async function like this effectively
    // because composables must be called at top level of setup.
    // Instead, we should probably have a way to count items outside of useNotes
    // or call a dedicated counting function.
    // For now, let's keep it simple and just fetch the collection.
    // Actually, I'll use a standard Firestore query here to avoid top-level constraint.
    try {
        const { getDocs, collection, query, where } = await import('firebase/firestore')
        const { db } = await import('@/firebase/config')
        const q = query(
          collection(db, 'items'),
          where('workspaceId', '==', ws.id)
        )
        const snapshot = await getDocs(q)
        workspaceItemCounts.value[ws.id] = snapshot.size
    } catch (err: unknown) {
        // Silently ignore permission errors for counting - just means we can't verify emptiness
        if (err instanceof Error && !err.message.includes('Missing or insufficient permissions')) {
            console.error('Failed to count items for workspace:', ws.id, err.message)
        }
    }
  }
}

// Update counts when dropdown opens
const toggleDropdown = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    updateWorkspaceItemCounts()
  }
}

const handleCreate = async () => {
  if (!newWorkspaceName.value.trim()) return
  try {
    await createWorkspace(newWorkspaceName.value)
    newWorkspaceName.value = ''
    isCreating.value = false
    isOpen.value = false // Close after creation
  } catch (error) {
    console.error('Failed to create workspace:', error)
  }
}

const emit = defineEmits<{
  (e: 'select', workspace: Workspace): void
}>()

const selectWorkspace = (ws: Workspace) => {
  setCurrentWorkspace(ws)
  isOpen.value = false
  emit('select', ws)
}

const openRenameModal = (ws: Workspace, event: Event) => {
  event.stopPropagation()
  workspaceToRename.value = ws
  isRenameModalOpen.value = true
  isOpen.value = false
  activeMenuId.value = null
}

const handleRename = async (newName: string) => {
  if (workspaceToRename.value) {
    try {
      await updateWorkspace(workspaceToRename.value.id, newName)
      isRenameModalOpen.value = false
      workspaceToRename.value = null
    } catch (error) {
      console.error('Failed to rename workspace:', error)
    }
  }
}

const handleDelete = async () => {
  if (workspaceToDelete.value) {
    try {
      await deleteWorkspace(workspaceToDelete.value.id)
      isDeleteModalOpen.value = false
      workspaceToDelete.value = null
      isOpen.value = false
      activeMenuId.value = null
    } catch (error) {
      console.error('Failed to delete workspace:', error)
    }
  }
}

const confirmDelete = (ws: Workspace, event: Event) => {
  event.stopPropagation()
  workspaceToDelete.value = ws
  isDeleteModalOpen.value = true
  isOpen.value = false
  activeMenuId.value = null
}

const activeMenuId = ref<string | null>(null)

const toggleMenu = (wsId: string, event: Event) => {
  event.stopPropagation()
  activeMenuId.value = activeMenuId.value === wsId ? null : wsId
}
</script>

<template>
  <div class="px-3 py-2">
    <!-- Workspace Selector Dropdown Interface -->
    <div class="relative">
      <button
        @click="toggleDropdown"
        class="w-full flex items-center justify-between p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors shadow-sm"
      >
        <span class="font-medium truncate">
          {{ currentWorkspace?.name || 'Select Workspace' }}
        </span>
        <svg class="w-4 h-4 text-gray-400 transition-transform duration-200" :class="{ 'rotate-180': isOpen }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <!-- Dropdown Menu -->
      <div v-if="isOpen" class="absolute top-full left-0 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden">
        <div class="max-h-64 overflow-y-auto py-2">
          <div
            v-for="ws in workspaces"
            :key="ws.id"
            class="px-2"
          >
            <div
                class="group flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors"
                :class="currentWorkspace?.id === ws.id ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'hover:bg-gray-50 dark:hover:bg-gray-700'"
            >
                <button
                @click="selectWorkspace(ws)"
                class="flex-1 text-left font-medium min-w-0 truncate mr-2"
                >
                {{ ws.name }}
                </button>

                <!-- Meatball Toggle -->
                <button
                    @click="toggleMenu(ws.id, $event)"
                    class="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none transition-colors ml-auto flex-shrink-0"
                    :class="{ 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-100': activeMenuId === ws.id }"
                >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
                    </svg>
                </button>
            </div>

            <!-- Inline Action Menu (avoid absolute clipping) -->
            <div
                v-if="activeMenuId === ws.id"
                class="mt-1 mb-2 ml-4 flex flex-col bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-100 dark:border-gray-700/50 overflow-hidden"
            >
                <button
                  @click="openRenameModal(ws, $event)"
                  class="flex items-center gap-2 w-full text-left px-4 py-2 text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                  Rename
                </button>
                <button
                  @click="confirmDelete(ws, $event)"
                  class="flex items-center gap-2 w-full text-left px-4 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  Delete
                </button>
              </div>
          </div>
        </div>

        <div class="border-t border-gray-200 dark:border-gray-700 p-2 bg-gray-50 dark:bg-gray-800/50">
          <button
            v-if="!isCreating"
            @click="isCreating = true"
            class="w-full flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 font-medium p-1 transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            New Workspace
          </button>

          <div v-else class="flex flex-col gap-2 p-1">
            <input
              v-model="newWorkspaceName"
              type="text"
              placeholder="Workspace Name"
              class="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              @keyup.enter="handleCreate"
              autoFocus
            />
            <div class="flex gap-2">
              <button
                @click="handleCreate"
                :disabled="loading"
                class="flex-1 bg-blue-600 text-white text-xs py-1.5 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
              >
                Create
              </button>
              <button
                @click="isCreating = false"
                class="px-2 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Click outside overlay (optional but helpful) -->
    <div v-if="isOpen" class="fixed inset-0 z-40" @click="isOpen = false"></div>

    <!-- Rename Modal -->
    <InputModal
      :isOpen="isRenameModalOpen"
      title="Rename Workspace"
      placeholder="New workspace name..."
      :defaultValue="workspaceToRename?.name"
      @close="isRenameModalOpen = false"
      @submit="handleRename"
    />

    <!-- Delete Confirmation Modal -->
    <ConfirmModal
      :isOpen="isDeleteModalOpen"
      title="Delete Workspace"
      :message="`Are you sure you want to delete '${workspaceToDelete?.name}'? This will permanently delete ALL content inside it.`"
      confirmText="Delete"
      :isDangerous="true"
      @close="isDeleteModalOpen = false"
      @confirm="handleDelete"
    />
  </div>
</template>

import { ref, computed } from 'vue'
import { useWorkspaces, type Workspace } from '@/composables/useWorkspaces'
import { useNotes } from '@/composables/useNotes'
import InputModal from '@/components/InputModal.vue'

const { workspaces, currentWorkspace, setCurrentWorkspace, createWorkspace, updateWorkspace, deleteWorkspace, loading } = useWorkspaces()
const isOpen = ref(false)
const isCreating = ref(false)
const newWorkspaceName = ref('')

// Rename modal state
const isRenameModalOpen = ref(false)
const workspaceToRename = ref<Workspace | null>(null)

// Get item counts for each workspace
const workspaceItemCounts = ref<Record<string, number>>({})

// Fetch items for workspaces to check if they're empty
const updateWorkspaceItemCounts = async () => {
  for (const ws of workspaces.value) {
    const { items } = useNotes(computed(() => ws.id))
    // Wait a tick for items to load
    await new Promise(resolve => setTimeout(resolve, 100))
    workspaceItemCounts.value[ws.id] = items.value.length
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

const selectWorkspace = (ws: Workspace) => {
  setCurrentWorkspace(ws)
  isOpen.value = false
}

const openRenameModal = (ws: Workspace, event: Event) => {
  event.stopPropagation()
  workspaceToRename.value = ws
  isRenameModalOpen.value = true
  isOpen.value = false
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

const handleDelete = async (ws: Workspace, event: Event) => {
  event.stopPropagation()
  const itemCount = workspaceItemCounts.value[ws.id] || 0

  if (itemCount > 0) {
    alert(`Cannot delete workspace "${ws.name}" - it contains ${itemCount} item(s). Please delete all items first.`)
    return
  }

  if (confirm(`Are you sure you want to delete workspace "${ws.name}"?`)) {
    try {
      await deleteWorkspace(ws.id)
      isOpen.value = false
    } catch (error) {
      console.error('Failed to delete workspace:', error)
    }
  }
}
</script>

<template>
  <div class="px-3 py-2">
    <!-- Workspace Selector Dropdown Interface -->
    <div class="relative">
      <button
        @click="toggleDropdown"
        class="w-full flex items-center justify-between p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      >
        <span class="font-medium truncate">
          {{ currentWorkspace?.name || 'Select Workspace' }}
        </span>
        <svg class="w-4 h-4 text-gray-500 transition-transform duration-200" :class="{ 'rotate-180': isOpen }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <!-- Dropdown Menu -->
      <div v-if="isOpen" class="absolute top-full left-0 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 overflow-hidden">
        <div class="max-h-48 overflow-y-auto py-1">
          <div
            v-for="ws in workspaces"
            :key="ws.id"
            class="group flex items-center justify-between px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
            :class="{ 'text-blue-600 font-medium bg-blue-50/50 dark:bg-blue-900/10': currentWorkspace?.id === ws.id }"
          >
            <button
              @click="selectWorkspace(ws)"
              class="flex-1 text-left"
            >
              {{ ws.name }}
            </button>
            <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                @click="openRenameModal(ws, $event)"
                class="p-1 hover:text-blue-600"
                title="Rename workspace"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
              </button>
              <button
                v-if="(workspaceItemCounts[ws.id] || 0) === 0"
                @click="handleDelete(ws, $event)"
                class="p-1 hover:text-red-600"
                title="Delete empty workspace"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
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
  </div>
</template>

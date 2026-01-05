<script setup lang="ts">
import { ref, computed } from 'vue'
import { useWorkspaces } from '@/composables/useWorkspaces'
import { useNotes, type NoteItem } from '@/composables/useNotes'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '@/firebase/config'

const props = defineProps<{
  itemToMove: NoteItem | null
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'moved'): void
}>()

const { workspaces } = useWorkspaces()
const selectedWorkspaceId = ref('')
const targetFolderId = ref<string>('')
const loading = ref(false)

// Fetch items for the *target* workspace to list folders
const targetWorkspaceIdComputed = computed(() => selectedWorkspaceId.value)
const { items: targetItems } = useNotes(targetWorkspaceIdComputed)

const folderOptions = computed(() => {
    return targetItems.value
        .filter(i => i.type === 'folder' && i.id !== props.itemToMove?.id) // Don't move folder into itself (simplified check)
        .sort((a, b) => a.title.localeCompare(b.title))
})

const handleMove = async () => {
    if (!props.itemToMove || !selectedWorkspaceId.value) return

    loading.value = true
    try {
        await updateDoc(doc(db, 'items', props.itemToMove.id), {
            workspaceId: selectedWorkspaceId.value,
            parentId: targetFolderId.value || null
        })
        emit('moved')
        emit('close')
    } catch (e) {
        console.error(e)
        alert('Failed to move item')
    } finally {
        loading.value = false
    }
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-sm w-full p-6 border border-gray-200 dark:border-gray-700">
      <h3 class="text-lg font-bold mb-4 dark:text-white">Move Item</h3>
      <p class="text-sm text-gray-500 mb-4">
        Select a destination for <span class="font-medium text-gray-800 dark:text-gray-200">"{{ itemToMove?.title }}"</span>.
      </p>

      <div class="space-y-4">
        <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Workspace</label>
            <select
                v-model="selectedWorkspaceId"
                @change="targetFolderId = ''"
                class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
                <option disabled value="">Select Workspace</option>
                <option v-for="ws in workspaces" :key="ws.id" :value="ws.id">
                    {{ ws.name }}
                </option>
            </select>
        </div>

        <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Folder (Optional)</label>
            <select
                v-model="targetFolderId"
                :disabled="!selectedWorkspaceId"
                class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 disabled:opacity-50"
            >
                <option value="">Root (No Folder)</option>
                <option v-for="folder in folderOptions" :key="folder.id" :value="folder.id">
                    {{ folder.title }}
                </option>
            </select>
        </div>
      </div>

      <div class="mt-6 flex justify-end gap-3">
        <button
            @click="emit('close')"
            class="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800"
        >
            Cancel
        </button>
        <button
            @click="handleMove"
            :disabled="!selectedWorkspaceId || loading"
            class="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
            {{ loading ? 'Moving...' : 'Move' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useNotes, type NoteItem } from '@/composables/useNotes'
import { useWorkspaces } from '@/composables/useWorkspaces'
import ConfirmModal from '@/components/ConfirmModal.vue'
import FileTreeItem from './FileTreeItem.vue'

const props = defineProps<{
  items: NoteItem[]
  parentId: string | null
  depth?: number
}>()

const { currentWorkspace } = useWorkspaces()

// We only need deleteItem context here. The items are passed as props.
// Note: useNotes might re-fetch if we pass the workspace ID, but we only need the action.
// To avoid fetching, we might want to refactor useNotes or just ignore the extra fetch for now (it's cached/subscribed).
// However, naming collision 'items' must be avoided.
const { deleteItem, updateItem } = useNotes(() => currentWorkspace.value?.id)

const emit = defineEmits<{
  (e: 'select', item: NoteItem): void
  (e: 'create-folder', parentId: string | null): void
  (e: 'create-note', parentId: string | null): void
}>()

const currentDepth = computed(() => props.depth || 0)

// Filter items that belong to this level
const currentLevelItems = computed(() => {
  const filtered = props.items.filter(item => item.parentId === props.parentId)
    .sort((a, b) => {
      // Folders first, then items
      if (a.type === b.type) return a.title.localeCompare(b.title)
      return a.type === 'folder' ? -1 : 1
    })
  return filtered
})

const expandedFolders = ref<Set<string>>(new Set())

watch(() => props.items, () => {
  // If items change significantly (e.g. workspace change), it might be better to reset.
  // Although the :key on root FileTree handles workspace change,
  // nested FileTrees might benefit from stability or reset.
  // Actually, reset is safer for now.
  expandedFolders.value = new Set()
}, { deep: false })

const toggleFolder = (id: string) => {
  if (expandedFolders.value.has(id)) {
    expandedFolders.value.delete(id)
  } else {
    expandedFolders.value.add(id)
  }
}



const handleToggle = (item: NoteItem) => {
    toggleFolder(item.id)
}

const handleRename = async (item: NoteItem, newName: string) => {
    try {
        await updateItem(item.id, { title: newName })
    } catch (e) {
        console.error("Failed to rename item", e)
    }
}

const handleRequestDelete = (item: NoteItem) => {
    itemToDelete.value = item
    isDeleteModalOpen.value = true
}

// Top level component handles the modal state
const isDeleteModalOpen = ref(false)
const itemToDelete = ref<NoteItem | null>(null)

const handleDelete = async () => {
  if (itemToDelete.value) {
    try {
      await deleteItem(itemToDelete.value.id)
      itemToDelete.value = null
      isDeleteModalOpen.value = false
    } catch (e) {
      console.error(e)
    }
  }
}

</script>

<template>
  <div class="select-none">
    <ul>
      <li v-for="item in currentLevelItems" :key="item.id">
        <FileTreeItem
            :item="item"
            :depth="currentDepth"
            :isExpanded="expandedFolders.has(item.id)"
            @select="emit('select', $event)"
            @toggle="handleToggle"
            @create-folder="emit('create-folder', $event)"
            @create-note="emit('create-note', $event)"
            @rename="handleRename"
            @delete="handleRequestDelete"
        />

        <!-- Recursive Children -->
        <FileTree
          v-if="item.type === 'folder' && expandedFolders.has(item.id)"
          :items="items"
          :parentId="item.id"
          :depth="currentDepth + 1"
          @select="emit('select', $event)"
          @create-folder="emit('create-folder', $event)"
          @create-note="emit('create-note', $event)"
        />
      </li>
    </ul>

    <!-- Empty State is confusing if recursive, only show if root -->
    <div
        v-if="currentLevelItems.length === 0 && currentDepth === 0"
        class="text-xs text-center text-gray-500 py-4"
    >
        No items yet.
    </div>

    <!-- Confirmation Modal (Only rendered by standard non-recursive calls,
        but since FileTree is self-recursive, every instance has this.
        Ideally we'd bubble up, but having a modal per instance is harmless locally
        as long as only one activates.)
    -->
    <ConfirmModal
      :isOpen="isDeleteModalOpen"
      title="Delete Item"
      :message="`Are you sure you want to delete '${itemToDelete?.title}'?`"
      confirmText="Delete"
      :isDangerous="true"
      @close="isDeleteModalOpen = false"
      @confirm="handleDelete"
    />
  </div>
</template>

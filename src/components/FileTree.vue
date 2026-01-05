<script setup lang="ts">
import { ref, computed } from 'vue'
import type { NoteItem } from '@/composables/useNotes'

const props = defineProps<{
  items: NoteItem[]
  parentId: string | null
  depth?: number
}>()

const emit = defineEmits<{
  (e: 'select', item: NoteItem): void
  (e: 'create-folder', parentId: string | null): void
  (e: 'create-note', parentId: string | null): void
}>()

const currentDepth = computed(() => props.depth || 0)

// Filter items that belong to this level
const currentLevelItems = computed(() => {
  return props.items.filter(item => item.parentId === props.parentId)
    .sort((a, b) => {
      // Folders first, then items
      if (a.type === b.type) return a.title.localeCompare(b.title)
      return a.type === 'folder' ? -1 : 1
    })
})

const expandedFolders = ref<Set<string>>(new Set())

const toggleFolder = (id: string) => {
  if (expandedFolders.value.has(id)) {
    expandedFolders.value.delete(id)
  } else {
    expandedFolders.value.add(id)
  }
}

const handleSelect = (item: NoteItem) => {
  if (item.type === 'folder') {
    toggleFolder(item.id)
  }
  emit('select', item)
}
</script>

<template>
  <div class="select-none">
    <ul>
      <li v-for="item in currentLevelItems" :key="item.id">
        <div
          @click="handleSelect(item)"
          class="group flex items-center justify-between gap-2 px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg cursor-pointer transition-colors"
          :style="{ paddingLeft: `${currentDepth * 20 + 12}px` }"
        >
          <div class="flex items-center gap-2 overflow-hidden">
             <!-- Folder Icon -->
            <span v-if="item.type === 'folder'" class="text-yellow-500 flex-shrink-0">
                <svg class="w-4 h-4 transition-transform duration-200" :class="{ 'transform rotate-90': expandedFolders.has(item.id) }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
            </span>
            <!-- Note Icon -->
            <span v-else class="text-gray-400 flex-shrink-0">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            </span>

            <span class="text-sm truncate select-none">{{ item.title }}</span>
          </div>

          <!-- Inline Actions for Folders -->
          <div v-if="item.type === 'folder'" class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
             <button
                @click.stop="emit('create-folder', item.id)"
                class="p-0.5 text-gray-400 hover:text-blue-500 rounded"
                title="New Sub-folder"
             >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"></path></svg>
             </button>
             <button
                @click.stop="emit('create-note', item.id)"
                class="p-0.5 text-gray-400 hover:text-blue-500 rounded"
                title="New Note inside"
             >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
             </button>
          </div>
        </div>

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

    <!-- Empty State / Create Actions at Root -->
    <div
        v-if="currentLevelItems.length === 0 && currentDepth === 0"
        class="text-xs text-center text-gray-500 py-4"
    >
        No items yet.
    </div>
  </div>
</template>

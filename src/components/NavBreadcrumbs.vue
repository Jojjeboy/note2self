<script setup lang="ts">
import { computed } from 'vue'
import type { NoteItem } from '@/composables/useNotes'

const props = defineProps<{
  items: NoteItem[]
  currentParentId: string | null
  rootName?: string
}>()

const emit = defineEmits<{
  (e: 'navigate', id: string | null): void
}>()

const path = computed(() => {
  const result: { id: string | null; title: string }[] = []
  let currentId = props.currentParentId

  // Safety break to prevent infinite loops if cyclic structure exists (shouldn't happen)
  let depth = 0
  while (currentId && depth < 50) {
    const item = props.items.find(i => i.id === currentId)
    if (item) {
      result.unshift({ id: item.id, title: item.title })
      currentId = item.parentId
    } else {
      break
    }
    depth++
  }

  // Add Root
  result.unshift({ id: null, title: props.rootName || 'Root' })
  return result
})
</script>

<template>
  <nav class="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-500 mb-4 px-4">
    <template v-for="(step, index) in path" :key="step.id || 'root'">
      <button
        @click="emit('navigate', step.id)"
        class="hover:text-blue-600 hover:underline transition-colors"
        :class="{ 'font-semibold text-gray-900 dark:text-gray-100': index === path.length - 1 }"
      >
        {{ step.title }}
      </button>
      <span v-if="index < path.length - 1" class="text-gray-400">&gt;</span>
    </template>
  </nav>
</template>

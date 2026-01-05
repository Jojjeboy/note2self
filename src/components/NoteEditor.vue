<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '@/firebase/config'
import type { NoteItem } from '@/composables/useNotes'

import MarkdownGuide from './MarkdownGuide.vue'

const props = defineProps<{
  note: NoteItem
  path?: string
}>()

const emit = defineEmits<{
  move: [note: NoteItem]
}>()

const content = ref(props.note.content || '')
const mode = ref<'edit' | 'view'>('edit')
const isSaving = ref(false)
const lastSaved = ref<Date | null>(null)
const showGuide = ref(false)

// 1MB limit in bytes
const MAX_SIZE_BYTES = 1048576

const sizeInBytes = computed(() => new Blob([content.value]).size)
const usagePercentage = computed(() => Math.min((sizeInBytes.value / MAX_SIZE_BYTES) * 100, 100))
const isOverLimit = computed(() => sizeInBytes.value > MAX_SIZE_BYTES)

const renderedContent = computed(() => {
  const rawHtml = marked.parse(content.value || '') as string
  return DOMPurify.sanitize(rawHtml)
})

// Debounced Save
let timeout: ReturnType<typeof setTimeout> | null = null
const saveContent = async () => {
  if (timeout) clearTimeout(timeout)

  timeout = setTimeout(async () => {
    // Basic check to avoid unnecessary writes or invalid data
    if (content.value === props.note.content && !isOverLimit.value) return

    isSaving.value = true
    try {
        await updateDoc(doc(db, 'items', props.note.id), {
            content: content.value
        })
        lastSaved.value = new Date()
    } catch (e: unknown) {
        if (e instanceof Error) {
            console.error('Export failed', e.message)
            alert('Export failed: ' + e.message)
        }
    } finally {
        isSaving.value = false
    }
  }, 1000)
}

watch(content, () => {
   saveContent()
})

// Sync local content if prop changes (e.g. creating new note)
watch(() => props.note, (newNote) => {
    // Only update if IDs differ to avoid overwriting user typing
    if (newNote.id !== props.note.id) {
        content.value = newNote.content || ''
    }
})

// Paste Handler for Images
const handlePaste = (e: ClipboardEvent) => {
  const items = e.clipboardData?.items
  if (!items) return

  for (const item of items) {
    if (item.type.includes('image')) {
      e.preventDefault()
      const blob = item.getAsFile()
      if (!blob) continue

      const reader = new FileReader()
      reader.onload = (event) => {
        const base64 = event.target?.result as string
        const imageMarkdown = `![Image](${base64})`

        // Insert at cursor position
        const textarea = document.querySelector('textarea')
        if (textarea) {
            const start = textarea.selectionStart
            const end = textarea.selectionEnd
            content.value = content.value.substring(0, start) + imageMarkdown + content.value.substring(end)
        } else {
            content.value += imageMarkdown
        }
      }
      reader.readAsDataURL(blob)
    }
  }
}
</script>

<template>
  <div class="h-full flex flex-col bg-white dark:bg-gray-900">
    <!-- Toolbar -->
    <div class="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-800">
      <div class="flex items-center gap-4 overflow-hidden">
        <div class="flex flex-col truncate">
            <h2 class="font-bold text-lg truncate max-w-xs leading-none">{{ note.title }}</h2>
        </div>

        <div class="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 flex-shrink-0">
          <button
            @click="mode = 'edit'"
            class="px-3 py-1 text-sm rounded-md transition-colors"
            :class="mode === 'edit' ? 'bg-white dark:bg-gray-700 shadow text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700'"
          >
            Edit
          </button>
          <button
            @click="mode = 'view'"
            class="px-3 py-1 text-sm rounded-md transition-colors"
            :class="mode === 'view' ? 'bg-white dark:bg-gray-700 shadow text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700'"
          >
            Preview
          </button>
        </div>

        <button
            @click="emit('move', note)"
            class="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
            title="Move Note"
        >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
        </button>

        <button
            @click="showGuide = true"
            class="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
            title="Markdown Cheat Sheet"
        >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </button>
      </div>

      <div class="flex items-center gap-4 text-xs">
         <!-- Size Indicator (Visible only if > 0.7 MB) -->
         <div v-if="sizeInBytes > 700000" class="flex items-center gap-2" :class="{ 'text-red-500': isOverLimit, 'text-yellow-500': usagePercentage > 80 }">
            <div class="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                    class="h-full transition-all duration-500"
                    :class="isOverLimit ? 'bg-red-500' : (usagePercentage > 80 ? 'bg-yellow-500' : 'bg-green-500')"
                    :style="{ width: `${usagePercentage}%` }"
                ></div>
            </div>
            <span>{{ (sizeInBytes / 1024).toFixed(1) }} KB / 1 MB</span>
         </div>

         <div class="flex items-center gap-1 min-w-[60px] justify-end">
            <template v-if="isSaving">
                <svg class="w-3 h-3 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                <span class="text-blue-500">Saving...</span>
            </template>
            <template v-else-if="lastSaved">
                <svg class="w-3 h-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                <span class="text-green-500 text-opacity-80">Saved</span>
            </template>
         </div>
      </div>
    </div>

    <!-- Content Area -->
    <div class="flex-1 overflow-hidden relative">
      <textarea
        v-if="mode === 'edit'"
        v-model="content"
        @paste="handlePaste"
        class="w-full h-full p-6 resize-none focus:outline-none dark:bg-gray-900 dark:text-gray-100 font-mono text-sm leading-relaxed"
        placeholder="# Start writing..."
      ></textarea>

      <div
        v-else
        v-html="renderedContent"
        class="prose dark:prose-invert max-w-none p-6 overflow-y-auto h-full"
      ></div>
    </div>

    <!-- Cheat Sheet Modal -->
    <MarkdownGuide :isOpen="showGuide" @close="showGuide = false" />
  </div>
</template>

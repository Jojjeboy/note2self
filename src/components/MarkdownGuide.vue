<script setup lang="ts">
import { } from 'vue'

defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const cheatSheet = [
  { label: 'Heading 1', code: '# Heading 1' },
  { label: 'Heading 2', code: '## Heading 2' },
  { label: 'Bold', code: '**Bold Text**' },
  { label: 'Italic', code: '*Italic Text*' },
  { label: 'Blockquote', code: '> Blockquote' },
  { label: 'List', code: '- Item 1\n- Item 2' },
  { label: 'Ordered List', code: '1. Item 1\n2. Item 2' },
  { label: 'Code Block', code: '```\ncode\n```' },
  { label: 'Link', code: '[Title](url)' },
  { label: 'Image', code: '![Alt](url)' },
  { label: 'Task List', code: '- [ ] Task\n- [x] Completed' },
  { label: 'Table', code: '| Header | Header |\n| --- | --- |\n| Cell | Cell |' }
]

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    // Optional: Show toast
  } catch (err) {
    console.error('Failed to copy', err)
  }
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col border border-gray-200 dark:border-gray-700">
      <div class="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h3 class="text-lg font-bold dark:text-white">Markdown Cheat Sheet</h3>
        <button @click="emit('close')" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>

      <div class="overflow-y-auto p-4 grid gap-4 sm:grid-cols-2">
        <div
            v-for="(item, index) in cheatSheet"
            :key="index"
            class="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 border border-gray-200 dark:border-gray-700 flex flex-col"
        >
            <div class="flex justify-between items-start mb-2">
                <span class="text-xs font-semibold text-gray-500 uppercase">{{ item.label }}</span>
                <button
                    @click="copyToClipboard(item.code)"
                    class="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                >
                    Copy
                </button>
            </div>
            <code class="text-sm font-mono text-gray-800 dark:text-gray-200 whitespace-pre-wrap bg-white dark:bg-gray-800 p-2 rounded border border-gray-100 dark:border-gray-700">{{ item.code }}</code>
        </div>
      </div>

      <div class="p-4 border-t border-gray-200 dark:border-gray-700 text-right">
        <button
            @click="emit('close')"
            class="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded text-sm transition-colors"
        >
            Close
        </button>
      </div>
    </div>
  </div>
</template>

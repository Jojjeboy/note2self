<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '@/firebase/config'
import type { NoteItem } from '@/composables/useNotes'
import ToastEditorWrapper from './ToastEditorWrapper.vue'

const props = defineProps<{
  note: NoteItem
  path?: string
}>()

const emit = defineEmits<{
  move: [note: NoteItem]
}>()

const content = ref(props.note.content || '')
const isSaving = ref(false)
const lastSaved = ref<Date | null>(null)

// 1MB limit in bytes
const MAX_SIZE_BYTES = 1048576

const sizeInBytes = computed(() => new Blob([content.value]).size)
const usagePercentage = computed(() => Math.min((sizeInBytes.value / MAX_SIZE_BYTES) * 100, 100))
const isOverLimit = computed(() => sizeInBytes.value > MAX_SIZE_BYTES)

// Theme detection
const isDark = ref(document.documentElement.classList.contains('dark'))
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
            isDark.value = document.documentElement.classList.contains('dark')
        }
    })
})
observer.observe(document.documentElement, { attributes: true })

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
</script>

<template>
  <div class="h-full flex flex-col bg-transparent">
    <!-- Toolbar -->
    <div class="flex items-center justify-between px-6 py-3 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border-b border-gray-100 dark:border-slate-800/50 z-20">
      <div class="flex items-center gap-4 min-w-0">
        <div class="flex flex-col min-w-0">
            <h2 class="font-bold text-xl text-slate-900 dark:text-white truncate leading-tight">{{ note.title }}</h2>
            <div v-if="path" class="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider truncate">
              {{ path }}
            </div>
        </div>

        <button
            @click="emit('move', note)"
            class="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all active:scale-95"
            title="Move Note"
        >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
        </button>
      </div>

      <div class="flex items-center gap-6">
         <!-- Size Indicator -->
         <div v-if="sizeInBytes > 500000" class="hidden sm:flex items-center gap-3">
            <div class="w-32 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                <div
                    class="h-full transition-all duration-1000 ease-out"
                    :class="isOverLimit ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : (usagePercentage > 80 ? 'bg-yellow-500' : 'bg-blue-500')"
                    :style="{ width: `${usagePercentage}%` }"
                ></div>
            </div>
            <span class="text-[10px] font-bold text-slate-400 tabular-nums uppercase tracking-tighter">{{ (sizeInBytes / 1024).toFixed(0) }}KB / 1MB</span>
         </div>

         <div class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700/50">
            <template v-if="isSaving">
                <div class="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                <span class="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Syncing</span>
            </template>
            <template v-else>
                <div class="w-2 h-2 rounded-full" :class="lastSaved ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600'"></div>
                <span class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {{ lastSaved ? 'Saved' : 'Standby' }}
                </span>
            </template>
         </div>
      </div>
    </div>

    <!-- Content Area -->
    <div class="flex-1 overflow-hidden relative p-4 md:p-8">
        <div class="h-full premium-card overflow-hidden !rounded-[2rem] border-none shadow-premium dark:shadow-premium-dark">
          <ToastEditorWrapper
              v-model="content"
              :theme="isDark ? 'dark' : 'light'"
          />
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import JSZip from 'jszip'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '@/firebase/config'
import { useAuth } from '@/composables/useAuth'
import type { NoteItem } from '@/composables/useNotes'
import AlertModal from './AlertModal.vue'

const props = defineProps<{
  workspaceId: string
  workspaceName: string
}>()

const { user } = useAuth()
const isExporting = ref(false)
const alertOpen = ref(false)
const alertMessage = ref('')

const handleExport = async () => {
    if (!user.value) return
    isExporting.value = true

    try {
        const zip = new JSZip()

        // Fetch all items for this workspace
        const q = query(
            collection(db, 'items'),
            where('workspaceId', '==', props.workspaceId),
            where('userId', '==', user.value.uid)
        )
        const snapshot = await getDocs(q)
        const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as NoteItem))

        // Build folder map
        const folders = items.filter(i => i.type === 'folder')
        const notes = items.filter(i => i.type === 'note')

        // Helper to get full path
        const getPath = (parentId: string | null): string => {
            if (!parentId) return ''
            const parent = folders.find(f => f.id === parentId)
            if (!parent) return ''
            return getPath(parent.parentId) + parent.title + '/'
        }

        // Add Notes to Zip
        for (const note of notes) {
            const path = getPath(note.parentId)
            const filename = `${path}${note.title}.md`
            const content = note.content || ''
            zip.file(filename, content)
        }

        // Generate Zip
        const blob = await zip.generateAsync({ type: 'blob' })

        // Trigger Download
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${props.workspaceName}_export.zip`
        document.body.appendChild(a)
        a.click()
        a.remove()
        URL.revokeObjectURL(url)

    } catch (e: unknown) {
        if (e instanceof Error) {
            console.error('Export failed', e.message)
            alertMessage.value = 'Export failed: ' + e.message
            alertOpen.value = true
        }
    } finally {
        isExporting.value = false
    }
}
</script>

<template>
  <button
    @click="handleExport"
    :disabled="isExporting"
    class="flex items-center gap-2 text-xs text-gray-500 hover:text-blue-600 transition-colors"
    title="Export Workspace to ZIP"
  >
    <svg v-if="!isExporting" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
    <svg v-else class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
    <span>{{ isExporting ? 'Exporting...' : 'Export' }}</span>
  </button>

  <AlertModal
    :isOpen="alertOpen"
    title="Export"
    :message="alertMessage"
    @close="alertOpen = false"
  />
</template>

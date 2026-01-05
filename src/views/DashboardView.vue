<script setup lang="ts">
import { useDashboard } from '@/composables/useDashboard'
import { useRouter } from 'vue-router'
import { formatDistanceToNow } from 'date-fns'
import type { Timestamp } from 'firebase/firestore'
import { Timestamp as FirestoreTimestamp } from 'firebase/firestore'

const { recentItems, loading } = useDashboard()
const router = useRouter()

const navigateToNote = (workspaceId: string, noteId: string) => {
  // We need to implement the route /workspace/:wid/note/:nid or similar
  // For now, let's assume we just open the workspace and maybe select the note.
  // Actually, Phase 3 requirement implies a dedicated editor route or view.
  // Let's plan for: /workspace/:wid?note=:nid
  router.push({ name: 'workspace', params: { id: workspaceId }, query: { noteId } })
}

const formatDate = (timestamp: Timestamp | null) => {
  if (!timestamp) return ''

  if (timestamp instanceof FirestoreTimestamp) {
      return formatDistanceToNow(timestamp.toDate(), { addSuffix: true })
  }
  // Fallback for Date or string/number if mocked or different
  return formatDistanceToNow(new Date(timestamp as unknown as string | number | Date), { addSuffix: true })
}
</script>

<template>
  <div class="p-6 max-w-4xl mx-auto">
    <header class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Dashboard</h1>
      <p class="text-gray-600 dark:text-gray-400">Welcome back! Here are your most recent notes.</p>
    </header>

    <div v-if="loading" class="flex justify-center p-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>

    <div v-else-if="recentItems.length === 0" class="text-center py-10 bg-gray-50 dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
      <p class="text-gray-500">No notes found. Create a workspace and start writing!</p>
    </div>

    <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="item in recentItems"
        :key="item.id"
        @click="navigateToNote(item.workspaceId, item.id)"
        class="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all cursor-pointer group hover:border-blue-400 dark:hover:border-blue-500"
      >
        <div class="flex items-start justify-between mb-3">
          <div class="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
             <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
          </div>
          <span class="text-xs text-gray-400 font-mono">
            {{ formatDate(item.createdAt) }}
          </span>
        </div>

        <h3 class="font-bold text-gray-900 dark:text-white truncate mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {{ item.title }}
        </h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 line-clamp-3 h-10">
          <!-- Preview content (stripped) could actally go here if we stripped markdown -->
           {{ item.content?.slice(0, 100) || 'No content' }}
        </p>
      </div>
    </div>
  </div>
</template>

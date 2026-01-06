<script setup lang="ts">
import { useDashboard } from '@/composables/useDashboard'
import { useRouter } from 'vue-router'
import { formatDistanceToNow } from 'date-fns'
import type { Timestamp } from 'firebase/firestore'
import { Timestamp as FirestoreTimestamp } from 'firebase/firestore'
import { useAuth } from '@/composables/useAuth'

const { recentItems, loading } = useDashboard()
const { user } = useAuth()
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
  <div class="space-y-12">
    <!-- Hero Header -->
    <header class="relative py-8">
      <div class="relative z-10">
        <h1 class="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
          Good day, <span class="text-blue-600">{{ user?.displayName?.split(' ')[0] || 'Friend' }}</span>
        </h1>
        <p class="text-lg text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
          Ready to capture your thoughts? Here are your most recent notes and some quick actions to get you started.
        </p>
      </div>

      <!-- Decorative element -->
      <div class="absolute -top-12 -left-12 w-64 h-64 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
    </header>

    <!-- Quick Actions -->
    <section class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <button
        @click="router.push({ name: 'workspace', params: { id: recentItems[0]?.workspaceId || '' } })"
        class="premium-card p-6 flex flex-col items-center justify-center text-center gap-3 group"
      >
        <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform shadow-sm">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
        </div>
        <span class="font-bold text-sm text-slate-900 dark:text-slate-100 italic">Jump back in</span>
      </button>

      <!-- Multi-step placeholder for other actions -->
      <div class="premium-card p-6 flex flex-col items-center justify-center text-center gap-3 opacity-50 grayscale cursor-not-allowed">
        <div class="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        </div>
        <span class="font-bold text-sm text-slate-400">Search</span>
      </div>
    </section>

    <!-- Recent Notes -->
    <section class="space-y-6">
      <div class="flex items-center justify-between px-2">
        <h2 class="text-xl font-bold text-slate-900 dark:text-white">Recent Notes</h2>
        <button v-if="recentItems.length > 0" class="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">
          View all
        </button>
      </div>

      <div v-if="loading" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div v-for="i in 3" :key="i" class="premium-card h-48 animate-pulse bg-slate-100 dark:bg-slate-800/50"></div>
      </div>

      <div v-else-if="recentItems.length === 0" class="flex flex-col items-center justify-center py-20 px-6 premium-card border-dashed bg-transparent border-slate-200 dark:border-slate-800">
        <div class="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-3xl flex items-center justify-center mb-6 shadow-inner">
          <svg class="w-10 h-10 text-slate-300 dark:text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
        </div>
        <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-2">No notes yet</h3>
        <p class="text-slate-500 dark:text-slate-400 text-center max-w-xs mb-8">
          Start by creating a workspace and your first note. It will appear here!
        </p>
      </div>

      <div v-else class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="item in recentItems"
          :key="item.id"
          @click="navigateToNote(item.workspaceId, item.id)"
          class="premium-card p-6 flex flex-col group cursor-pointer"
        >
          <div class="flex items-start justify-between mb-6">
            <div class="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform shadow-sm">
               <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            </div>
            <div class="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full">
              <span class="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {{ formatDate(item.createdAt) }}
              </span>
            </div>
          </div>

          <div class="flex-1">
            <h3 class="text-lg font-bold text-slate-900 dark:text-white truncate mb-2 group-hover:text-blue-600 transition-colors">
              {{ item.title }}
            </h3>
            <p class="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
              {{ item.content?.slice(0, 100) || 'No content yet...' }}
            </p>
          </div>

          <div class="mt-6 flex items-center text-blue-600 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
            <span>Read more</span>
            <svg class="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

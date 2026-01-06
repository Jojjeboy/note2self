<script setup lang="ts">
import { useTheme } from '@/composables/useTheme'
import { useAuth } from '@/composables/useAuth'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import ExportButton from '@/components/ExportButton.vue'
import AlertModal from '@/components/AlertModal.vue'
import { ref } from 'vue'
import { useWorkspaces } from '@/composables/useWorkspaces'

const { isDark, toggleTheme } = useTheme()
const { logout } = useAuth()
const router = useRouter()
const { t, locale } = useI18n()
const { currentWorkspace } = useWorkspaces()

const handleLogout = async () => {
  await logout()
  router.push('/login')
}

const changeLanguage = (event: Event) => {
    const target = event.target as HTMLSelectElement
    locale.value = target.value
    localStorage.setItem('user-locale', target.value)
}

const version = __APP_VERSION__

const alertOpen = ref(false)
const alertMessage = ref('')

const checkForUpdates = async () => {
    if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration()
        if (registration) {
            await registration.update()
            alertMessage.value = 'Checking for updates...'
            alertOpen.value = true
        }
    }
}
</script>

<template>
  <div class="space-y-12">
    <header>
      <h1 class="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
        {{ t('settings.title') }}
      </h1>
      <p class="text-lg text-slate-500 dark:text-slate-400">
        Personalize your experience and manage your data.
      </p>
    </header>

    <div class="space-y-6">
      <!-- Preferences Group -->
      <section class="space-y-4">
        <h2 class="px-2 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Preferences</h2>
        <div class="premium-card divide-y divide-gray-100 dark:divide-slate-800/50">
          <!-- Language -->
          <div class="p-6 flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div class="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"></path></svg>
              </div>
              <div>
                <h3 class="font-bold text-slate-900 dark:text-white">{{ t('common.language') }}</h3>
                <p class="text-xs text-slate-400 dark:text-slate-500 font-medium">{{ t('settings.select_language') }}</p>
              </div>
            </div>
            <select
              :value="locale"
              @change="changeLanguage"
              class="bg-slate-50 dark:bg-slate-800 border-none text-slate-900 dark:text-slate-100 text-sm font-bold rounded-xl focus:ring-2 focus:ring-blue-500 block p-2.5 transition-all outline-none"
            >
              <option value="en">English</option>
              <option value="sv">Svenska</option>
            </select>
          </div>

          <!-- Theme -->
          <div class="p-6 flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div class="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
              </div>
              <div>
                <h3 class="font-bold text-slate-900 dark:text-white">{{ t('common.theme') }}</h3>
                <p class="text-xs text-slate-400 dark:text-slate-500 font-medium">{{ t('settings.dark_mode') }}</p>
              </div>
            </div>
            <button
               @click="toggleTheme"
               class="relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-4 border-transparent transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 shadow-inner"
               :class="isDark ? 'bg-blue-600' : 'bg-slate-200'"
               role="switch"
               :aria-checked="isDark"
            >
                <span
                  aria-hidden="true"
                  class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-300 ease-in-out"
                  :class="isDark ? 'translate-x-5' : 'translate-x-0'"
                />
            </button>
          </div>
        </div>
      </section>

      <!-- Data Group -->
      <section class="space-y-4">
        <h2 class="px-2 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Workspace Data</h2>
        <div class="premium-card divide-y divide-gray-100 dark:divide-slate-800/50">
          <!-- Export -->
          <div class="p-6 flex items-center justify-between" v-if="currentWorkspace">
             <div class="flex items-center gap-4">
               <div class="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                 <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
               </div>
               <div>
                 <h3 class="font-bold text-slate-900 dark:text-white">Backup</h3>
                 <p class="text-xs text-slate-400 dark:text-slate-500 font-medium">Export workspace data to JSON</p>
               </div>
             </div>
             <ExportButton
                :workspaceId="currentWorkspace.id"
                :workspaceName="currentWorkspace.name"
             />
          </div>

          <!-- Roadmap -->
          <div class="p-6 flex items-center justify-between">
            <div class="flex items-center gap-4">
               <div class="w-10 h-10 bg-amber-50 dark:bg-amber-900/20 rounded-xl flex items-center justify-center text-amber-600 dark:text-amber-400">
                 <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 002-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
               </div>
               <div>
                 <h3 class="font-bold text-slate-900 dark:text-white">{{ t('settings.roadmap.title') }}</h3>
                 <p class="text-xs text-slate-400 dark:text-slate-500 font-medium">Follow our development journey</p>
               </div>
            </div>
            <button
              @click="router.push('/settings/roadmap')"
              class="px-4 py-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl text-slate-600 dark:text-slate-300 font-bold text-sm transition-all active:scale-95 border border-gray-100 dark:border-slate-700"
            >
              View Roadmap
            </button>
          </div>
        </div>
      </section>

      <!-- Danger Zone -->
      <section class="space-y-4">
        <h2 class="px-2 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-red-500">Account</h2>
        <div class="premium-card bg-red-500/5 border-red-100 dark:border-red-900/30">
          <div class="p-6 flex items-center justify-between">
             <div class="flex items-center gap-4">
               <div class="w-10 h-10 bg-red-100 dark:bg-red-900/40 rounded-xl flex items-center justify-center text-red-600 dark:text-red-400">
                 <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
               </div>
               <div>
                 <h3 class="font-bold text-red-600 dark:text-red-400">{{ t('settings.account') }}</h3>
                 <p class="text-xs text-red-500/60 dark:text-red-400/50 font-medium">Safe travels, come back soon</p>
               </div>
             </div>
             <button
               @click="handleLogout"
               class="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-red-500/20 transition-all active:scale-95"
             >
               {{ t('common.logout') }}
             </button>
          </div>
        </div>
      </section>

      <!-- App Info -->
      <section class="space-y-4 pt-6 text-center">
        <div class="inline-flex flex-col items-center">
          <div class="bg-white dark:bg-slate-800 px-4 py-2 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 flex items-center gap-4 mb-4">
             <div class="text-left">
               <p class="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] leading-none mb-1">Version</p>
               <p class="text-sm font-bold text-slate-900 dark:text-slate-100 font-mono">{{ version }}</p>
             </div>
             <div class="w-px h-8 bg-gray-100 dark:bg-slate-700"></div>
             <button
                @click="checkForUpdates"
                class="text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 transition-colors"
              >
                {{ t('settings.check_for_updates') }}
              </button>
          </div>
          <p class="text-[10px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-widest">Crafted with ❤️ for Note2Self</p>
        </div>
      </section>
    </div>

    <AlertModal
      :isOpen="alertOpen"
      title="Updates"
      :message="alertMessage"
      @close="alertOpen = false"
    />
  </div>
</template>

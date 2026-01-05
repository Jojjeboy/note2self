<script setup lang="ts">
import { useTheme } from '@/composables/useTheme'
import { useAuth } from '@/composables/useAuth'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import ExportButton from '@/components/ExportButton.vue'
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
</script>

<template>
  <div class="p-6 max-w-2xl mx-auto">
    <h1 class="text-3xl font-bold mb-8 text-gray-900 dark:text-gray-100">{{ t('settings.title') }}</h1>

    <div class="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700">

      <!-- Language -->
      <div class="p-6 flex items-center justify-between">
        <div>
          <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">{{ t('common.language') }}</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">{{ t('settings.select_language') }}</p>
        </div>
        <select
          :value="locale"
          @change="changeLanguage"
          class="bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
        >
          <option value="en">English</option>
          <option value="sv">Svenska</option>
        </select>
      </div>

      <!-- Theme -->
      <div class="p-6 flex items-center justify-between">
        <div>
           <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">{{ t('common.theme') }}</h3>
           <p class="text-sm text-gray-500 dark:text-gray-400">{{ t('settings.dark_mode') }}</p>
        </div>
        <button
           @click="toggleTheme"
           class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
           :class="isDark ? 'bg-blue-600' : 'bg-gray-200'"
           role="switch"
           :aria-checked="isDark"
        >
            <span
              aria-hidden="true"
              class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
              :class="isDark ? 'translate-x-5' : 'translate-x-0'"
            />
        </button>
      </div>

      <!-- Data / Export -->
      <div class="p-6 flex items-center justify-between" v-if="currentWorkspace">
         <div>
            <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">Data</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">Export workspace data</p>
         </div>
         <ExportButton
            :workspaceId="currentWorkspace.id"
            :workspaceName="currentWorkspace.name"
         />
      </div>

      <!-- Account / Logout -->
      <div class="p-6 flex items-center justify-between">
         <div>
            <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">{{ t('settings.account') }}</h3>
         </div>
         <button
           @click="handleLogout"
           class="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-medium"
         >
           {{ t('common.logout') }}
         </button>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from '@/composables/useAuth'
import { useRouter } from 'vue-router'

const { loginWithGoogle } = useAuth()
const router = useRouter()

const handleLogin = async () => {
  try {
    await loginWithGoogle()
    router.push('/')
  } catch (error) {
    console.error('Login failed:', error)
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4 transition-colors duration-300">
    <div class="max-w-md w-full text-center space-y-8">
      <div class="space-y-4">
        <h1 class="text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          Note <span class="text-blue-600">2</span> Self
        </h1>
        <p class="text-lg text-gray-600 dark:text-gray-400">
          A minimalist, hierarchical Markdown note-taking system for your thoughts.
        </p>
      </div>

      <div class="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl dark:shadow-2xl border border-gray-100 dark:border-gray-700 transition-all">
        <div class="space-y-6">
          <div class="flex flex-col items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <svg class="w-12 h-12 text-blue-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <p>Sign in to sync your notes across devices</p>
          </div>

          <button
            @click="handleLogin"
            class="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl font-medium text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-sm"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" class="w-5 h-5" alt="Google logo">
            Sign in with Google
          </button>
        </div>
      </div>

      <p class="text-sm text-gray-500 dark:text-gray-500">
        Built with Vue 3, Tailwind CSS, and Firebase
      </p>
    </div>
  </div>
</template>

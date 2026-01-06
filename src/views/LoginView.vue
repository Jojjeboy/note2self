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
  <div class="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0f172a] p-6 transition-colors duration-500 overflow-hidden relative">
    <!-- Decorative background elements -->
    <div class="absolute top-[-10%] right-[-10%] w-96 h-96 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl"></div>
    <div class="absolute bottom-[-10%] left-[-10%] w-80 h-80 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl"></div>

    <div class="max-w-md w-full text-center space-y-12 relative z-10">
      <div class="space-y-6">
        <div class="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-3xl shadow-2xl shadow-blue-500/20 mb-4 transform -rotate-6 hover:rotate-0 transition-transform duration-500">
          <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </div>
        <div>
          <h1 class="text-6xl font-black tracking-tight text-slate-900 dark:text-white mb-4">
            Note<span class="text-blue-600">2</span>Self
          </h1>
          <p class="text-lg text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
            A minimalist, hierarchical Markdown note-taking system for your thoughts.
          </p>
        </div>
      </div>

      <div class="premium-card p-10 space-y-8 backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border-white/50 dark:border-slate-800/50">
        <div class="space-y-2">
          <h2 class="text-2xl font-bold text-slate-900 dark:text-white">Welcome back</h2>
          <p class="text-sm text-slate-500 dark:text-slate-400 font-medium">Log in to your account to continue</p>
        </div>

        <button
          @click="handleLogin"
          class="w-full flex items-center justify-center gap-4 px-8 py-4 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl font-bold text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:border-slate-200 dark:hover:border-slate-600 transition-all duration-300 shadow-sm active:scale-[0.98]"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" class="w-6 h-6" alt="Google logo">
          Sign in with Google
        </button>

        <div class="pt-2">
          <p class="text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
            By signing in, you agree to our terms of service and privacy policy.
            Your notes are encrypted and stored securely in the cloud.
          </p>
        </div>
      </div>

      <div class="flex items-center justify-center gap-6 opacity-50 grayscale transition-all hover:opacity-100 hover:grayscale-0">
        <div class="flex items-center gap-2">
          <div class="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Secure</span>
        </div>
        <div class="w-px h-4 bg-slate-300 dark:bg-slate-700"></div>
        <div class="flex items-center gap-2">
          <div class="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Fast</span>
        </div>
        <div class="w-px h-4 bg-slate-300 dark:bg-slate-700"></div>
        <div class="flex items-center gap-2">
          <div class="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
          <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Reliable</span>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup lang="ts">
import AppSidebar from '@/components/AppSidebar.vue'
import { useLayout } from '@/composables/useLayout'

const { isSidebarOpen, closeSidebar, toggleSidebar } = useLayout()
</script>

<template>
  <div class="flex h-screen bg-gray-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-500 overflow-hidden relative">

    <!-- Mobile Sidebar Backdrop -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
          v-if="isSidebarOpen"
          @click="closeSidebar"
          class="absolute inset-0 bg-slate-950/40 z-40 md:hidden backdrop-blur-md"
      ></div>
    </Transition>

    <!-- Sidebar (Responsive) -->
    <AppSidebar
        class="absolute inset-y-0 left-0 w-72 transform transition-all duration-500 ease-in-out md:relative md:transform-none z-50 shadow-2xl md:shadow-none"
        :class="isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'"
    />

    <!-- Main Content -->
    <main class="flex-1 flex flex-col min-w-0 bg-transparent relative">
       <!-- Top Bar -->
       <header class="h-16 flex items-center px-4 md:px-8 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl z-30 gap-4 shrink-0 border-b border-gray-200/50 dark:border-slate-800/50">
          <!-- Mobile Menu Button -->
          <button
            @click="toggleSidebar"
            class="md:hidden p-2 -ml-1 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
          </button>

          <div class="flex-1 flex items-center justify-between md:justify-start">
            <h1 class="font-bold text-xl tracking-tight md:hidden">
              Note<span class="text-blue-600">2</span>Self
            </h1>

            <!-- Breadcrumbs Portal (Desktop) -->
            <div id="header-portal" class="hidden md:flex flex-1 items-center"></div>

            <!-- Mobile Quick Action Placeholder or Profile -->
            <div class="md:hidden flex items-center gap-2">
               <!-- Future: Add mobile search or profile here -->
            </div>
          </div>
       </header>

      <!-- Page Content -->
      <div class="flex-1 overflow-auto relative">
        <div class="airy-container py-6 md:py-10">
          <slot />
        </div>
      </div>
    </main>
  </div>
</template>
```

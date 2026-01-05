<script setup lang="ts">
import AppSidebar from '@/components/AppSidebar.vue'
import { useLayout } from '@/composables/useLayout'

const { isSidebarOpen, closeSidebar, toggleSidebar } = useLayout()
</script>

<template>
  <div class="flex h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300 overflow-hidden relative">

    <!-- Mobile Sidebar Backdrop -->
    <div
        v-if="isSidebarOpen"
        @click="closeSidebar"
        class="absolute inset-0 bg-black/50 z-20 md:hidden backdrop-blur-sm"
    ></div>

    <!-- Sidebar (Responsive) -->
    <AppSidebar
        class="absolute inset-y-0 left-0 w-64 transform transition-transform duration-300 md:relative md:transform-none z-30"
        :class="isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'"
    />

    <!-- Main Content -->
    <main class="flex-1 flex flex-col min-w-0 bg-white dark:bg-gray-900">
       <!-- Top Bar with Hamburger -->
       <header class="h-14 border-b border-gray-200 dark:border-gray-800 flex items-center px-4 bg-white dark:bg-gray-900 z-10 gap-3 shrink-0">
          <!-- Mobile Menu Button -->
          <button
            @click="toggleSidebar"
            class="md:hidden p-2 -ml-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
          </button>

          <h1 class="font-bold text-lg tracking-tight md:hidden">
            Note <span class="text-blue-600">2</span> Self
          </h1>

          <!-- Breadcrumbs Portal (Desktop) -->
          <div id="header-portal" class="hidden md:flex flex-1 items-center"></div>
       </header>

      <!-- Page Content -->
      <div class="flex-1 overflow-auto p-4 md:p-8">
        <slot />
      </div>
    </main>
  </div>
</template>

import { ref } from 'vue'
import { useRouter } from 'vue-router'

const isSidebarOpen = ref(false)
let watcherInitialized = false

export function useLayout() {
  const router = useRouter()

  // Initialize the route watcher only once globally
  if (!watcherInitialized && router) {
    watcherInitialized = true

    // Watch for route changes and close sidebar
    router.afterEach(() => {
      isSidebarOpen.value = false
    })
  }

  const toggleSidebar = () => {
    isSidebarOpen.value = !isSidebarOpen.value
  }

  const closeSidebar = () => {
    isSidebarOpen.value = false
  }

  const openSidebar = () => {
    isSidebarOpen.value = true
  }

  return {
    isSidebarOpen,
    toggleSidebar,
    closeSidebar,
    openSidebar
  }
}

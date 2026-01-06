<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useRoadmap, type Priority } from '@/composables/useRoadmap'

const { t } = useI18n()
const router = useRouter()
const { items, addItem, toggleDone, deleteItem, loading } = useRoadmap()

const newItemTitle = ref('')
const newItemPriority = ref<Priority>('medium')

const handleAddItem = async () => {
    if (!newItemTitle.value.trim()) return
    await addItem(newItemTitle.value, newItemPriority.value)
    newItemTitle.value = ''
    newItemPriority.value = 'medium'
}

const getPriorityClass = (priority: Priority) => {
    switch (priority) {
        case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
        case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
        case 'low': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
        default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    }
}
</script>

<template>
  <div class="p-6 max-w-4xl mx-auto">
    <div class="flex items-center mb-8">
        <button
            @click="router.push('/settings')"
            class="mr-4 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
        </button>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100">{{ t('settings.roadmap.title') }}</h1>
    </div>

    <!-- Add Item Form -->
    <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700 mb-8">
        <h2 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">{{ t('settings.roadmap.add_item') }}</h2>
        <form @submit.prevent="handleAddItem" class="flex flex-col md:flex-row gap-4">
            <input
                v-model="newItemTitle"
                type="text"
                :placeholder="t('settings.roadmap.item_placeholder')"
                class="flex-1 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                required
            />
            <select
                v-model="newItemPriority"
                class="bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
            >
                <option value="low">{{ t('settings.roadmap.low') }}</option>
                <option value="medium">{{ t('settings.roadmap.medium') }}</option>
                <option value="high">{{ t('settings.roadmap.high') }}</option>
            </select>
            <button
                type="submit"
                class="px-5 py-2.5 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
                {{ t('common.create') }}
            </button>
        </form>
    </div>

    <!-- Roadmap List -->
    <div v-if="loading" class="text-center py-8">
        <p class="text-gray-500 dark:text-gray-400">Loading...</p>
    </div>
    <div v-else-if="items.length === 0" class="text-center py-8 bg-gray-50 dark:bg-gray-900 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
        <p class="text-gray-500 dark:text-gray-400">{{ t('settings.roadmap.no_items') }}</p>
    </div>
    <div v-else class="space-y-4">
        <div
            v-for="item in items"
            :key="item.id"
            class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700 flex items-center justify-between"
            :class="{ 'opacity-60': item.isDone }"
        >
            <div class="flex items-center space-x-4">
                <input
                    type="checkbox"
                    :checked="item.isDone"
                    @change="toggleDone(item)"
                    class="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <div>
                    <p
                        class="text-lg font-medium text-gray-900 dark:text-gray-100"
                        :class="{ 'line-through': item.isDone }"
                    >
                        {{ item.title }}
                    </p>
                    <span
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1"
                        :class="getPriorityClass(item.priority)"
                    >
                        {{ t(`settings.roadmap.${item.priority}`) }}
                    </span>
                </div>
            </div>
            <button
                @click="deleteItem(item.id)"
                class="text-gray-400 hover:text-red-600 dark:hover:text-red-400 p-2"
            >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
            </button>
        </div>
    </div>
  </div>
</template>

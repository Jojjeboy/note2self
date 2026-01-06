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
        case 'high': return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 ring-1 ring-red-200 dark:ring-red-900/50'
        case 'medium': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 ring-1 ring-amber-200 dark:ring-amber-900/50'
        case 'low': return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 ring-1 ring-slate-200 dark:ring-slate-700'
        default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800'
    }
}
</script>

<template>
  <div class="airy-container">
    <div class="flex items-center mb-8">
        <button
            @click="router.push('/settings')"
            class="mr-4 p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/50"
        >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
        </button>
        <h1 class="text-3xl font-bold text-slate-900 dark:text-white">{{ t('settings.roadmap.title') }}</h1>
    </div>

    <!-- Add Item Form -->
    <div class="premium-card mb-10">
        <h2 class="text-lg font-semibold text-slate-900 dark:text-white mb-6">{{ t('settings.roadmap.add_item') }}</h2>
        <form @submit.prevent="handleAddItem" class="flex flex-col md:flex-row gap-4">
            <input
                v-model="newItemTitle"
                type="text"
                :placeholder="t('settings.roadmap.item_placeholder')"
                class="flex-1 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 block p-3 transition-all"
                required
            />
            <select
                v-model="newItemPriority"
                class="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 block p-3 transition-all min-w-[120px]"
            >
                <option value="low">{{ t('settings.roadmap.low') }}</option>
                <option value="medium">{{ t('settings.roadmap.medium') }}</option>
                <option value="high">{{ t('settings.roadmap.high') }}</option>
            </select>
            <button
                type="submit"
                class="px-6 py-3 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-lg shadow-blue-500/20 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                :disabled="!newItemTitle.trim()"
            >
                {{ t('common.create') }}
            </button>
        </form>
    </div>

    <!-- Roadmap List -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-12">
        <div class="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-4"></div>
        <p class="text-slate-500 dark:text-slate-400 font-medium animate-pulse">{{ t('common.loading') }}</p>
    </div>

    <div v-else-if="items.length === 0" class="premium-card text-center py-16 border-dashed border-2">
        <div class="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
        </div>
        <p class="text-slate-500 dark:text-slate-400 font-medium">{{ t('settings.roadmap.no_items') }}</p>
    </div>

    <div v-else class="grid grid-cols-1 gap-4">
        <div
            v-for="item in items"
            :key="item.id"
            class="premium-card flex items-center justify-between group hover:border-slate-300 dark:hover:border-slate-700"
            :class="{ 'opacity-60 bg-slate-50/50 dark:bg-slate-900/50 grayscale-[0.5]': item.isDone }"
        >
            <div class="flex items-center space-x-6">
                <div class="relative flex items-center">
                    <input
                        type="checkbox"
                        :checked="item.isDone"
                        @change="toggleDone(item)"
                        class="w-6 h-6 text-blue-600 bg-slate-100 border-slate-300 rounded-lg focus:ring-blue-500/20 dark:focus:ring-blue-600/20 dark:ring-offset-slate-900 focus:ring-4 dark:bg-slate-800 dark:border-slate-700 cursor-pointer transition-all"
                    />
                </div>
                <div>
                    <p
                        class="text-lg font-semibold text-slate-900 dark:text-white transition-all"
                        :class="{ 'line-through text-slate-400 dark:text-slate-500': item.isDone }"
                    >
                        {{ item.title }}
                    </p>
                    <div class="flex items-center mt-2 gap-3">
                        <span
                            class="inline-flex items-center px-3 py-1 rounded-lg text-[10px] uppercase tracking-wider font-bold"
                            :class="getPriorityClass(item.priority)"
                        >
                            {{ t(`settings.roadmap.${item.priority}`) }}
                        </span>
                        <span v-if="item.isDone" class="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center">
                            <svg class="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                            </svg>
                            Completed
                        </span>
                    </div>
                </div>
            </div>

            <button
                @click="deleteItem(item.id)"
                class="text-slate-400 hover:text-red-500 dark:text-slate-600 dark:hover:text-red-400 p-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all opacity-0 group-hover:opacity-100"
                :title="t('common.delete')"
            >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
            </button>
        </div>
    </div>
  </div>
</template>


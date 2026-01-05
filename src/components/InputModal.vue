<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  isOpen: boolean
  title: string
  placeholder?: string
  defaultValue?: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit', value: string): void
}>()

const inputValue = ref(props.defaultValue || '')

const handleSubmit = () => {
  if (inputValue.value.trim()) {
    emit('submit', inputValue.value.trim())
    inputValue.value = ''
  }
}

const handleClose = () => {
  inputValue.value = ''
  emit('close')
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-700">
      <h3 class="text-lg font-bold mb-4 dark:text-white">{{ title }}</h3>

      <input
        v-model="inputValue"
        type="text"
        :placeholder="placeholder || 'Enter name...'"
        class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        @keyup.enter="handleSubmit"
        @keyup.escape="handleClose"
        autofocus
      />

      <div class="mt-6 flex justify-end gap-3">
        <button
          @click="handleClose"
          class="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button
          @click="handleSubmit"
          :disabled="!inputValue.trim()"
          class="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Create
        </button>
      </div>
    </div>
  </div>
</template>

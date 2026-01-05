<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import Editor from '@toast-ui/editor'
import '@toast-ui/editor/dist/toastui-editor.css'
import '@toast-ui/editor/dist/theme/toastui-editor-dark.css'

const props = defineProps<{
  modelValue: string
  theme?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const editorRef = ref<HTMLDivElement | null>(null)
let editorInstance: Editor | null = null

onMounted(() => {
  if (!editorRef.value) return

  editorInstance = new Editor({
    el: editorRef.value,
    initialEditType: 'wysiwyg',
    previewStyle: 'vertical',
    initialValue: props.modelValue,
    theme: props.theme,
    height: '100%',
    usageStatistics: false,
    toolbarItems: [
      ['heading', 'bold', 'italic', 'strike'],
      ['hr', 'quote'],
      ['ul', 'ol', 'task', 'indent', 'outdent'],
      ['table', 'image', 'link'],
      ['code', 'codeblock'],
    ],
    events: {
      change: () => {
        if (editorInstance) {
          emit('update:modelValue', editorInstance.getMarkdown())
        }
      }
    }
  })
})

// Correctly handle external content updates (e.g. switching notes)
watch(() => props.modelValue, (newValue) => {
  if (editorInstance && newValue !== editorInstance.getMarkdown()) {
    editorInstance.setMarkdown(newValue)
  }
})

// Handle dynamic theme switching
watch(() => props.theme, (newTheme) => {
    // Toast UI doesn't have a standardized dynamic theme switch method in the public API
    // that preserves state perfectly without destroy/recreate for major theme changes,
    // but for CSS-based themes, we rely on the class presence and the init option.
    // If strictly needed, we could destroy and recreate, but usually CSS handling is enough
    // if the 'toastui-editor-dark' class is toggled on a wrapper.
    // However, the 'theme' option adds specific internal classes.
    // For now, if theme changes, we recreate to be safe and consistent.
    if (editorInstance) {
        editorInstance.destroy()
        editorInstance = new Editor({
            el: editorRef.value!,
            initialEditType: 'wysiwyg',
            previewStyle: 'vertical',
            initialValue: props.modelValue,
            theme: newTheme,
            height: '100%',
            usageStatistics: false,
             toolbarItems: [
                ['heading', 'bold', 'italic', 'strike'],
                ['hr', 'quote'],
                ['ul', 'ol', 'task', 'indent', 'outdent'],
                ['table', 'image', 'link'],
                ['code', 'codeblock'],
            ],
            events: {
                change: () => {
                   if (editorInstance) emit('update:modelValue', editorInstance.getMarkdown())
                }
            }
        })
    }
})

onBeforeUnmount(() => {
  editorInstance?.destroy()
  editorInstance = null
})
</script>

<template>
  <div ref="editorRef" class="h-full w-full"></div>
</template>

<style>
/* App-specific overrides to match the clean design */
.toastui-editor-defaultUI {
    border: none !important;
}
.toastui-editor-toolbar {
    border-bottom: 1px solid #e5e7eb !important;
}
.dark .toastui-editor-toolbar {
    border-bottom: 1px solid #374151 !important;
    background-color: #111827 !important; /* gray-900 (page bg) */
}

/* Make content area distinct in dark mode */
.toastui-editor-contents {
    font-family: inherit !important;
}
.toastui-editor-ww-container {
    background-color: #ffffff;
}
.dark .toastui-editor-ww-container {
    background-color: #1f2937 !important; /* gray-800 - distinct from page bg #111827 */
}

/* Markdown mode distinction */
.dark .toastui-editor-md-container,
.dark .toastui-editor-md-container .toastui-editor {
    background-color: #1f2937 !important;
}

.toastui-editor-mode-switch {
    background-color: #f9fafb !important;
}
.dark .toastui-editor-mode-switch {
    background-color: #111827 !important;
    border-top: 1px solid #374151 !important;
}
</style>

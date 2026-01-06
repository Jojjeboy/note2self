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
    border-bottom: 1px solid #f1f5f9 !important; /* slate-100 */
    padding: 8px 16px !important;
}
.dark .toastui-editor-toolbar {
    border-bottom: 1px solid #1e293b !important; /* slate-800 */
    background-color: #0f172a !important; /* bg-dark */
}

/* Make content area distinct in dark mode */
.toastui-editor-contents {
    font-family: inherit !important;
    padding: 24px !important;
}
.toastui-editor-ww-container {
    background-color: #ffffff;
}
.dark .toastui-editor-ww-container {
    background-color: #1e293b !important; /* slate-800 */
}

/* Markdown mode distinction */
.dark .toastui-editor-md-container,
.dark .toastui-editor-md-container .toastui-editor {
    background-color: #1e293b !important;
}

.toastui-editor-mode-switch {
    background-color: #f8fafc !important; /* bg-light */
    border-top: 1px solid #f1f5f9 !important;
}
.dark .toastui-editor-mode-switch {
    background-color: #0f172a !important;
    border-top: 1px solid #1e293b !important;
}

.toastui-editor-defaultUI-toolbar button {
  border-radius: 8px !important;
  transition: all 0.2s !important;
}
.toastui-editor-defaultUI-toolbar button:hover {
  background-color: #eff6ff !important;
}
.dark .toastui-editor-defaultUI-toolbar button:hover {
  background-color: #1e3a8a !important;
}
</style>

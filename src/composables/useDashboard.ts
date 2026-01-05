import { ref, watchEffect } from 'vue'
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  limit
} from 'firebase/firestore'
import { db } from '@/firebase/config'
import { useAuth } from './useAuth'
import type { NoteItem } from './useNotes'

// Global recent notes across all workspaces for the user
export function useDashboard() {
  const { user } = useAuth()
  const recentItems = ref<NoteItem[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  watchEffect((onCleanup) => {
    if (!user.value) {
      recentItems.value = []
      return
    }

    loading.value = true
    // Need composite index for userId + updatedAt (or createdAt)
    // We'll use updated if we added it, but note model has createdAt only so far.
    // Let's assume we want 'most recently created' for now, or update note model to track 'updatedAt'.
    // User goal: "most recently updated files".
    // I should create updated_at field when editing. For now, fall back to createdAt or try updated.
    // Let's stick to createdAt for initial fetching to match existing data, but in Editor we will add updatedAt.
    // Actually, to display 'updated', we probably need that field.
    // Let's use 'createdAt' for now to avoid empty list if no updates made.

    // Note: 'items' collection. 'type' == 'note' (usually we want recently edited notes).

    const q = query(
      collection(db, 'items'),
      where('userId', '==', user.value.uid),
      where('type', '==', 'note'),
      orderBy('createdAt', 'desc'),
      limit(10)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      recentItems.value = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as NoteItem[]
      loading.value = false
    }, (err) => {
      console.error(err)
      error.value = err.message
      loading.value = false
    })

    onCleanup(() => unsubscribe())
  })

  return {
    recentItems,
    loading,
    error
  }
}

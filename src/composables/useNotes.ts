import { ref, watchEffect } from 'vue'
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  orderBy,
  Timestamp
} from 'firebase/firestore'
import { db } from '@/firebase/config'
import { useAuth } from './useAuth'

export interface NoteItem {
  id: string
  title: string
  type: 'folder' | 'note'
  parentId: string | null
  workspaceId: string
  userId: string
  content?: string
  createdAt: Timestamp
}

import { toValue, type MaybeRefOrGetter } from 'vue'

export function useNotes(workspaceId: MaybeRefOrGetter<string | undefined>) {
  const { user } = useAuth()
  const items = ref<NoteItem[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  watchEffect((onCleanup) => {
    const wsId = toValue(workspaceId)
    if (!user.value || !wsId) {
      items.value = []
      return
    }

    loading.value = true
    const q = query(
      collection(db, 'items'),
      where('userId', '==', user.value.uid),
      where('workspaceId', '==', wsId),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      items.value = snapshot.docs.map(doc => ({
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

  const createItem = async (title: string, type: 'folder' | 'note', parentId: string | null = null, content = '') => {
    const wsId = toValue(workspaceId)
    if (!user.value || !wsId) return
    error.value = null
    try {
      interface ItemData {
        title: string
        type: 'folder' | 'note'
        parentId: string | null
        workspaceId: string
        userId: string
        createdAt: ReturnType<typeof serverTimestamp>
        content?: string
      }

      const data: ItemData = {
        title,
        type,
        parentId,
        workspaceId: wsId,
        userId: user.value.uid,
        createdAt: serverTimestamp()
      }

      if (type === 'note') {
        data.content = content
      }

      await addDoc(collection(db, 'items'), data)
    } catch (err: unknown) {
      if (err instanceof Error) {
        error.value = err.message
      }
      throw err
    }
  }

  const deleteItem = async (id: string) => {
    if (!confirm('Area you sure you want to delete this item?')) return
    error.value = null
    try {
      await deleteDoc(doc(db, 'items', id))
      // Recursively delete children? For now, we leave them or orphaned.
      // Ideally handled by backend function or careful client logic (batch delete).
    } catch (err: unknown) {
      if (err instanceof Error) {
        error.value = err.message
      }
      throw err
    }
  }

  return {
    items,
    loading,
    error,
    createItem,
    deleteItem
  }
}

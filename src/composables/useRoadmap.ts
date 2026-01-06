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
  Timestamp,
  updateDoc
} from 'firebase/firestore'
import { db } from '@/firebase/config'
import { useAuth } from './useAuth'

export type Priority = 'low' | 'medium' | 'high'

export interface RoadmapItem {
  id: string
  title: string
  priority: Priority
  isDone: boolean
  userId: string
  createdAt: Timestamp
}

export function useRoadmap() {
  const { user } = useAuth()
  const items = ref<RoadmapItem[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  watchEffect((onCleanup) => {
    if (!user.value) {
      items.value = []
      return
    }

    loading.value = true
    const q = query(
      collection(db, 'roadmap'),
      where('userId', '==', user.value.uid),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      items.value = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as RoadmapItem[]
      loading.value = false
    }, (err) => {
      console.error(err)
      error.value = err.message
      loading.value = false
    })

    onCleanup(() => unsubscribe())
  })

  const addItem = async (title: string, priority: Priority) => {
    if (!user.value) return
    error.value = null
    try {
      await addDoc(collection(db, 'roadmap'), {
        title,
        priority,
        isDone: false,
        userId: user.value.uid,
        createdAt: serverTimestamp()
      })
    } catch (err: unknown) {
      if (err instanceof Error) {
        error.value = err.message
      }
      throw err
    }
  }

  const toggleDone = async (item: RoadmapItem) => {
    try {
      await updateDoc(doc(db, 'roadmap', item.id), {
        isDone: !item.isDone
      })
    } catch (err: unknown) {
      if (err instanceof Error) {
        error.value = err.message
      }
      throw err
    }
  }

  const deleteItem = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'roadmap', id))
    } catch (err: unknown) {
      if (err instanceof Error) {
        error.value = err.message
      }
      throw err
    }
  }

  const updatePriority = async (id: string, priority: Priority) => {
    try {
      await updateDoc(doc(db, 'roadmap', id), { priority })
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
    addItem,
    toggleDone,
    deleteItem,
    updatePriority
  }
}

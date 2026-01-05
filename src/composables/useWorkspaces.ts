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

export interface Workspace {
  id: string
  name: string
  userId: string
  createdAt: Timestamp
}

const currentWorkspace = ref<Workspace | null>(null)

export function useWorkspaces() {
  const { user } = useAuth()
  const workspaces = ref<Workspace[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Subscribe to workspaces for current user
  watchEffect((onCleanup) => {
    if (!user.value) {
      workspaces.value = []
      return
    }

    loading.value = true
    const q = query(
      collection(db, 'workspaces'),
      where('userId', '==', user.value.uid),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      workspaces.value = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Workspace[]

      // Select first workspace if none selected and workspaces exist
      if (!currentWorkspace.value && workspaces.value.length > 0) {
        currentWorkspace.value = workspaces.value[0] || null
      }

      loading.value = false
    }, (err) => {
      console.error(err)
      error.value = err.message
      loading.value = false
    })

    onCleanup(() => unsubscribe())
  })

  const createWorkspace = async (name: string) => {
    if (!user.value) return
    error.value = null
    try {
      const docRef = await addDoc(collection(db, 'workspaces'), {
        name,
        userId: user.value.uid,
        createdAt: serverTimestamp()
      })
      // Optionally switch to new workspace
      return docRef.id
    } catch (err: unknown) {
      if (err instanceof Error) {
        error.value = err.message
      }
      throw err
    }
  }

  const deleteWorkspace = async (id: string) => {
    if (!confirm('Are you sure you want to delete this workspace? All files inside will be hidden.')) return
    try {
      await deleteDoc(doc(db, 'workspaces', id))
      if (currentWorkspace.value?.id === id) {
        currentWorkspace.value = workspaces.value[0] || null
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        error.value = err.message
      }
      throw err
    }
  }

  const setCurrentWorkspace = (workspace: Workspace) => {
    currentWorkspace.value = workspace
  }

  const updateWorkspace = async (id: string, name: string) => {
    try {
      await updateDoc(doc(db, 'workspaces', id), { name })
    } catch (err: unknown) {
      if (err instanceof Error) {
        error.value = err.message
      }
      throw err
    }
  }

  return {
    workspaces,
    currentWorkspace,
    loading,
    error,
    createWorkspace,
    deleteWorkspace,
    setCurrentWorkspace,
    updateWorkspace
  }
}

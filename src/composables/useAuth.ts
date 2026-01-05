import { ref } from 'vue'
import { auth } from '@/firebase/config'
import {
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
  onAuthStateChanged,
  type User,
} from 'firebase/auth'

const user = ref<User | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

// Initialize auth state listener
onAuthStateChanged(auth, (currentUser) => {
  user.value = currentUser
  loading.value = false
})


export function useAuth() {
  const loginWithGoogle = async () => {
    error.value = null
    try {
      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)
    } catch (err: unknown) {
      if (err instanceof Error) {
        error.value = err.message
      }
      throw err
    }
  }

  const logout = async () => {
    error.value = null
    try {
      await signOut(auth)
    } catch (err: unknown) {
      if (err instanceof Error) {
        error.value = err.message
      }
      throw err
    }
  }

  const waitForAuth = () => {
    return new Promise<void>((resolve) => {
      if (!loading.value) {
        resolve()
        return
      }
      const unsubscribe = onAuthStateChanged(auth, () => {
        unsubscribe()
        resolve()
      })
    })
  }

  return {
    user,
    loading,
    error,
    loginWithGoogle,
    logout,
    waitForAuth,
  }
}

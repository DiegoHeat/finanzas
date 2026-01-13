import { useState, useEffect } from 'react'
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth'
import { auth } from '../firebase/config'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!auth) {
      console.warn('Auth no está disponible, usando modo sin autenticación')
      setLoading(false)
      return
    }

    try {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setUser(user)
        setLoading(false)
      }, (error) => {
        console.error('Error en autenticación:', error)
        setLoading(false)
      })

      // Timeout de seguridad - si después de 3 segundos no hay respuesta, dejar de cargar
      const timeout = setTimeout(() => {
        console.warn('Timeout en autenticación, continuando sin usuario')
        setLoading(false)
      }, 3000)

      return () => {
        unsubscribe()
        clearTimeout(timeout)
      }
    } catch (error) {
      console.error('Error inicializando autenticación:', error)
      setLoading(false)
    }
  }, [])

  const signIn = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      return { success: true, user: userCredential.user }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const signUp = async (email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      return { success: true, user: userCredential.user }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  return {
    user,
    loading,
    signIn,
    signUp,
    logout
  }
}

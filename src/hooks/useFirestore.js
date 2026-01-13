import { useState, useEffect } from 'react'
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  onSnapshot
} from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from './useAuth'

// Helper para obtener la referencia del documento del usuario
function getUserDocRef(userId, path) {
  return doc(db, `users/${userId}/${path}`)
}

// Hook para leer/escribir un documento específico
export function useFirestoreDoc(collectionPath, options = {}) {
  const { user } = useAuth()
  const [data, setData] = useState(options.initialValue || null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    const docRef = getUserDocRef(user.uid, collectionPath)
    
    // Si options.realtime es true, usar onSnapshot para actualizaciones en tiempo real
    if (options.realtime) {
      const unsubscribe = onSnapshot(
        docRef,
        (snapshot) => {
          if (snapshot.exists()) {
            setData(snapshot.data())
          } else {
            setData(options.initialValue || null)
          }
          setLoading(false)
          setError(null)
        },
        (err) => {
          setError(err)
          setLoading(false)
        }
      )

      return () => unsubscribe()
    } else {
      // Lectura única
      getDoc(docRef)
        .then((snapshot) => {
          if (snapshot.exists()) {
            setData(snapshot.data())
          } else {
            setData(options.initialValue || null)
          }
          setLoading(false)
        })
        .catch((err) => {
          setError(err)
          setLoading(false)
        })
    }
  }, [user, collectionPath, options.realtime])

  const updateData = async (newData) => {
    if (!user) return { success: false, error: 'No user logged in' }

    try {
      const docRef = getUserDocRef(user.uid, collectionPath)
      await setDoc(docRef, newData, { merge: true })
      return { success: true }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  return { data, loading, error, updateData }
}

// Hook para leer/escribir una colección
export function useFirestoreCollection(collectionPath, options = {}) {
  const { user } = useAuth()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    const collectionRef = collection(db, `users/${user.uid}/${collectionPath}`)
    
    if (options.realtime) {
      const unsubscribe = onSnapshot(
        collectionRef,
        (snapshot) => {
          const items = []
          snapshot.forEach((doc) => {
            items.push({ id: doc.id, ...doc.data() })
          })
          setData(items)
          setLoading(false)
          setError(null)
        },
        (err) => {
          setError(err)
          setLoading(false)
        }
      )

      return () => unsubscribe()
    } else {
      getDocs(collectionRef)
        .then((snapshot) => {
          const items = []
          snapshot.forEach((doc) => {
            items.push({ id: doc.id, ...doc.data() })
          })
          setData(items)
          setLoading(false)
        })
        .catch((err) => {
          setError(err)
          setLoading(false)
        })
    }
  }, [user, collectionPath, options.realtime])

  const addItem = async (item) => {
    if (!user) return { success: false, error: 'No user logged in' }

    try {
      const collectionRef = collection(db, `users/${user.uid}/${collectionPath}`)
      const docRef = doc(collectionRef)
      await setDoc(docRef, { ...item, id: docRef.id })
      return { success: true, id: docRef.id }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  const updateItem = async (itemId, updates) => {
    if (!user) return { success: false, error: 'No user logged in' }

    try {
      const docRef = doc(db, `users/${user.uid}/${collectionPath}/${itemId}`)
      await updateDoc(docRef, updates)
      return { success: true }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  const deleteItem = async (itemId) => {
    if (!user) return { success: false, error: 'No user logged in' }

    try {
      const docRef = doc(db, `users/${user.uid}/${collectionPath}/${itemId}`)
      await setDoc(docRef, { deleted: true }, { merge: true })
      return { success: true }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  return { data, loading, error, addItem, updateItem, deleteItem }
}

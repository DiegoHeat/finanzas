import { useState, useEffect, useMemo } from 'react'
import { doc, getDoc, setDoc, collection, getDocs, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from './useAuth'

// Formato de clave: "YYYY-MM"
function getMonthKey(year, month) {
  return `${year}-${String(month + 1).padStart(2, '0')}`
}

// Obtener mes actual
function getCurrentMonthKey() {
  const now = new Date()
  return getMonthKey(now.getFullYear(), now.getMonth())
}

// Migrar datos de localStorage a Firestore
async function migrateLocalStorageToFirestore(userId) {
  try {
    const monthlyData = localStorage.getItem('monthlyData')
    const baseExpenses = localStorage.getItem('baseExpenses')
    const currentMonthKey = localStorage.getItem('currentMonthKey') || getCurrentMonthKey()

    if (monthlyData) {
      const data = JSON.parse(monthlyData)
      const userDocRef = doc(db, `users/${userId}/data/monthlyData`)
      await setDoc(userDocRef, data, { merge: true })
    }

    if (baseExpenses) {
      const expenses = JSON.parse(baseExpenses)
      const expensesRef = collection(db, `users/${userId}/baseExpenses`)
      // Guardar cada gasto base
      for (const expense of expenses) {
        const expenseDocRef = doc(expensesRef, String(expense.id))
        await setDoc(expenseDocRef, expense)
      }
    }

    if (currentMonthKey) {
      const settingsRef = doc(db, `users/${userId}/data/settings`)
      await setDoc(settingsRef, { currentMonthKey }, { merge: true })
    }

    // Marcar migración como completada
    const migrationRef = doc(db, `users/${userId}/data/migration`)
    await setDoc(migrationRef, { migrated: true, date: new Date().toISOString() }, { merge: true })

    return true
  } catch (error) {
    console.error('Error migrating data:', error)
    return false
  }
}

export function useMonthlyDataFirebase() {
  const { user, loading: authLoading } = useAuth()
  const [currentMonthKey, setCurrentMonthKey] = useState(getCurrentMonthKey())
  const [baseExpenses, setBaseExpenses] = useState([])
  const [allMonthlyData, setAllMonthlyData] = useState({})
  const [loading, setLoading] = useState(true)
  const [migrationDone, setMigrationDone] = useState(false)

  // Cargar datos desde Firestore
  useEffect(() => {
    if (authLoading) return

    if (!user) {
      // Si no hay usuario, usar localStorage como fallback
      try {
        const saved = localStorage.getItem('currentMonthKey')
        if (saved) setCurrentMonthKey(saved)
        
        const localBaseExpenses = localStorage.getItem('baseExpenses')
        if (localBaseExpenses) {
          try {
            setBaseExpenses(JSON.parse(localBaseExpenses))
          } catch (e) {
            console.error('Error parsing baseExpenses:', e)
            setBaseExpenses([])
          }
        }

        const localMonthlyData = localStorage.getItem('monthlyData')
        if (localMonthlyData) {
          try {
            setAllMonthlyData(JSON.parse(localMonthlyData))
          } catch (e) {
            console.error('Error parsing monthlyData:', e)
            setAllMonthlyData({})
          }
        }

        setLoading(false)
      } catch (error) {
        console.error('Error loading from localStorage:', error)
        setLoading(false)
      }
      return
    }

    // Usuario autenticado - cargar desde Firestore
    const loadData = async () => {
      try {
        // Verificar si ya se migró
        const migrationRef = doc(db, `users/${user.uid}/data/migration`)
        const migrationDoc = await getDoc(migrationRef)
        
        if (!migrationDoc.exists() || !migrationDoc.data().migrated) {
          // Migrar datos de localStorage a Firestore
          await migrateLocalStorageToFirestore(user.uid)
          setMigrationDone(true)
        }

        // Cargar currentMonthKey
        const settingsRef = doc(db, `users/${user.uid}/data/settings`)
        const settingsDoc = await getDoc(settingsRef)
        if (settingsDoc.exists() && settingsDoc.data().currentMonthKey) {
          setCurrentMonthKey(settingsDoc.data().currentMonthKey)
        }

        // Cargar baseExpenses en tiempo real
        const expensesRef = collection(db, `users/${user.uid}/baseExpenses`)
        const unsubscribeExpenses = onSnapshot(expensesRef, (snapshot) => {
          const expenses = []
          snapshot.forEach((doc) => {
            expenses.push({ id: doc.id, ...doc.data() })
          })
          setBaseExpenses(expenses)
        })

        // Cargar monthlyData
        const monthlyDataRef = doc(db, `users/${user.uid}/data/monthlyData`)
        const unsubscribeMonthly = onSnapshot(monthlyDataRef, (snapshot) => {
          if (snapshot.exists()) {
            setAllMonthlyData(snapshot.data())
          } else {
            setAllMonthlyData({})
          }
        })

        setLoading(false)

        return () => {
          unsubscribeExpenses()
          unsubscribeMonthly()
        }
      } catch (error) {
        console.error('Error loading data:', error)
        setLoading(false)
      }
    }

    loadData()
  }, [user, authLoading])

  // Datos del mes actual
  const currentMonthData = useMemo(() => {
    return allMonthlyData[currentMonthKey] || { weeks: [], expenses: [] }
  }, [allMonthlyData, currentMonthKey])

  // Copiar gastos base automáticamente cuando se cambia de mes
  useEffect(() => {
    if (baseExpenses.length === 0 || !user || loading) return
    
    setAllMonthlyData(prev => {
      const current = prev[currentMonthKey] || { weeks: [], expenses: [] }
      
      // Si el mes no tiene gastos pero hay gastos base, copiarlos
      if (current.expenses.length === 0) {
        const copiedExpenses = baseExpenses.map((expense, index) => ({
          ...expense,
          id: `${expense.id}-${currentMonthKey}-${Date.now()}-${index}`,
          monthKey: currentMonthKey
        }))
        
        return {
          ...prev,
          [currentMonthKey]: {
            ...current,
            expenses: copiedExpenses
          }
        }
      }
      return prev
    })
  }, [currentMonthKey, baseExpenses.length, user, loading])

  // Guardar datos cuando cambien
  useEffect(() => {
    if (!user) {
      // Fallback a localStorage si no hay usuario
      localStorage.setItem('monthlyData', JSON.stringify(allMonthlyData))
      localStorage.setItem('currentMonthKey', currentMonthKey)
      localStorage.setItem('baseExpenses', JSON.stringify(baseExpenses))
      return
    }

    // Guardar en Firestore
    const saveData = async () => {
      try {
        // Guardar monthlyData
        const monthlyDataRef = doc(db, `users/${user.uid}/data/monthlyData`)
        await setDoc(monthlyDataRef, allMonthlyData, { merge: true })

        // Guardar currentMonthKey
        const settingsRef = doc(db, `users/${user.uid}/data/settings`)
        await setDoc(settingsRef, { currentMonthKey }, { merge: true })

        // Guardar baseExpenses (ya se guarda automáticamente con onSnapshot)
      } catch (error) {
        console.error('Error saving data:', error)
      }
    }

    saveData()
  }, [allMonthlyData, currentMonthKey, baseExpenses, user])

  // Actualizar datos del mes actual
  const updateCurrentMonthData = (updater) => {
    setAllMonthlyData(prev => {
      const current = prev[currentMonthKey] || { weeks: [], expenses: [] }
      const updated = updater instanceof Function ? updater(current) : updater
      return {
        ...prev,
        [currentMonthKey]: updated
      }
    })
  }

  // Cambiar de mes
  const changeMonth = (year, month) => {
    const newKey = getMonthKey(year, month)
    setCurrentMonthKey(newKey)
  }

  // Obtener lista de meses disponibles
  const availableMonths = useMemo(() => {
    return Object.keys(allMonthlyData)
      .filter(key => {
        const data = allMonthlyData[key]
        return (data.weeks && data.weeks.length > 0) || (data.expenses && data.expenses.length > 0)
      })
      .sort()
      .reverse()
  }, [allMonthlyData])

  // Actualizar gastos base
  const updateBaseExpenses = async (updater) => {
    if (!user) {
      // Fallback a localStorage
      setBaseExpenses(prev => {
        const updated = updater instanceof Function ? updater(prev) : updater
        return updated
      })
      return
    }

    // Actualizar en Firestore
    const updated = updater instanceof Function ? updater(baseExpenses) : updater
    
    try {
      const expensesRef = collection(db, `users/${user.uid}/baseExpenses`)
      
      // Eliminar todos los gastos existentes
      const snapshot = await getDocs(expensesRef)
      const deletePromises = snapshot.docs.map(doc => doc.ref.delete())
      await Promise.all(deletePromises)

      // Agregar los nuevos gastos
      const addPromises = updated.map(expense => {
        const expenseDocRef = doc(expensesRef, String(expense.id))
        return setDoc(expenseDocRef, expense)
      })
      await Promise.all(addPromises)
    } catch (error) {
      console.error('Error updating base expenses:', error)
    }
  }

  return {
    currentMonthKey,
    currentMonthData,
    updateCurrentMonthData,
    changeMonth,
    availableMonths,
    getCurrentMonthKey,
    baseExpenses,
    updateBaseExpenses,
    loading: loading || authLoading
  }
}

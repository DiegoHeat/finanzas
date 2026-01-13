import { useState, useEffect, useMemo } from 'react'

// Formato de clave: "YYYY-MM"
function getMonthKey(year, month) {
  return `${year}-${String(month + 1).padStart(2, '0')}`
}

// Obtener mes actual
function getCurrentMonthKey() {
  const now = new Date()
  return getMonthKey(now.getFullYear(), now.getMonth())
}

export function useMonthlyData() {
  const [currentMonthKey, setCurrentMonthKey] = useState(() => {
    const saved = localStorage.getItem('currentMonthKey')
    return saved || getCurrentMonthKey()
  })

  // Cargar gastos base/plantilla
  const [baseExpenses, setBaseExpenses] = useState(() => {
    try {
      const data = localStorage.getItem('baseExpenses')
      if (data) {
        return JSON.parse(data)
      }
      // Migrar gastos antiguos si existen
      const oldExpenses = localStorage.getItem('expenses')
      if (oldExpenses) {
        const parsed = JSON.parse(oldExpenses)
        localStorage.setItem('baseExpenses', oldExpenses)
        localStorage.removeItem('expenses')
        return parsed
      }
      return []
    } catch (error) {
      console.error(error)
      return []
    }
  })

  // Cargar todos los datos mensuales
  const [allMonthlyData, setAllMonthlyData] = useState(() => {
    try {
      const data = localStorage.getItem('monthlyData')
      return data ? JSON.parse(data) : {}
    } catch (error) {
      console.error(error)
      return {}
    }
  })

  // Datos del mes actual
  const currentMonthData = useMemo(() => {
    return allMonthlyData[currentMonthKey] || { weeks: [], expenses: [] }
  }, [allMonthlyData, currentMonthKey])

  // Copiar gastos base automáticamente cuando se cambia de mes
  useEffect(() => {
    if (baseExpenses.length === 0) return
    
    setAllMonthlyData(prev => {
      const current = prev[currentMonthKey] || { weeks: [], expenses: [] }
      
      // Si el mes no tiene gastos pero hay gastos base, copiarlos
      if (current.expenses.length === 0) {
        const copiedExpenses = baseExpenses.map((expense, index) => ({
          ...expense,
          id: `${expense.id}-${currentMonthKey}-${Date.now()}-${index}`, // ID único por mes
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
  }, [currentMonthKey, baseExpenses.length]) // Solo dependemos de la longitud, no del array completo

  // Guardar datos cuando cambien
  useEffect(() => {
    localStorage.setItem('monthlyData', JSON.stringify(allMonthlyData))
    localStorage.setItem('currentMonthKey', currentMonthKey)
    localStorage.setItem('baseExpenses', JSON.stringify(baseExpenses))
  }, [allMonthlyData, currentMonthKey, baseExpenses])

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
      .reverse() // Más recientes primero
  }, [allMonthlyData])

  // Actualizar gastos base
  const updateBaseExpenses = (updater) => {
    setBaseExpenses(prev => {
      const updated = updater instanceof Function ? updater(prev) : updater
      return updated
    })
  }

  return {
    currentMonthKey,
    currentMonthData,
    updateCurrentMonthData,
    changeMonth,
    availableMonths,
    getCurrentMonthKey,
    baseExpenses,
    updateBaseExpenses
  }
}

import { useState, useEffect } from 'react'
import { useAuth } from './useAuth'

export function useTour() {
  const { user, loading: authLoading } = useAuth()
  const [runTour, setRunTour] = useState(false)
  const [isFirstTime, setIsFirstTime] = useState(false)

  useEffect(() => {
    // Esperar a que la autenticación termine
    if (authLoading) return

    // Verificar si el usuario ya completó el tour
    const checkTourStatus = () => {
      try {
        if (user) {
          const completed = localStorage.getItem(`tourCompleted_${user.uid}`)
          return !completed
        } else {
          const completed = localStorage.getItem('tourCompleted')
          return !completed
        }
      } catch (error) {
        console.error('Error checking tour status:', error)
        return false
      }
    }

    const shouldShowTour = checkTourStatus()
    setIsFirstTime(shouldShowTour)
  }, [user, authLoading])

  const startTour = () => {
    setRunTour(true)
  }

  const stopTour = () => {
    setRunTour(false)
    if (user) {
      localStorage.setItem(`tourCompleted_${user.uid}`, 'true')
    } else {
      localStorage.setItem('tourCompleted', 'true')
    }
    setIsFirstTime(false)
  }

  const resetTour = () => {
    if (user) {
      localStorage.removeItem(`tourCompleted_${user.uid}`)
    } else {
      localStorage.removeItem('tourCompleted')
    }
    setIsFirstTime(true)
    setRunTour(true)
  }

  return {
    runTour,
    isFirstTime,
    startTour,
    stopTour,
    resetTour
  }
}

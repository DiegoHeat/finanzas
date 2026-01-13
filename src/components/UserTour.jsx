import { useState, useEffect } from 'react'
import Joyride from 'react-joyride'
import { useAuth } from '../hooks/useAuth'
import './UserTour.css'

function UserTour({ run, onComplete }) {
  const { user } = useAuth()
  const [steps, setSteps] = useState([])

  useEffect(() => {
    // Definir los pasos del tour
    const tourSteps = [
      {
        target: '.month-selector',
        content: 'Aquí puedes seleccionar el mes que quieres gestionar. Usa las flechas o el selector para cambiar de mes.',
        placement: 'bottom',
        disableBeacon: true,
      },
      {
        target: '.dashboard',
        content: 'Este es tu resumen financiero. Aquí verás el estado de tus finanzas, balance mensual y tus gastos principales.',
        placement: 'top',
      },
      {
        target: '.salary-section',
        content: 'Registra aquí tu sueldo semanal cada vez que recibas tu pago (viernes). La app calculará automáticamente cuánto necesitas guardar.',
        placement: 'top',
      },
      {
        target: '.expense-buttons',
        content: 'Agrega tus gastos mensuales aquí. "Agregar a Plantilla" los repetirá cada mes, "Solo Este Mes" es para gastos temporales.',
        placement: 'bottom',
      },
      {
        target: '.btn-export-pdf',
        content: 'Exporta un reporte completo en PDF con todos tus datos financieros del mes seleccionado.',
        placement: 'left',
      },
      {
        target: '.distribution-section',
        content: 'Aquí verás gráficos visuales de cómo se distribuye tu sueldo entre tus gastos mensuales.',
        placement: 'top',
      },
    ]

    setSteps(tourSteps)
  }, [])

  const handleJoyrideCallback = (data) => {
    const { status, type } = data

    if (status === 'finished' || status === 'skipped') {
      // Marcar el tour como completado
      if (user) {
        localStorage.setItem(`tourCompleted_${user.uid}`, 'true')
      } else {
        localStorage.setItem('tourCompleted', 'true')
      }
      onComplete()
    }
  }

  const styles = {
    options: {
      primaryColor: '#000',
      textColor: '#000',
      backgroundColor: '#fff',
      overlayColor: 'rgba(0, 0, 0, 0.5)',
      arrowColor: '#fff',
      zIndex: 10000,
    },
    tooltip: {
      borderRadius: 8,
      fontSize: 14,
    },
    buttonNext: {
      backgroundColor: '#000',
      color: '#fff',
      fontSize: 14,
      fontWeight: 600,
      padding: '10px 20px',
      borderRadius: 6,
    },
    buttonBack: {
      color: '#000',
      fontSize: 14,
      marginRight: 10,
    },
    buttonSkip: {
      color: '#666',
      fontSize: 14,
    },
  }

  const locale = {
    back: 'Atrás',
    close: 'Cerrar',
    last: 'Finalizar',
    next: 'Siguiente',
    open: 'Abrir',
    skip: 'Saltar tour',
  }

  // No renderizar si no hay pasos o si no se debe ejecutar
  if (!run || steps.length === 0) {
    return null
  }

  // Si no hay elementos objetivo, no renderizar
  if (typeof document === 'undefined') {
    return null
  }

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous={true}
      showProgress={true}
      showSkipButton={true}
      callback={handleJoyrideCallback}
      styles={styles}
      locale={locale}
      floaterProps={{
        disableAnimation: false,
      }}
    />
  )
}

export default UserTour

import { useState, useMemo, useEffect, useRef } from 'react'
import { useAuth } from './hooks/useAuth'
import { useMonthlyDataFirebase } from './hooks/useMonthlyDataFirebase'
import { useToast } from './hooks/useToast'
import Auth from './components/Auth'
import MonthSelector from './components/MonthSelector'
import SalaryInput from './components/SalaryInput'
import DebtForm from './components/DebtForm'
import DebtList from './components/DebtList'
import DistributionChart from './components/DistributionChart'
import ExportPDF from './components/ExportPDF'
import Dashboard from './components/Dashboard'
import ToastContainer from './components/ToastContainer'
import UpcomingPayments from './components/UpcomingPayments'

function App() {
  const { user, loading: authLoading, logout } = useAuth()
  const { toasts, removeToast, success, error, warning } = useToast()
  
  // Tour deshabilitado temporalmente - usar valores por defecto
  const runTour = false
  const isFirstTime = false
  const stopTour = () => {}
  const startTour = () => {}
  
  const {
    currentMonthKey,
    currentMonthData,
    updateCurrentMonthData,
    changeMonth,
    availableMonths,
    baseExpenses,
    updateBaseExpenses,
    loading: dataLoading
  } = useMonthlyDataFirebase()

  const [editingExpense, setEditingExpense] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [isEditingBaseExpense, setIsEditingBaseExpense] = useState(false)
  
  // Timeouts - deben estar ANTES de cualquier return condicional
  const [authTimeout, setAuthTimeout] = useState(false)
  const [dataTimeout, setDataTimeout] = useState(false)
  const hasShownWarning = useRef(false)

  // TODOS los useEffect deben estar ANTES de cualquier return condicional
  useEffect(() => {
    const timer = setTimeout(() => {
      if (authLoading) {
        console.warn('Timeout en autenticación, continuando...')
        setAuthTimeout(true)
      }
    }, 3000)
    return () => clearTimeout(timer)
  }, [authLoading])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (dataLoading) {
        console.warn('Timeout cargando datos, continuando...')
        setDataTimeout(true)
      }
    }, 3000)
    return () => clearTimeout(timer)
  }, [dataLoading])

  const weeks = currentMonthData.weeks || []
  const expenses = currentMonthData.expenses || []

  // Calcular cuántos viernes hay en el mes seleccionado
  const getFridaysInMonth = (monthKey) => {
    const [year, month] = monthKey.split('-').map(Number)
    
    const firstDay = new Date(year, month - 1, 1)
    const lastDay = new Date(year, month, 0)
    
    let fridays = 0
    let currentDate = new Date(firstDay)
    
    while (currentDate <= lastDay) {
      if (currentDate.getDay() === 5) {
        fridays++
      }
      currentDate.setDate(currentDate.getDate() + 1)
    }
    
    return fridays
  }

  const fridaysInMonth = getFridaysInMonth(currentMonthKey)

  // Calcular total mensual y promedio semanal
  const totalMonthlyIncome = useMemo(() => {
    return weeks.reduce((sum, week) => sum + week.amount, 0)
  }, [weeks])

  const averageWeeklySalary = useMemo(() => {
    return weeks.length > 0 ? totalMonthlyIncome / weeks.length : 0
  }, [weeks, totalMonthlyIncome])

  // Calcular distribución semanal para gastos mensuales
  const weeklyDistribution = useMemo(() => {
    if (fridaysInMonth === 0 || expenses.length === 0) {
      return {}
    }

    const totalMonthlyExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)
    
    if (totalMonthlyExpenses === 0) {
      return {}
    }

    // Calcular cuánto debe guardar cada semana para cada gasto mensual
    const distribution = {}
    expenses.forEach(expense => {
      // Dividir el gasto mensual entre los viernes del mes
      distribution[expense.id] = expense.amount / fridaysInMonth
    })

    return distribution
  }, [expenses, fridaysInMonth])

  // Calcular si el sueldo semanal promedio es suficiente
  const totalWeeklyNeeded = useMemo(() => {
    return Object.values(weeklyDistribution).reduce((sum, amount) => sum + amount, 0)
  }, [weeklyDistribution])

  const totalMonthlyExpenses = useMemo(() => {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0)
  }, [expenses])

  // Mostrar alertas si hay problemas financieros (solo una vez)
  // Este useEffect debe estar después de los cálculos pero antes de los returns
  useEffect(() => {
    if (totalWeeklyNeeded > 0 && averageWeeklySalary > 0 && !hasShownWarning.current) {
      const weeklyBalance = averageWeeklySalary - totalWeeklyNeeded
      if (weeklyBalance < 0) {
        setTimeout(() => {
          warning(`Atención: Necesitas $${Math.abs(weeklyBalance).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} más por semana`)
          hasShownWarning.current = true
        }, 2000)
      }
    }
    // Reset cuando cambian los valores significativamente
    if (Math.abs(averageWeeklySalary - totalWeeklyNeeded) > 100) {
      hasShownWarning.current = false
    }
  }, [totalWeeklyNeeded, averageWeeklySalary, warning])

  // Funciones para gestionar semanas
  const handleAddWeek = (amount) => {
    const newWeek = {
      id: Date.now(),
      amount: amount,
      date: new Date().toISOString()
    }
    updateCurrentMonthData(prev => ({
      ...prev,
      weeks: [...(prev.weeks || []), newWeek]
    }))
    success(`Semana guardada: $${amount.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)
  }

  const handleDeleteWeek = (weekId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta semana?')) {
      updateCurrentMonthData(prev => ({
        ...prev,
        weeks: (prev.weeks || []).filter(w => w.id !== weekId)
      }))
      success('Semana eliminada')
    }
  }

  const handleEditWeek = (weekId, newAmount) => {
    updateCurrentMonthData(prev => ({
      ...prev,
      weeks: (prev.weeks || []).map(w => w.id === weekId ? { ...w, amount: newAmount } : w)
    }))
  }

  const handleAddExpense = (expense) => {
    if (isEditingBaseExpense) {
      // Editar gasto base
      if (editingExpense) {
        updateBaseExpenses(prev => 
          prev.map(e => e.id === expense.id ? expense : e)
        )
        // Actualizar también en todos los meses que tengan este gasto
        updateCurrentMonthData(prev => ({
          ...prev,
          expenses: (prev.expenses || []).map(e => {
            // Si el gasto tiene el mismo ID base, actualizarlo
            const baseId = e.id.split('-')[0]
            return baseId === String(expense.id) ? { ...e, ...expense, id: e.id } : e
          })
        }))
        setEditingExpense(null)
        setIsEditingBaseExpense(false)
        success('Gasto de plantilla actualizado')
      } else {
        // Agregar nuevo gasto base
        const newExpense = {
          ...expense,
          id: Date.now()
        }
        updateBaseExpenses(prev => [...prev, newExpense])
        // Agregar también al mes actual
        updateCurrentMonthData(prev => ({
          ...prev,
          expenses: [...(prev.expenses || []), {
            ...newExpense,
            id: `${newExpense.id}-${currentMonthKey}-${Date.now()}`,
            monthKey: currentMonthKey
          }]
        }))
        success('Gasto agregado a la plantilla')
      }
    } else {
      // Editar gasto del mes actual
      if (editingExpense) {
        updateCurrentMonthData(prev => ({
          ...prev,
          expenses: (prev.expenses || []).map(e => e.id === expense.id ? expense : e)
        }))
        setEditingExpense(null)
        success('Gasto actualizado')
      } else {
        // Agregar nuevo gasto solo al mes actual
        updateCurrentMonthData(prev => ({
          ...prev,
          expenses: [...(prev.expenses || []), expense]
        }))
        success('Gasto agregado')
      }
    }
    setShowForm(false)
  }

  const handleEditExpense = (expense, isBase = false) => {
    setEditingExpense(expense)
    setIsEditingBaseExpense(isBase)
    setShowForm(true)
  }

  const handleDeleteExpense = (expenseId, isBase = false) => {
    if (isBase) {
      if (window.confirm('¿Estás seguro de que quieres eliminar este gasto de la plantilla? Esto lo eliminará de todos los meses futuros.')) {
        updateBaseExpenses(prev => prev.filter(e => e.id !== expenseId))
        // Eliminar también de todos los meses
        updateCurrentMonthData(prev => ({
          ...prev,
          expenses: (prev.expenses || []).filter(e => {
            const baseId = e.id.split('-')[0]
            return baseId !== String(expenseId)
          })
        }))
        success('Gasto eliminado de la plantilla')
      }
    } else {
      if (window.confirm('¿Estás seguro de que quieres eliminar este gasto de este mes?')) {
        updateCurrentMonthData(prev => ({
          ...prev,
          expenses: (prev.expenses || []).filter(e => e.id !== expenseId)
        }))
        success('Gasto eliminado')
      }
    }
  }

  const handleChangeMonth = (year, month) => {
    changeMonth(year, month)
    setEditingExpense(null)
    setShowForm(false)
  }

  const handleCancelForm = () => {
    setEditingExpense(null)
    setShowForm(false)
    setIsEditingBaseExpense(false)
  }

  // Cerrar modal con tecla Escape
  useEffect(() => {
    if (!showForm || !editingExpense) return
    
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        handleCancelForm()
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [showForm, editingExpense]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleLogout = async () => {
    if (window.confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      await logout()
    }
  }

  if (authLoading && !authTimeout) {
    return (
      <div className="app">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          fontSize: '1.2rem',
          color: '#666'
        }}>
          Cargando...
        </div>
      </div>
    )
  }

  // Mostrar pantalla de autenticación si no hay usuario
  if (!user) {
    return <Auth />
  }

  // Mostrar pantalla de carga mientras se cargan los datos
  if (dataLoading && !dataTimeout) {
    return (
      <div className="app">
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          fontSize: '1.2rem',
          color: '#666',
          gap: '20px'
        }}>
          <div>Cargando tus datos...</div>
          <div style={{ fontSize: '0.9rem', color: '#999' }}>Si esto tarda mucho, hay un problema</div>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      {/* Tour deshabilitado temporalmente para debugging */}
      {/* {!dataLoading && runTour && <UserTour run={runTour} onComplete={stopTour} />} */}
      {/* {!dataLoading && isFirstTime && !runTour && (
        <div className="tour-welcome" onClick={(e) => {
          if (e.target.classList.contains('tour-welcome')) {
            stopTour()
          }
        }}>
          <div className="tour-welcome-content" onClick={(e) => e.stopPropagation()}>
            <h2>¡Bienvenido! 👋</h2>
            <p>Te guiaremos por la aplicación para que aprendas a usarla.</p>
            <div className="tour-welcome-actions">
              <button onClick={startTour} className="btn-tour-start">
                Iniciar Tour
              </button>
              <button onClick={stopTour} className="btn-tour-skip">
                Saltar
              </button>
            </div>
          </div>
        </div>
      )} */}
      <header className="app-header">
        <div className="header-content">
          <div>
            <h1>💰 Gestión de Finanzas</h1>
            <p>Distribuye tu sueldo semanal para cubrir todos tus gastos mensuales</p>
            <div className="user-info">
              <span className="user-email">{user.email}</span>
              <button onClick={handleLogout} className="btn-logout">
                Cerrar Sesión
              </button>
            </div>
          </div>
          <ExportPDF
            monthKey={currentMonthKey}
            weeks={weeks}
            expenses={expenses}
            weeklyDistribution={weeklyDistribution}
            totalMonthlyIncome={totalMonthlyIncome}
            totalMonthlyExpenses={totalMonthlyExpenses}
            averageWeeklySalary={averageWeeklySalary}
            totalWeeklyNeeded={totalWeeklyNeeded}
            fridaysInMonth={fridaysInMonth}
          />
        </div>
      </header>

      <main className="app-main">
        <section className="month-selector-section">
          <div className="month-selector">
            <MonthSelector 
              currentMonthKey={currentMonthKey}
              onChangeMonth={handleChangeMonth}
              availableMonths={availableMonths}
            />
          </div>
        </section>

        <section className="dashboard-section">
          <div className="dashboard">
            <Dashboard
              totalMonthlyIncome={totalMonthlyIncome}
              totalMonthlyExpenses={totalMonthlyExpenses}
              averageWeeklySalary={averageWeeklySalary}
              totalWeeklyNeeded={totalWeeklyNeeded}
              weeks={weeks}
              fridaysInMonth={fridaysInMonth}
              expenses={expenses}
            />
          </div>
        </section>

        <section className="upcoming-payments-section">
          <UpcomingPayments 
            expenses={expenses}
            currentMonthKey={currentMonthKey}
          />
        </section>

        <section className="salary-section">
          <SalaryInput 
            weeks={weeks}
            onAddWeek={handleAddWeek}
            onDeleteWeek={handleDeleteWeek}
            onEditWeek={handleEditWeek}
            monthKey={currentMonthKey}
          />
        </section>

        <section className="debts-section">
          <div className="section-header">
            <h2>Gastos Mensuales</h2>
            <div className="expense-buttons">
              <button 
                onClick={() => {
                  setEditingExpense(null)
                  setIsEditingBaseExpense(true)
                  setShowForm(!showForm)
                }}
                className="btn-add-base"
              >
                {showForm && isEditingBaseExpense ? 'Cancelar' : '+ Agregar a Plantilla'}
              </button>
              <button 
                onClick={() => {
                  setEditingExpense(null)
                  setIsEditingBaseExpense(false)
                  setShowForm(!showForm)
                }}
                className="btn-add"
              >
                {showForm && !isEditingBaseExpense ? 'Cancelar' : '+ Agregar Solo Este Mes'}
              </button>
            </div>
          </div>

          {showForm && (
            <>
              {editingExpense ? (
                // Modal para edición
                <div className="modal-overlay" onClick={handleCancelForm}>
                  <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                    <button 
                      className="modal-close-btn" 
                      onClick={handleCancelForm}
                      aria-label="Cerrar"
                    >
                      ×
                    </button>
                    <DebtForm 
                      debt={editingExpense}
                      onSave={handleAddExpense}
                      onCancel={handleCancelForm}
                      isBaseExpense={isEditingBaseExpense}
                    />
                  </div>
                </div>
              ) : (
                // Formulario normal para agregar nuevo
                <div className="form-container">
                  <DebtForm 
                    debt={editingExpense}
                    onSave={handleAddExpense}
                    onCancel={handleCancelForm}
                    isBaseExpense={isEditingBaseExpense}
                  />
                </div>
              )}
            </>
          )}

          <DebtList 
            debts={expenses}
            assignedAmounts={weeklyDistribution}
            onEdit={handleEditExpense}
            onDelete={handleDeleteExpense}
            averageWeeklySalary={averageWeeklySalary}
            totalWeeklyNeeded={totalWeeklyNeeded}
            fridaysInMonth={fridaysInMonth}
            baseExpenses={baseExpenses}
          />
        </section>

        <section className="distribution-section">
          <DistributionChart 
            debts={expenses}
            assignedAmounts={weeklyDistribution}
            totalMonthlyIncome={totalMonthlyIncome}
            averageWeeklySalary={averageWeeklySalary}
            totalWeeklyNeeded={totalWeeklyNeeded}
            totalMonthlyExpenses={totalMonthlyExpenses}
            fridaysInMonth={fridaysInMonth}
            weeksCount={weeks.length}
          />
        </section>
      </main>
    </div>
  )
}

export default App

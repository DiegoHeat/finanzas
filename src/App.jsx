import { useState, useMemo } from 'react'
import { useMonthlyData } from './hooks/useMonthlyData'
import MonthSelector from './components/MonthSelector'
import SalaryInput from './components/SalaryInput'
import DebtForm from './components/DebtForm'
import DebtList from './components/DebtList'
import DistributionChart from './components/DistributionChart'
import ExportPDF from './components/ExportPDF'

function App() {
  const {
    currentMonthKey,
    currentMonthData,
    updateCurrentMonthData,
    changeMonth,
    availableMonths,
    baseExpenses,
    updateBaseExpenses
  } = useMonthlyData()

  const [editingExpense, setEditingExpense] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [isEditingBaseExpense, setIsEditingBaseExpense] = useState(false)

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
  }

  const handleDeleteWeek = (weekId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta semana?')) {
      updateCurrentMonthData(prev => ({
        ...prev,
        weeks: (prev.weeks || []).filter(w => w.id !== weekId)
      }))
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
      }
    } else {
      // Editar gasto del mes actual
      if (editingExpense) {
        updateCurrentMonthData(prev => ({
          ...prev,
          expenses: (prev.expenses || []).map(e => e.id === expense.id ? expense : e)
        }))
        setEditingExpense(null)
      } else {
        // Agregar nuevo gasto solo al mes actual
        updateCurrentMonthData(prev => ({
          ...prev,
          expenses: [...(prev.expenses || []), expense]
        }))
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
      }
    } else {
      if (window.confirm('¿Estás seguro de que quieres eliminar este gasto de este mes?')) {
        updateCurrentMonthData(prev => ({
          ...prev,
          expenses: (prev.expenses || []).filter(e => e.id !== expenseId)
        }))
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
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div>
            <h1>💰 Gestión de Finanzas</h1>
            <p>Distribuye tu sueldo semanal para cubrir todos tus gastos mensuales</p>
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
          <MonthSelector 
            currentMonthKey={currentMonthKey}
            onChangeMonth={handleChangeMonth}
            availableMonths={availableMonths}
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
            <div className="form-container">
              <DebtForm 
                debt={editingExpense}
                onSave={handleAddExpense}
                onCancel={handleCancelForm}
                isBaseExpense={isEditingBaseExpense}
              />
            </div>
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

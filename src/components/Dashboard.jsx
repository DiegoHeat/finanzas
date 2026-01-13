import './Dashboard.css'

function Dashboard({
  totalMonthlyIncome,
  totalMonthlyExpenses,
  averageWeeklySalary,
  totalWeeklyNeeded,
  weeks,
  fridaysInMonth,
  expenses
}) {
  const balance = totalMonthlyIncome - totalMonthlyExpenses
  const weeklyBalance = averageWeeklySalary - totalWeeklyNeeded
  const weeksProgress = fridaysInMonth > 0 ? (weeks.length / fridaysInMonth) * 100 : 0

  // Determinar estado financiero
  const getFinancialStatus = () => {
    if (balance >= 0 && weeklyBalance >= 0) {
      return { status: 'success', label: 'Saludable', icon: '✓' }
    } else if (balance >= 0 && weeklyBalance < 0) {
      return { status: 'warning', label: 'Atención', icon: '⚠' }
    } else {
      return { status: 'error', label: 'Crítico', icon: '✕' }
    }
  }

  const financialStatus = getFinancialStatus()

  // Top 3 gastos más importantes
  const topExpenses = [...expenses]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 3)

  return (
    <div className="dashboard">
      <h2 className="dashboard-title">Resumen del Mes</h2>
      
      <div className="dashboard-grid">
        {/* Estado Financiero */}
        <div className={`dashboard-card status-card status-${financialStatus.status}`}>
          <div className="status-header">
            <span className="status-icon">{financialStatus.icon}</span>
            <span className="status-label">{financialStatus.label}</span>
          </div>
          <div className="status-details">
            <div className="status-item">
              <span className="status-item-label">Balance Mensual:</span>
              <span className={`status-item-value ${balance >= 0 ? 'positive' : 'negative'}`}>
                ${balance.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="status-item">
              <span className="status-item-label">Restante Semanal:</span>
              <span className={`status-item-value ${weeklyBalance >= 0 ? 'positive' : 'negative'}`}>
                ${weeklyBalance.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Progreso de Semanas */}
        <div className="dashboard-card progress-card">
          <h3 className="card-title">Semanas Registradas</h3>
          <div className="progress-info">
            <span className="progress-text">
              {weeks.length} de {fridaysInMonth} semanas
            </span>
            <span className="progress-percentage">
              {Math.round(weeksProgress)}%
            </span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${weeksProgress}%` }}
            />
          </div>
          {weeks.length < fridaysInMonth && (
            <p className="progress-warning">
              Faltan {fridaysInMonth - weeks.length} semana(s) por registrar
            </p>
          )}
        </div>

        {/* Ingresos Totales */}
        <div className="dashboard-card income-card">
          <h3 className="card-title">Ingresos del Mes</h3>
          <div className="card-value">
            ${totalMonthlyIncome.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="card-subtitle">
            Promedio semanal: ${averageWeeklySalary.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        {/* Gastos Totales */}
        <div className="dashboard-card expenses-card">
          <h3 className="card-title">Gastos del Mes</h3>
          <div className="card-value">
            ${totalMonthlyExpenses.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="card-subtitle">
            Necesario por semana: ${totalWeeklyNeeded.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        {/* Top Gastos */}
        {topExpenses.length > 0 && (
          <div className="dashboard-card top-expenses-card">
            <h3 className="card-title">Gastos Principales</h3>
            <div className="top-expenses-list">
              {topExpenses.map((expense, index) => (
                <div key={expense.id} className="top-expense-item">
                  <span className="expense-rank">#{index + 1}</span>
                  <span className="expense-name">{expense.name}</span>
                  <span className="expense-amount">
                    ${expense.amount.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard

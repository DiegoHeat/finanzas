function DistributionChart({ debts, assignedAmounts, totalMonthlyIncome, averageWeeklySalary, totalWeeklyNeeded, totalMonthlyExpenses, fridaysInMonth, weeksCount }) {
  const totalAssigned = Object.values(assignedAmounts).reduce((sum, amount) => sum + amount, 0)
  const remaining = averageWeeklySalary - totalAssigned

  if (totalMonthlyIncome === 0) {
    return (
      <div className="distribution-chart">
        <h2>Distribución Semanal</h2>
        <p className="no-salary">Agrega tus sueldos semanales para ver cómo distribuirlos</p>
      </div>
    )
  }

  const sortedDebts = [...debts]
    .map(debt => ({
      ...debt,
      assigned: assignedAmounts[debt.id] || 0
    }))
    .sort((a, b) => b.assigned - a.assigned)
    .filter(debt => debt.assigned > 0)

  const canAfford = totalWeeklyNeeded <= averageWeeklySalary
  const monthlyRemaining = totalMonthlyIncome - totalMonthlyExpenses

  return (
    <div className="distribution-chart">
      <h2>Distribución Semanal</h2>
      
      <div className="monthly-overview">
        <h3>Resumen Mensual</h3>
        <div className="chart-summary">
          <div className="summary-item">
            <span className="summary-label">Ingreso Mensual ({weeksCount}/{fridaysInMonth} semanas):</span>
            <span className="summary-value">${totalMonthlyIncome.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Gastos Mensuales:</span>
            <span className="summary-value assigned">${totalMonthlyExpenses.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className={`summary-item ${canAfford ? 'success' : 'warning'}`}>
            <span className="summary-label">Restante al mes:</span>
            <span className="summary-value remaining">${monthlyRemaining.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>

      <div className="weekly-overview">
        <h3>Distribución por Semana (Promedio)</h3>
        <div className="chart-summary">
          <div className="summary-item">
            <span className="summary-label">Sueldo Semanal Promedio:</span>
            <span className="summary-value">${averageWeeklySalary.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Guardar para gastos:</span>
            <span className="summary-value assigned">${totalAssigned.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className={`summary-item ${canAfford ? 'success' : 'warning'}`}>
            <span className="summary-label">Restante por semana:</span>
            <span className="summary-value remaining">${remaining.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>

      {!canAfford && (
        <div className="warning-message">
          <p>⚠️ Tu sueldo semanal promedio no es suficiente para cubrir todos los gastos mensuales.</p>
          <p>Necesitas ${(totalWeeklyNeeded - averageWeeklySalary).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} más por semana en promedio.</p>
        </div>
      )}

      <div className="chart-bars">
        <h4>Cuánto guardar cada semana para cada gasto:</h4>
        {sortedDebts.map(debt => {
          const percentage = averageWeeklySalary > 0 ? (debt.assigned / averageWeeklySalary) * 100 : 0
          return (
            <div key={debt.id} className="chart-bar-item">
              <div className="bar-label">
                <span className="bar-name">{debt.name}</span>
                <span className="bar-amount">${debt.assigned.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/semana ({percentage.toFixed(1)}% del sueldo)</span>
              </div>
              <div className="bar-container">
                <div 
                  className="bar-fill" 
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                ></div>
              </div>
            </div>
          )
        })}
        {remaining > 0 && (
          <div className="chart-bar-item">
            <div className="bar-label">
              <span className="bar-name">Restante (gastos personales)</span>
              <span className="bar-amount">${remaining.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({(averageWeeklySalary > 0 ? (remaining / averageWeeklySalary * 100) : 0).toFixed(1)}%)</span>
            </div>
            <div className="bar-container">
              <div 
                className="bar-fill remaining-bar" 
                style={{ width: `${averageWeeklySalary > 0 ? (remaining / averageWeeklySalary * 100) : 0}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DistributionChart

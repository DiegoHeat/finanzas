import DebtItem from './DebtItem'

function DebtList({ debts, assignedAmounts, onEdit, onDelete, averageWeeklySalary, totalWeeklyNeeded, fridaysInMonth, baseExpenses = [] }) {
  const totalMonthlyExpenses = debts.reduce((sum, debt) => sum + debt.amount, 0)

  if (debts.length === 0) {
    return (
      <div className="empty-state">
        <p>No hay gastos mensuales registrados. Agrega un gasto mensual para comenzar.</p>
      </div>
    )
  }

  const sortedDebts = [...debts].sort((a, b) => a.priority - b.priority)
  const totalAssigned = Object.values(assignedAmounts).reduce((sum, amount) => sum + amount, 0)

  // Agrupar por categoría para el desglose
  const expensesByCategory = debts.reduce((acc, debt) => {
    const category = debt.category || 'otros'
    if (!acc[category]) {
      acc[category] = 0
    }
    acc[category] += debt.amount
    return acc
  }, {})

  return (
    <>
      <div className="expenses-total-summary">
        <div className="total-expenses-card">
          <div className="total-expenses-header">
            <h3>Total de Gastos Mensuales</h3>
            <span className="total-expenses-amount">
              ${totalMonthlyExpenses.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="expenses-breakdown">
            <div className="breakdown-item">
              <span className="breakdown-label">Cantidad de gastos:</span>
              <span className="breakdown-value">{debts.length}</span>
            </div>
            <div className="breakdown-categories">
              {Object.entries(expensesByCategory).map(([category, amount]) => (
                <div key={category} className="category-breakdown">
                  <span className="category-name">{category.charAt(0).toUpperCase() + category.slice(1)}:</span>
                  <span className="category-amount">${amount.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {averageWeeklySalary > 0 && (
        <div className="weekly-summary">
          <div className="summary-card">
            <span className="summary-label">Necesitas guardar por semana:</span>
            <span className="summary-value">${totalWeeklyNeeded.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className="summary-card">
            <span className="summary-label">Sueldo semanal promedio:</span>
            <span className="summary-value">${averageWeeklySalary.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className={`summary-card ${totalWeeklyNeeded > averageWeeklySalary ? 'warning' : 'success'}`}>
            <span className="summary-label">Restante por semana:</span>
            <span className="summary-value">${(averageWeeklySalary - totalWeeklyNeeded).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>
      )}
      <div className="debt-list">
        {sortedDebts.map(debt => {
          // Determinar si es un gasto base (comparar ID base)
          const baseId = debt.id.split('-')[0]
          const isBaseExpense = baseExpenses.some(be => String(be.id) === baseId)
          
          return (
            <DebtItem
              key={debt.id}
              debt={debt}
              assignedAmount={assignedAmounts[debt.id] || 0}
              percentage={totalAssigned > 0 ? (assignedAmounts[debt.id] / totalAssigned * 100) : 0}
              onEdit={(expense) => onEdit(expense, isBaseExpense)}
              onDelete={(expenseId) => onDelete(expenseId, isBaseExpense)}
              isBaseExpense={isBaseExpense}
            />
          )
        })}
      </div>
    </>
  )
}

export default DebtList

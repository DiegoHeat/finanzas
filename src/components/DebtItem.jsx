function DebtItem({ debt, assignedAmount, percentage, onEdit, onDelete, isBaseExpense = false }) {
  const categoryColors = {
    servicios: '#666',
    préstamos: '#333',
    tarjetas: '#999',
    otros: '#777'
  }

  const priorityLabels = {
    1: 'Muy Alta',
    2: 'Alta',
    3: 'Media',
    4: 'Baja',
    5: 'Muy Baja'
  }

  const priorityColors = {
    1: '#000',
    2: '#333',
    3: '#666',
    4: '#999',
    5: '#bbb'
  }

  return (
    <div className="debt-item" style={{ borderLeftColor: categoryColors[debt.category] || categoryColors.otros }}>
      <div className="debt-header">
        <div className="debt-title-section">
          <h3>{debt.name}</h3>
          {isBaseExpense && (
            <span className="base-expense-badge">Plantilla Base</span>
          )}
        </div>
        <div className="debt-actions">
          <button onClick={() => onEdit(debt)} className="btn-edit">Editar</button>
          <button onClick={() => onDelete(debt.id)} className="btn-delete">
            {isBaseExpense ? 'Eliminar de Plantilla' : 'Eliminar'}
          </button>
        </div>
      </div>
      <div className="debt-details">
        <div className="debt-info">
          <span className="debt-amount">Monto mensual: ${debt.amount.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          {debt.paymentDay && (
            <span className="debt-payment-day">
              📅 Día de pago: {debt.paymentDay} de cada mes
            </span>
          )}
          <span className="debt-category" style={{ backgroundColor: categoryColors[debt.category] || categoryColors.otros }}>
            {debt.category}
          </span>
          <span className="debt-priority" style={{ color: priorityColors[debt.priority] }}>
            Prioridad: {priorityLabels[debt.priority]}
          </span>
        </div>
        <div className="debt-assignment">
          <div className="assigned-amount">
            <strong>Guardar cada semana:</strong>
            <span className="amount-value">${assignedAmount.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className="assigned-percentage">
            {percentage > 0 ? `${percentage.toFixed(1)}% de lo que necesitas guardar` : 'Sin asignación'}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DebtItem

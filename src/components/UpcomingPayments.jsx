import { useMemo } from 'react'
import './UpcomingPayments.css'

function UpcomingPayments({ expenses, currentMonthKey }) {
  const upcomingPayments = useMemo(() => {
    if (!expenses || expenses.length === 0) return []

    const [year, month] = currentMonthKey.split('-').map(Number)
    const today = new Date()
    const currentYear = today.getFullYear()
    const currentMonth = today.getMonth() + 1
    const currentDay = today.getDate()

    // Determinar si estamos en el mes seleccionado
    const isCurrentMonth = year === currentYear && month === currentMonth

    return expenses
      .filter(expense => expense.paymentDay)
      .map(expense => {
        let paymentDate = new Date(year, month - 1, expense.paymentDay)
        
        // Si el día de pago ya pasó este mes y estamos en el mes actual, mostrar el próximo mes
        if (isCurrentMonth && expense.paymentDay < currentDay) {
          paymentDate = new Date(year, month, expense.paymentDay)
        }
        
        // Si el día no existe en el mes (ej: 31 en febrero), usar el último día del mes
        const lastDayOfMonth = new Date(year, month, 0).getDate()
        if (expense.paymentDay > lastDayOfMonth) {
          paymentDate = new Date(year, month, 0)
        }

        return {
          ...expense,
          paymentDate,
          daysUntil: Math.ceil((paymentDate - today) / (1000 * 60 * 60 * 24))
        }
      })
      .sort((a, b) => {
        // Ordenar por fecha de pago
        if (a.paymentDate.getTime() !== b.paymentDate.getTime()) {
          return a.paymentDate.getTime() - b.paymentDate.getTime()
        }
        // Si es el mismo día, ordenar por prioridad
        return a.priority - b.priority
      })
  }, [expenses, currentMonthKey])

  if (upcomingPayments.length === 0) {
    return (
      <div className="upcoming-payments">
        <h2>Próximos Pagos</h2>
        <div className="empty-payments">
          <p>No hay gastos con día de pago configurado.</p>
        </div>
      </div>
    )
  }

  const getPaymentStatus = (daysUntil) => {
    if (daysUntil < 0) return { label: 'Vencido', className: 'overdue' }
    if (daysUntil === 0) return { label: 'Hoy', className: 'today' }
    if (daysUntil <= 3) return { label: `En ${daysUntil} día${daysUntil > 1 ? 's' : ''}`, className: 'soon' }
    if (daysUntil <= 7) return { label: `En ${daysUntil} días`, className: 'upcoming' }
    return { label: `En ${daysUntil} días`, className: 'later' }
  }

  const formatDate = (date) => {
    return date.toLocaleDateString('es-MX', { 
      weekday: 'short',
      day: 'numeric', 
      month: 'short',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    })
  }

  return (
    <div className="upcoming-payments">
      <h2>Próximos Pagos</h2>
      <div className="payments-list">
        {upcomingPayments.map(expense => {
          const status = getPaymentStatus(expense.daysUntil)
          return (
            <div key={expense.id} className={`payment-item ${status.className}`}>
              <div className="payment-header">
                <h3>{expense.name}</h3>
                <span className={`payment-status ${status.className}`}>
                  {status.label}
                </span>
              </div>
              <div className="payment-details">
                <div className="payment-date">
                  <span className="date-label">Fecha:</span>
                  <span className="date-value">{formatDate(expense.paymentDate)}</span>
                </div>
                <div className="payment-amount">
                  <span className="amount-label">Monto:</span>
                  <span className="amount-value">
                    ${expense.amount.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="payment-category">
                  <span className="category-badge">{expense.category}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default UpcomingPayments

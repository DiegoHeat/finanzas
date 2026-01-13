import { useState, useEffect } from 'react'

function DebtForm({ debt, onSave, onCancel, isBaseExpense = false }) {
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    category: 'servicios',
    priority: 3,
    paymentDay: 1
  })

  useEffect(() => {
    if (debt) {
      setFormData({
        name: debt.name || '',
        amount: debt.amount || '',
        category: debt.category || 'servicios',
        priority: debt.priority || 3,
        paymentDay: debt.paymentDay || 1
      })
    } else {
      // Resetear formulario cuando no hay debt
      setFormData({
        name: '',
        amount: '',
        category: 'servicios',
        priority: 3,
        paymentDay: 1
      })
    }
  }, [debt])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => {
      if (name === 'amount' || name === 'priority' || name === 'paymentDay') {
        // Para campos numéricos, mantener como string en el estado para el input
        // pero validar que sea un número válido
        const numValue = value === '' ? '' : (parseFloat(value) || 0)
        return {
          ...prev,
          [name]: numValue
        }
      }
      return {
        ...prev,
        [name]: value
      }
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const amount = typeof formData.amount === 'string' ? parseFloat(formData.amount) : formData.amount
    if (formData.name.trim() && amount > 0) {
      onSave({
        ...formData,
        amount: amount, // Asegurar que amount sea un número
        id: debt?.id || Date.now()
      })
      if (!debt) {
        setFormData({
          name: '',
          amount: '',
          category: 'servicios',
          priority: 3,
          paymentDay: 1
        })
      }
    }
  }

  return (
    <form className="debt-form" onSubmit={handleSubmit}>
      <h3>
        {debt 
          ? `Editar Gasto ${isBaseExpense ? 'de la Plantilla' : 'del Mes'}` 
          : `Nuevo Gasto ${isBaseExpense ? 'en la Plantilla (se repetirá cada mes)' : 'Solo para este Mes'}`}
      </h3>
      <div className="form-group">
        <label htmlFor="name">Nombre del gasto:</label>
        <input
          id="name"
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          placeholder="Ej: Alquiler, Luz, Internet"
        />
      </div>
      <div className="form-group">
        <label htmlFor="amount">Monto mensual ($):</label>
        <input
          id="amount"
          type="number"
          name="amount"
          min="0"
          step="0.01"
          value={formData.amount === '' ? '' : formData.amount}
          onChange={handleChange}
          required
          placeholder="0.00"
        />
        <small>Monto total que pagas cada mes</small>
      </div>
      <div className="form-group">
        <label htmlFor="category">Categoría:</label>
        <div className="category-selector">
          {[
            { value: 'servicios', label: 'Servicios', icon: '⚡' },
            { value: 'préstamos', label: 'Préstamos', icon: '💳' },
            { value: 'tarjetas', label: 'Tarjetas', icon: '💳' },
            { value: 'otros', label: 'Otros', icon: '📋' }
          ].map(cat => (
            <button
              key={cat.value}
              type="button"
              className={`category-option ${formData.category === cat.value ? 'active' : ''}`}
              onClick={() => setFormData(prev => ({ ...prev, category: cat.value }))}
            >
              <span className="category-icon">{cat.icon}</span>
              <span className="category-label">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="form-group">
        <label htmlFor="paymentDay">Día de pago del mes:</label>
        <input
          id="paymentDay"
          type="number"
          name="paymentDay"
          min="1"
          max="31"
          value={formData.paymentDay}
          onChange={handleChange}
          required
          placeholder="1-31"
        />
        <small>Día del mes en que debes pagar este gasto (1-31)</small>
      </div>
      <div className="form-group">
        <label htmlFor="priority">
          Prioridad: <span className="priority-value">{formData.priority}</span>
          <span className="priority-label">
            {formData.priority === 1 && ' - Muy Alta'}
            {formData.priority === 2 && ' - Alta'}
            {formData.priority === 3 && ' - Media'}
            {formData.priority === 4 && ' - Baja'}
            {formData.priority === 5 && ' - Muy Baja'}
          </span>
        </label>
        <div className="priority-slider-container">
          <input
            id="priority"
            type="range"
            name="priority"
            min="1"
            max="5"
            value={formData.priority}
            onChange={handleChange}
            className="priority-slider"
            required
          />
          <div className="priority-labels">
            <span>1</span>
            <span>2</span>
            <span>3</span>
            <span>4</span>
            <span>5</span>
          </div>
        </div>
      </div>
      <div className="form-actions">
        <button type="submit" className="btn-save">{debt ? 'Guardar Cambios' : 'Agregar Gasto'}</button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-cancel">Cancelar</button>
        )}
      </div>
    </form>
  )
}

export default DebtForm

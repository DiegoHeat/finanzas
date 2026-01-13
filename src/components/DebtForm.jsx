import { useState, useEffect } from 'react'

function DebtForm({ debt, onSave, onCancel, isBaseExpense = false }) {
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    category: 'servicios',
    priority: 3
  })

  useEffect(() => {
    if (debt) {
      setFormData({
        name: debt.name,
        amount: debt.amount,
        category: debt.category,
        priority: debt.priority
      })
    }
  }, [debt])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' || name === 'priority' ? parseFloat(value) || 0 : value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (formData.name.trim() && formData.amount > 0) {
      onSave({
        ...formData,
        id: debt?.id || Date.now()
      })
      if (!debt) {
        setFormData({
          name: '',
          amount: '',
          category: 'servicios',
          priority: 3
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
          value={formData.amount}
          onChange={handleChange}
          required
          placeholder="0.00"
        />
        <small>Monto total que pagas cada mes</small>
      </div>
      <div className="form-group">
        <label htmlFor="category">Categoría:</label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          required
        >
          <option value="servicios">Servicios</option>
          <option value="préstamos">Préstamos</option>
          <option value="tarjetas">Tarjetas</option>
          <option value="otros">Otros</option>
        </select>
      </div>
      <div className="form-group">
        <label htmlFor="priority">Prioridad (1-5):</label>
        <input
          id="priority"
          type="number"
          name="priority"
          min="1"
          max="5"
          value={formData.priority}
          onChange={handleChange}
          required
        />
        <small>1 = Muy Alta, 5 = Muy Baja</small>
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

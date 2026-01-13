import { useState } from 'react'

function SalaryInput({ weeks, onAddWeek, onDeleteWeek, onEditWeek, monthKey }) {
  const [localSalary, setLocalSalary] = useState('')
  const [editingWeekId, setEditingWeekId] = useState(null)
  const [editValue, setEditValue] = useState('')

  // Calcular cuántos viernes hay en el mes seleccionado
  const getFridaysInMonth = (monthKey) => {
    const [year, month] = monthKey.split('-').map(Number)
    
    const firstDay = new Date(year, month - 1, 1)
    const lastDay = new Date(year, month, 0)
    
    let fridays = 0
    let currentDate = new Date(firstDay)
    
    while (currentDate <= lastDay) {
      if (currentDate.getDay() === 5) { // 5 = viernes
        fridays++
      }
      currentDate.setDate(currentDate.getDate() + 1)
    }
    
    return fridays
  }

  const fridaysInMonth = getFridaysInMonth(monthKey)

  const handleAdd = (e) => {
    e.preventDefault()
    const value = parseFloat(localSalary)
    if (!isNaN(value) && value > 0) {
      onAddWeek(value)
      setLocalSalary('')
    }
  }

  const handleEdit = (week) => {
    setEditingWeekId(week.id)
    setEditValue(week.amount.toString())
  }

  const handleSaveEdit = (weekId) => {
    const value = parseFloat(editValue)
    if (!isNaN(value) && value > 0) {
      onEditWeek(weekId, value)
      setEditingWeekId(null)
      setEditValue('')
    }
  }

  const handleCancelEdit = () => {
    setEditingWeekId(null)
    setEditValue('')
  }

  const totalMonthly = weeks.reduce((sum, week) => sum + week.amount, 0)

  return (
    <div className="salary-input">
      <div className="salary-header">
        <label htmlFor="salary">Sueldo Semanal ($):</label>
        <div className="fridays-info">
          <span>Viernes en este mes: {fridaysInMonth}</span>
        </div>
      </div>
      
      <form onSubmit={handleAdd} className="salary-form">
        <input
          id="salary"
          type="number"
          min="0"
          step="0.01"
          value={localSalary}
          onChange={(e) => setLocalSalary(e.target.value)}
          placeholder="Ingresa el monto de esta semana"
          required
        />
        <button type="submit" className="btn-add">Guardar Semana</button>
      </form>

      {weeks.length > 0 && (
        <div className="weeks-list">
          <h3>Semanas Registradas ({weeks.length}/{fridaysInMonth})</h3>
          <div className="weeks-container">
            {weeks.map((week, index) => (
              <div key={week.id} className="week-item">
                {editingWeekId === week.id ? (
                  <div className="week-edit">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="week-edit-input"
                    />
                    <button 
                      onClick={() => handleSaveEdit(week.id)}
                      className="btn-save-small"
                    >
                      ✓
                    </button>
                    <button 
                      onClick={handleCancelEdit}
                      className="btn-cancel-small"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="week-info">
                      <span className="week-label">Semana {index + 1}</span>
                      <span className="week-amount">${week.amount.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="week-actions">
                      <button 
                        onClick={() => handleEdit(week)}
                        className="btn-edit-small"
                      >
                        Editar
                      </button>
                      <button 
                        onClick={() => onDeleteWeek(week.id)}
                        className="btn-delete-small"
                      >
                        Eliminar
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
          <div className="total-monthly">
            <strong>Total del mes: ${totalMonthly.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
            {weeks.length < fridaysInMonth && (
              <span className="pending-weeks">Faltan {fridaysInMonth - weeks.length} semana(s) por registrar</span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default SalaryInput

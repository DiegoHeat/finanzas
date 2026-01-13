function MonthSelector({ currentMonthKey, onChangeMonth, availableMonths }) {
  const [year, month] = currentMonthKey.split('-').map(Number)
  
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]

  const handlePreviousMonth = () => {
    let newYear = year
    let newMonth = month - 1
    
    if (newMonth < 1) {
      newMonth = 12
      newYear--
    }
    
    onChangeMonth(newYear, newMonth - 1)
  }

  const handleNextMonth = () => {
    let newYear = year
    let newMonth = month + 1
    
    if (newMonth > 12) {
      newMonth = 1
      newYear++
    }
    
    onChangeMonth(newYear, newMonth - 1)
  }

  const handleMonthChange = (e) => {
    const [selectedYear, selectedMonth] = e.target.value.split('-').map(Number)
    onChangeMonth(selectedYear, selectedMonth - 1)
  }

  // Generar opciones de meses (últimos 12 meses + meses disponibles)
  const getMonthOptions = () => {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth()
    
    const options = []
    
    // Agregar meses disponibles
    availableMonths.forEach(key => {
      const [y, m] = key.split('-').map(Number)
      const date = new Date(y, m - 1, 1)
      options.push({
        key,
        label: `${monthNames[m - 1]} ${y}`,
        date
      })
    })
    
    // Agregar últimos 12 meses
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentYear, currentMonth - i, 1)
      const y = date.getFullYear()
      const m = date.getMonth() + 1
      const key = `${y}-${String(m).padStart(2, '0')}`
      
      if (!options.find(opt => opt.key === key)) {
        options.push({
          key,
          label: `${monthNames[date.getMonth()]} ${y}`,
          date
        })
      }
    }
    
    return options.sort((a, b) => b.date - a.date)
  }

  const monthOptions = getMonthOptions()

  return (
    <div className="month-selector">
      <div className="month-selector-header">
        <h2>Mes Seleccionado</h2>
        <div className="month-navigation">
          <button onClick={handlePreviousMonth} className="btn-nav">‹</button>
          <select 
            value={currentMonthKey} 
            onChange={handleMonthChange}
            className="month-select"
          >
            {monthOptions.map(option => (
              <option key={option.key} value={option.key}>
                {option.label}
              </option>
            ))}
          </select>
          <button onClick={handleNextMonth} className="btn-nav">›</button>
        </div>
      </div>
      <div className="current-month-display">
        <span className="month-name">{monthNames[month - 1]} {year}</span>
        {availableMonths.includes(currentMonthKey) && (
          <span className="month-has-data">✓ Tiene datos guardados</span>
        )}
      </div>
    </div>
  )
}

export default MonthSelector

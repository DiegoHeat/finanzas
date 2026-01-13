import jsPDF from 'jspdf'
import 'jspdf-autotable'

function ExportPDF({ 
  monthKey, 
  weeks, 
  expenses, 
  weeklyDistribution, 
  totalMonthlyIncome,
  totalMonthlyExpenses,
  averageWeeklySalary,
  totalWeeklyNeeded,
  fridaysInMonth 
}) {
  const getMonthName = (monthKey) => {
    const [year, month] = monthKey.split('-').map(Number)
    const date = new Date(year, month - 1)
    return date.toLocaleString('es-MX', { month: 'long', year: 'numeric' })
  }

  const handleExportPDF = () => {
    try {
      console.log('Iniciando exportación PDF...', { weeks, expenses, monthKey })
      
      // Validar que hay datos para exportar
      if (weeks.length === 0 && expenses.length === 0) {
        alert('No hay datos para exportar. Agrega ingresos semanales o gastos mensuales primero.')
        return
      }
      
      const doc = new jsPDF()
      
      // Verificar que autoTable esté disponible
      if (typeof doc.autoTable !== 'function') {
        console.error('autoTable no está disponible en doc:', doc)
        throw new Error('autoTable no está disponible. Verifica la importación de jspdf-autotable.')
      }
      
      console.log('jsPDF creado correctamente, autoTable disponible')
      
      const pageWidth = doc.internal.pageSize.getWidth()
      const margin = 20
      let yPosition = margin

    // Título
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text('Reporte Financiero Mensual', pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 10

    // Mes
    doc.setFontSize(14)
    doc.setFont('helvetica', 'normal')
    doc.text(`Mes: ${getMonthName(monthKey)}`, pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 15

    // Resumen general
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Resumen General', margin, yPosition)
    yPosition += 8

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    const balance = totalMonthlyIncome - totalMonthlyExpenses
    const balanceColor = balance >= 0 ? [0, 128, 0] : [200, 0, 0]
    
    const summaryData = [
      ['Total de Ingresos Mensuales', `$${totalMonthlyIncome.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
      ['Total de Gastos Mensuales', `$${totalMonthlyExpenses.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
      ['Balance Mensual', `$${balance.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
      ['Sueldo Semanal Promedio', `$${averageWeeklySalary.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
      ['Necesario por Semana', `$${totalWeeklyNeeded.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
      ['Restante por Semana', `$${(averageWeeklySalary - totalWeeklyNeeded).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
      ['Viernes en el Mes', fridaysInMonth],
      ['Semanas Registradas', weeks.length]
    ]

    doc.autoTable({
      startY: yPosition,
      head: [],
      body: summaryData,
      theme: 'plain',
      styles: { fontSize: 10 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 120 },
        1: { cellWidth: 60, halign: 'right' }
      },
      margin: { left: margin, right: margin },
      didParseCell: function(data) {
        if (data.row.index === 2) { // Balance row
          data.cell.styles.textColor = balanceColor
          data.cell.styles.fontStyle = 'bold'
        }
      }
    })

    yPosition = doc.lastAutoTable.finalY + 15

    // Tabla de semanas
    if (weeks.length > 0) {
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text('Ingresos Semanales', margin, yPosition)
      yPosition += 8

      const weeksData = weeks.map((week, index) => [
        `Semana ${index + 1}`,
        `$${week.amount.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      ])

      // Agregar total
      weeksData.push([
        'TOTAL',
        `$${totalMonthlyIncome.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      ])

      doc.autoTable({
        startY: yPosition,
        head: [['Semana', 'Monto']],
        body: weeksData,
        theme: 'striped',
        headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
        styles: { fontSize: 10 },
        columnStyles: {
          1: { halign: 'right' }
        },
        margin: { left: margin, right: margin },
        didParseCell: function(data) {
          if (data.row.index === weeksData.length - 1) { // Total row
            data.cell.styles.fontStyle = 'bold'
            data.cell.styles.fillColor = [240, 240, 240]
          }
        }
      })

      yPosition = doc.lastAutoTable.finalY + 15
    }

    // Tabla de gastos
    if (expenses.length > 0) {
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text('Gastos Mensuales y Distribución Semanal', margin, yPosition)
      yPosition += 8

      // Ordenar gastos por prioridad
      const sortedExpenses = [...expenses].sort((a, b) => (a.priority || 0) - (b.priority || 0))

      const expensesData = sortedExpenses.map(expense => [
        expense.name,
        expense.category || 'Otros',
        `$${expense.amount.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        `$${(weeklyDistribution[expense.id] || 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      ])

      // Agregar total
      expensesData.push([
        'TOTAL',
        '',
        `$${totalMonthlyExpenses.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        `$${totalWeeklyNeeded.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      ])

      doc.autoTable({
        startY: yPosition,
        head: [['Gasto', 'Categoría', 'Monto Mensual', 'Por Semana']],
        body: expensesData,
        theme: 'striped',
        headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
        styles: { fontSize: 9 },
        columnStyles: {
          2: { halign: 'right' },
          3: { halign: 'right' }
        },
        margin: { left: margin, right: margin },
        didParseCell: function(data) {
          if (data.row.index === expensesData.length - 1) { // Total row
            data.cell.styles.fontStyle = 'bold'
            data.cell.styles.fillColor = [240, 240, 240]
          }
        }
      })

      yPosition = doc.lastAutoTable.finalY + 15

      // Desglose por categoría
      const expensesByCategory = expenses.reduce((acc, expense) => {
        const category = expense.category || 'Otros'
        if (!acc[category]) {
          acc[category] = 0
        }
        acc[category] += expense.amount
        return acc
      }, {})

      if (Object.keys(expensesByCategory).length > 0) {
        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        doc.text('Desglose por Categoría', margin, yPosition)
        yPosition += 8

        const categoryData = Object.entries(expensesByCategory).map(([category, amount]) => [
          category.charAt(0).toUpperCase() + category.slice(1),
          `$${amount.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        ])

        doc.autoTable({
          startY: yPosition,
          head: [['Categoría', 'Total']],
          body: categoryData,
          theme: 'striped',
          headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
          styles: { fontSize: 10 },
          columnStyles: {
            1: { halign: 'right' }
          },
          margin: { left: margin, right: margin }
        })

        yPosition = doc.lastAutoTable.finalY + 15
      }
    }

    // Análisis final
    const weeklyBalance = averageWeeklySalary - totalWeeklyNeeded
    
    if (yPosition > 250) {
      doc.addPage()
      yPosition = margin
    }

    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Análisis Financiero', margin, yPosition)
    yPosition += 10

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    
    const analysis = []
    if (balance >= 0) {
      analysis.push(['Estado del Mes', '✓ Positivo - Tienes suficientes ingresos'])
      doc.setTextColor(0, 128, 0)
    } else {
      analysis.push(['Estado del Mes', '✗ Negativo - Faltan ingresos'])
      doc.setTextColor(200, 0, 0)
    }
    
    doc.setTextColor(0, 0, 0)
    
    if (weeklyBalance >= 0) {
      analysis.push(['Estado Semanal', '✓ Positivo - Puedes cubrir gastos semanales'])
      analysis.push(['Recomendación', 'Mantén este ritmo de ahorro'])
    } else {
      analysis.push(['Estado Semanal', '✗ Negativo - Necesitas más ingresos semanales'])
      analysis.push(['Recomendación', `Necesitas $${Math.abs(weeklyBalance).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} más por semana`])
    }

    doc.autoTable({
      startY: yPosition,
      head: [],
      body: analysis,
      theme: 'plain',
      styles: { fontSize: 10 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 100 },
        1: { cellWidth: 80 }
      },
      margin: { left: margin, right: margin }
    })

    // Pie de página
    const totalPages = doc.internal.getNumberOfPages()
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setTextColor(128, 128, 128)
      doc.text(
        `Página ${i} de ${totalPages} - Generado el ${new Date().toLocaleDateString('es-MX', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      )
      doc.setTextColor(0, 0, 0)
    }

      // Guardar PDF
      const fileName = `Reporte_Financiero_${monthKey}_${new Date().toISOString().split('T')[0]}.pdf`
      console.log('Guardando PDF con nombre:', fileName)
      doc.save(fileName)
      console.log('PDF generado exitosamente')
    } catch (error) {
      console.error('Error al generar PDF:', error)
      console.error('Stack trace:', error.stack)
      alert(`Error al generar el PDF: ${error.message}\n\nPor favor, revisa la consola para más detalles.`)
    }
  }

  return (
    <button onClick={handleExportPDF} className="btn-export-pdf">
      📄 Exportar a PDF
    </button>
  )
}

export default ExportPDF

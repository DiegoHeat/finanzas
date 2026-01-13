# 💰 Gestión de Finanzas

Aplicación web para gestionar tu sueldo semanal y distribuirlo para cubrir todos tus gastos mensuales.

## 🚀 Características

- ✅ **Gestión mensual**: Organiza tus finanzas por mes y año
- ✅ **Ingresos semanales**: Registra tu sueldo semanal variable cada viernes
- ✅ **Gastos mensuales**: Agrega y gestiona todos tus gastos mensuales
- ✅ **Plantilla de gastos**: Los gastos se repiten automáticamente cada mes
- ✅ **Cálculo automático**: Distribución semanal proporcional basada en los viernes del mes
- ✅ **Categorización**: Organiza gastos por categorías (Servicios, Préstamos, Tarjetas, Otros)
- ✅ **Prioridades**: Asigna prioridades a cada gasto (1-5)
- ✅ **Visualización**: Gráficos y resúmenes claros de tu situación financiera
- ✅ **Exportación PDF**: Genera reportes completos en PDF con todos tus datos
- ✅ **Persistencia**: Todos los datos se guardan automáticamente en localStorage
- ✅ **Diseño moderno**: Interfaz monócroma (blanco, gris, negro) y responsive

## 📦 Instalación

1. Instala las dependencias:
```bash
npm install
```

2. Inicia el servidor de desarrollo:
```bash
npm run dev
```

3. Abre tu navegador en la URL que aparece en la terminal (generalmente `http://localhost:5174`)

## 🏗️ Construcción para Producción

Para crear una versión optimizada para producción:

```bash
npm run build
```

Los archivos se generarán en la carpeta `dist/`.

## 📖 Uso

### Configuración Inicial

1. **Selecciona el mes**: Usa el selector de mes en la parte superior para elegir el mes que quieres gestionar
2. **Agrega gastos mensuales**:
   - **Gastos de plantilla**: Se repetirán automáticamente cada mes (botón "+ Agregar a Plantilla")
   - **Gastos del mes**: Solo para el mes actual (botón "+ Agregar Solo Este Mes")
   - Para cada gasto: nombre, monto mensual, categoría y prioridad

### Gestión Semanal

3. **Registra tus ingresos semanales**: Cada vez que recibas tu pago (viernes), agrega el monto
4. **Visualiza la distribución**: La app calcula automáticamente cuánto debes guardar por semana para cada gasto
5. **Revisa el resumen**: Ve el total de gastos, balance mensual y semanal

### Exportación

6. **Exporta a PDF**: Haz clic en "📄 Exportar a PDF" para generar un reporte completo con:
   - Resumen general (ingresos, gastos, balance)
   - Ingresos semanales detallados
   - Gastos mensuales con distribución semanal
   - Desglose por categoría
   - Análisis financiero y recomendaciones

## 🛠️ Tecnologías

- **React 18+**: Framework de UI
- **Vite**: Build tool y servidor de desarrollo
- **jsPDF**: Generación de PDFs
- **jspdf-autotable**: Tablas en PDFs
- **CSS3**: Estilos modernos (Flexbox/Grid)
- **localStorage API**: Persistencia de datos

## 📝 Notas Importantes

- Los datos se guardan automáticamente en el navegador (localStorage)
- La distribución semanal se calcula dividiendo los gastos mensuales entre el número de viernes del mes
- Los gastos de plantilla se copian automáticamente a cada mes nuevo
- Puedes editar o eliminar gastos individuales por mes sin afectar otros meses
- El PDF se genera con toda la información del mes seleccionado

## 📦 Estructura del Proyecto

```
src/
├── components/      # Componentes React
│   ├── DebtForm.jsx        # Formulario de gastos
│   ├── DebtItem.jsx        # Item individual de gasto
│   ├── DebtList.jsx        # Lista de gastos
│   ├── DistributionChart.jsx  # Gráficos de distribución
│   ├── ExportPDF.jsx       # Exportación a PDF
│   ├── MonthSelector.jsx   # Selector de mes
│   └── SalaryInput.jsx     # Input de ingresos semanales
├── hooks/          # Custom hooks
│   ├── useLocalStorage.js  # Hook para localStorage
│   └── useMonthlyData.js   # Hook para datos mensuales
├── styles/         # Estilos CSS
│   └── App.css
├── App.jsx         # Componente principal
└── main.jsx        # Punto de entrada
```

## 🚀 Despliegue

Para desplegar en producción:

```bash
npm run build
```

Los archivos optimizados se generarán en la carpeta `dist/`, listos para desplegar en cualquier hosting estático (Vercel, Netlify, GitHub Pages, etc.).

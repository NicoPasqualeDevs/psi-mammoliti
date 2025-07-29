# Endpoint: Buscar Psicólogos Disponibles

Este endpoint permite buscar qué psicólogos están disponibles en una fecha y hora específica.

## 🔗 Endpoint

```
GET /api/disponibilidad/buscar
```

## 📋 Parámetros de Consulta

| Parámetro | Tipo | Requerido | Descripción | Ejemplo |
|-----------|------|-----------|-------------|---------|
| `fecha` | string | ✅ Sí | Fecha en formato YYYY-MM-DD | `2024-01-15` |
| `hora` | string | ✅ Sí | Hora en formato HH:MM (24h) | `14:30` |
| `modalidad` | string | ❌ No | Filtrar por modalidad específica | `virtual`, `presencial`, `telefonica` |

## 📤 Ejemplo de Uso

### Buscar todos los psicólogos disponibles
```bash
GET /api/disponibilidad/buscar?fecha=2024-01-15&hora=14:30
```

### Buscar solo psicólogos con modalidad virtual
```bash
GET /api/disponibilidad/buscar?fecha=2024-01-15&hora=14:30&modalidad=virtual
```

## 📥 Respuesta

### Estructura de Respuesta Exitosa
```json
{
  "fecha": "2024-01-15",
  "hora": "14:30",
  "modalidadSolicitada": "virtual",
  "cantidadDisponibles": 2,
  "psicologosDisponibles": [
    {
      "id": "psi_001",
      "nombre": "Ana",
      "apellido": "García",
      "experiencia": 8,
      "precio": 800,
      "imagen": "https://example.com/ana.jpg",
      "descripcion": "Especialista en terapia cognitivo-conductual",
      "rating": 4.8,
      "especialidades": ["Ansiedad", "Depresión", "Terapia de Pareja"],
      "modalidades": ["virtual", "presencial"],
      "disponibilidadEncontrada": {
        "fecha": "2024-01-15",
        "hora": "14:30",
        "modalidad": "virtual",
        "duracionSesion": 60,
        "tiempoBuffer": 15
      }
    }
  ]
}
```

### Respuesta sin Resultados
```json
{
  "fecha": "2024-01-15",
  "hora": "14:30",
  "modalidadSolicitada": null,
  "cantidadDisponibles": 0,
  "psicologosDisponibles": []
}
```

### Respuesta de Error
```json
{
  "error": "Formato de fecha inválido. Use YYYY-MM-DD"
}
```

## 🔍 Lógica de Verificación

El endpoint verifica la disponibilidad de cada psicólogo siguiendo estos pasos:

1. **Configuración del Psicólogo**: Obtiene configuración de horarios (duración de sesión, tiempo buffer)
2. **Plantilla Semanal**: Verifica si el psicólogo trabaja el día de la semana solicitado
3. **Horario de Trabajo**: Confirma que la hora está dentro del rango de trabajo
4. **Modalidad**: Verifica que el psicólogo ofrezca la modalidad solicitada
5. **Conflictos**: Revisa que no haya citas agendadas en ese horario
6. **Excepciones**: Considera días bloqueados o horarios especiales

## 🎣 Hook de React: `useBuscarPsicologosDisponibles`

### Importación
```typescript
import { useBuscarPsicologosDisponibles } from '../hooks/useBuscarPsicologosDisponibles';
```

### Uso Básico
```typescript
const {
  psicologosDisponibles,
  cargando,
  error,
  ultimaBusqueda,
  cantidadDisponibles,
  buscarPsicologos,
  limpiarResultados
} = useBuscarPsicologosDisponibles();

// Buscar psicólogos disponibles
await buscarPsicologos('2024-01-15', '14:30', 'virtual');
```

### Propiedades del Hook

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `psicologosDisponibles` | `PsicologoDisponible[]` | Lista de psicólogos disponibles |
| `cargando` | `boolean` | Estado de carga de la búsqueda |
| `error` | `string \| null` | Mensaje de error si ocurre |
| `ultimaBusqueda` | `object \| null` | Información de la última búsqueda realizada |
| `cantidadDisponibles` | `number` | Número de psicólogos encontrados |
| `buscarPsicologos` | `function` | Función para realizar la búsqueda |
| `limpiarResultados` | `function` | Función para limpiar resultados |

## 🖥️ Componente de Ejemplo

Se incluye un componente completo de ejemplo: `BuscadorPsicologosDisponibles`

### Características del Componente:
- ✅ Formulario de búsqueda con validación
- ✅ Visualización de resultados con detalles completos
- ✅ Manejo de estados (cargando, error, sin resultados)
- ✅ Responsive design
- ✅ Información detallada de disponibilidad

### Uso del Componente
```typescript
import BuscadorPsicologosDisponibles from '../components/BuscadorPsicologosDisponibles';

function App() {
  return (
    <div>
      <BuscadorPsicologosDisponibles />
    </div>
  );
}
```

## 🔧 Casos de Uso

### 1. Búsqueda Rápida de Disponibilidad
```typescript
// Buscar qué psicólogos están libres mañana a las 3 PM
const mañana = new Date();
mañana.setDate(mañana.getDate() + 1);
const fecha = mañana.toISOString().split('T')[0];

await buscarPsicologos(fecha, '15:00');
```

### 2. Filtrado por Modalidad
```typescript
// Solo psicólogos que ofrezcan sesiones virtuales
await buscarPsicologos('2024-01-15', '10:00', 'virtual');
```

### 3. Búsqueda para Horarios de Emergencia
```typescript
// Encontrar psicólogos disponibles hoy
const hoy = new Date().toISOString().split('T')[0];
await buscarPsicologos(hoy, '16:00');
```

## ⚠️ Validaciones y Errores

### Validaciones del Frontend
- **Formato de fecha**: Debe ser YYYY-MM-DD
- **Formato de hora**: Debe ser HH:MM en formato 24 horas
- **Fecha mínima**: No puede ser anterior a hoy
- **Fecha máxima**: Hasta 30 días en el futuro

### Errores Comunes
| Error | Causa | Solución |
|-------|-------|----------|
| "Formato de fecha inválido" | Fecha no está en formato YYYY-MM-DD | Usar formato correcto |
| "Formato de hora inválido" | Hora no está en formato HH:MM | Usar formato 24 horas |
| "Se requieren fecha y hora" | Parámetros faltantes | Incluir ambos parámetros |

## 🎯 Consideraciones Técnicas

### Rendimiento
- El endpoint consulta todos los psicólogos y verifica disponibilidad de cada uno
- Para grandes cantidades de psicólogos, considerar paginación
- Las consultas a la base de datos están optimizadas con índices apropiados

### Escalabilidad
- Funciona con la estructura actual de horarios basada en plantillas semanales
- Compatible con excepciones de horarios y días bloqueados
- Respeta configuraciones individuales de cada psicólogo

### Mantenimiento
- El código está documentado y es fácil de mantener
- Las funciones auxiliares están separadas para reutilización
- Manejo robusto de errores en todas las capas

## 🚀 Próximas Mejoras

1. **Cache de Resultados**: Implementar cache para búsquedas frecuentes
2. **Filtros Adicionales**: Agregar filtros por especialidad, precio, rating
3. **Sugerencias Alternativas**: Mostrar horarios cercanos si no hay disponibilidad exacta
4. **Notificaciones**: Sistema de notificaciones cuando se libere un horario
5. **Análíticas**: Tracking de búsquedas más frecuentes
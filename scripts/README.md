# 📄 Scripts de Documentación - PsiConnect

Este directorio contiene scripts para generar documentación en formato PDF utilizando Puppeteer.

## 🚀 Scripts Disponibles

### 1. Manual de Usuario
```bash
npm run generate-manual
```
Genera `Manual-Usuario-PsiConnect.pdf` con documentación completa para usuarios finales.

### 2. Documentación Técnica de Modalidades
```bash
npm run generate-modalidades-doc
```
Genera `Documentacion-Modalidades-PsiConnect.pdf` con justificación técnica detallada de la implementación de modalidades online/presencial.

### 3. Manual del Panel de Administración
```bash
npm run generate-admin-manual
```
Genera `Manual-Panel-Administracion-PsiConnect.pdf` con documentación completa del panel de administración.

### 4. Resumen Técnico y Consideraciones de Backup
```bash
npm run generate-tech-summary
```
Genera `Resumen-Tecnico-PsiConnect.pdf` con documentación técnica liviana, hitos importantes implementados y estrategias de backup.

### 5. Documentación Completa
```bash
npm run generate-all-docs
```
Ejecuta todos los scripts y genera toda la documentación del proyecto.

## 📋 Contenido de los Documentos

### Manual de Usuario
- ✅ Guía paso a paso de la plataforma
- ✅ Explicación de filtros y búsquedas
- ✅ Proceso de agendamiento completo
- ✅ Gestión de sesiones
- ✅ Preguntas frecuentes
- ✅ Soporte técnico

### Manual del Panel de Administración
- ✅ Guía completa del panel de administración
- ✅ Gestión CRUD de psicólogos
- ✅ Configuración de horarios y especialidades
- ✅ Herramientas de mantenimiento de base de datos
- ✅ Estadísticas y monitoreo

### Documentación Técnica de Modalidades
- ✅ Resumen ejecutivo de cambios
- ✅ Arquitectura de tipos TypeScript
- ✅ Comparaciones antes/después del código
- ✅ Algoritmos de filtrado implementados
- ✅ Mejoras en UI/UX
- ✅ Casos de uso cubiertos
- ✅ Beneficios y mejoras futuras

### Resumen Técnico y Consideraciones de Backup
- ✅ Hitos técnicos implementados más importantes
- ✅ Arquitectura técnica actual (React + Node.js + SQLite)
- ✅ Estrategias de backup y recuperación en 3 niveles
- ✅ Evaluación de riesgos y mitigaciones
- ✅ Métricas de performance y escalabilidad
- ✅ Herramientas de monitoreo y diagnóstico
- ✅ Recomendaciones técnicas prioritarias

## 🔧 Requisitos Técnicos

- Node.js (versión 14+)
- Puppeteer (instalado automáticamente)
- Espacio libre en disco (~2MB por PDF)

## 📂 Archivos Generados

Los PDFs se crean en el directorio raíz del proyecto:
- `Manual-Usuario-PsiConnect.pdf`
- `Documentacion-Modalidades-PsiConnect.pdf`
- `Manual-Panel-Administracion-PsiConnect.pdf`
- `Resumen-Tecnico-PsiConnect.pdf`

## 🎨 Personalización

Los scripts utilizan HTML/CSS para generar contenido profesional con:
- Diseño responsivo
- Colores corporativos de PsiConnect
- Tipografía optimizada para impresión
- Iconos y elementos visuales
- Tablas y códigos de ejemplo

## 🚀 Uso en Producción

Estos scripts pueden ejecutarse en:
- ✅ Desarrollo local
- ✅ CI/CD pipelines
- ✅ Servidores de producción
- ✅ Entornos Docker

## 📞 Soporte

Para modificaciones o nuevos documentos, edita los archivos correspondientes en este directorio. 
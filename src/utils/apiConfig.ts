// Configuración centralizada de URL de API
export const getApiBaseUrl = () => {
  // Detectar entorno automáticamente
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    // En desarrollo local
    return 'http://localhost:3001/api';
  } else {
    // En cualquier entorno de producción (nginx proxy)
    return '/api';
  }
};
// Configuración centralizada de URL de API
export const getApiBaseUrl = () => {
  // Detectar entorno automáticamente
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    // En desarrollo local
    return 'http://localhost:3001/api';
  } else if (window.location.hostname === 'global-deer.com') {
    // En producción con dominio específico
    return 'https://api.global-deer.com/api';
  } else {
    // En cualquier otro entorno (nginx proxy)
    return '/api';
  }
};
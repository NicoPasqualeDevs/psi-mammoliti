import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useDatabase } from '../hooks/useDatabase';
import { Psicologo, Modalidad } from '../types';
import { generarHorariosAleatorios } from '../utils/horarioGenerator';
import { GestionHorarios } from './GestionHorarios';

type TabType = 'dashboard' | 'psicologos' | 'formulario' | 'configuracion';

// Función para obtener la URL base de la API
const getApiBaseUrl = () => {
  // En desarrollo, el backend corre en puerto 3001
  return 'http://localhost:3001/api';
};

export const Admin: React.FC = () => {
  const { 
    psicologos, 
    loading, 
    error, 
    stats,
    insertarPsicologo,
    actualizarPsicologo,
    eliminarPsicologo,
    limpiarYRecargarDB
  } = useDatabase();
  
  // Estados principales
  const [procesando, setProcesando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [tipoMensaje, setTipoMensaje] = useState<'success' | 'error'>('success');
  const [tabActiva, setTabActiva] = useState<TabType>('dashboard');
  
  // Estados para psicólogos
  const [psicologoEditando, setPsicologoEditando] = useState<Psicologo | null>(null);
  const [mostrarGestionHorarios, setMostrarGestionHorarios] = useState(false);
  const [psicologoParaHorarios, setPsicologoParaHorarios] = useState<Psicologo | null>(null);
  
  // Estados para filtros y búsqueda
  const [busqueda, setBusqueda] = useState('');
  const [filtroEspecialidad, setFiltroEspecialidad] = useState('');
  const [filtroModalidad, setFiltroModalidad] = useState<Modalidad | ''>('');
  const [vistaLista, setVistaLista] = useState<'cards' | 'tabla'>('cards');
  
  // Estados para modal de limpiar BD
  const [mostrarModalLimpiar, setMostrarModalLimpiar] = useState(false);
  const [regenerarDatos, setRegenerarDatos] = useState(true);
  
  // Estado del formulario
  const [formulario, setFormulario] = useState({
    nombre: '',
    apellido: '',
    especialidades: '',
    experiencia: 2,
    precio: 75,
    descripcion: '',
    modalidades: ['online', 'presencial'] as Modalidad[],
    generarHorarios: true
  });

  // Errores de validación en tiempo real
  const [erroresValidacion, setErroresValidacion] = useState<Record<string, string>>({});

  const mostrarMensaje = (msg: string, tipo: 'success' | 'error' = 'success') => {
    setMensaje(msg);
    setTipoMensaje(tipo);
    setTimeout(() => setMensaje(''), 5000);
  };

  // Función para manejar la limpieza de BD con regeneración opcional
  const manejarLimpiarBD = async () => {
    setProcesando(true);
    setMostrarModalLimpiar(false);
    
    try {
      mostrarMensaje(regenerarDatos ? '🧹 Limpiando BD y regenerando datos...' : '🧹 Limpiando base de datos...');
      
      // Usar el nuevo endpoint unificado
      const response = await fetch(`${getApiBaseUrl()}/limpiar-y-regenerar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          regenerarDatos: regenerarDatos
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        if (data.regeneracionRealizada) {
          mostrarMensaje('✅ Base de datos limpiada y datos de prueba regenerados exitosamente');
        } else {
          mostrarMensaje('✅ Base de datos limpiada exitosamente');
        }
        
        // Recargar los datos en el frontend
        window.location.reload();
      } else {
        mostrarMensaje(`❌ ${data.error || 'Error en la operación'}`, 'error');
      }
    } catch (error) {
      console.error('Error en operación de limpieza:', error);
      mostrarMensaje('❌ Error al procesar la operación', 'error');
    } finally {
      setProcesando(false);
    }
  };

  // Especialidades únicas para filtros
  const especialidadesUnicas = useMemo(() => {
    const especialidades = new Set<string>();
    psicologos.forEach(p => p.especialidades.forEach(e => especialidades.add(e)));
    return Array.from(especialidades).sort();
  }, [psicologos]);

  // Psicólogos filtrados
  const psicologosFiltrados = useMemo(() => {
    return psicologos.filter(psicologo => {
      // Filtro de búsqueda
      if (busqueda) {
        const terminoBusqueda = busqueda.toLowerCase();
        const coincide = 
          psicologo.nombre.toLowerCase().includes(terminoBusqueda) ||
          psicologo.apellido.toLowerCase().includes(terminoBusqueda) ||
          psicologo.especialidades.some(e => e.toLowerCase().includes(terminoBusqueda)) ||
          psicologo.descripcion.toLowerCase().includes(terminoBusqueda);
        if (!coincide) return false;
      }
      
      // Filtro de especialidad
      if (filtroEspecialidad && !psicologo.especialidades.includes(filtroEspecialidad)) {
        return false;
      }
      
      // Filtro de modalidad
      if (filtroModalidad && !psicologo.modalidades.includes(filtroModalidad)) {
        return false;
      }
      
      return true;
    });
  }, [psicologos, busqueda, filtroEspecialidad, filtroModalidad]);

  const validarCampo = (campo: string, valor: any) => {
    const errores = { ...erroresValidacion };
    
    switch (campo) {
      case 'nombre':
        if (!valor.trim()) {
          errores.nombre = 'El nombre es requerido';
        } else if (valor.trim().length < 2) {
          errores.nombre = 'El nombre debe tener al menos 2 caracteres';
        } else {
          delete errores.nombre;
        }
        break;
        
      case 'apellido':
        if (!valor.trim()) {
          errores.apellido = 'El apellido es requerido';
        } else if (valor.trim().length < 2) {
          errores.apellido = 'El apellido debe tener al menos 2 caracteres';
        } else {
          delete errores.apellido;
        }
        break;
        
      case 'especialidades':
        if (!valor.trim()) {
          errores.especialidades = 'Debes agregar al menos una especialidad';
        } else {
          delete errores.especialidades;
        }
        break;
        
      case 'descripcion':
        if (!valor.trim()) {
          errores.descripcion = 'La descripción es requerida';
        } else if (valor.trim().length < 20) {
          errores.descripcion = 'La descripción debe tener al menos 20 caracteres';
        } else {
          delete errores.descripcion;
        }
        break;
        
      case 'experiencia':
        if (valor < 1 || valor > 30) {
          errores.experiencia = 'La experiencia debe estar entre 1 y 30 años';
        } else {
          delete errores.experiencia;
        }
        break;
        
      case 'precio':
        if (valor < 30 || valor > 300) {
          errores.precio = 'El precio debe estar entre $30 y $300';
        } else {
          delete errores.precio;
        }
        break;
    }
    
    setErroresValidacion(errores);
  };

  const limpiarFormulario = () => {
    setFormulario({
      nombre: '',
      apellido: '',
      especialidades: '',
      experiencia: 2,
      precio: 75,
      descripcion: '',
      modalidades: ['online', 'presencial'],
      generarHorarios: true
    });
    setPsicologoEditando(null);
    setErroresValidacion({});
  };

  const iniciarEdicion = (psicologo: Psicologo) => {
    setPsicologoEditando(psicologo);
    setFormulario({
      nombre: psicologo.nombre,
      apellido: psicologo.apellido,
      especialidades: psicologo.especialidades.join(', '),
      experiencia: psicologo.experiencia,
      precio: psicologo.precio,
      descripcion: psicologo.descripcion,
      modalidades: psicologo.modalidades,
      generarHorarios: false
    });
    setTabActiva('formulario');
    setErroresValidacion({});
  };

  const cancelarEdicion = () => {
    limpiarFormulario();
    setTabActiva('psicologos');
  };

  const eliminarPsicologoHandler = async (id: string, nombre: string) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar a ${nombre}? Esta acción no se puede deshacer.`)) {
      return;
    }

    setProcesando(true);
    try {
      const exito = await eliminarPsicologo(id);
      
      if (exito) {
        mostrarMensaje(`✅ Psicólogo ${nombre} eliminado exitosamente`);
      } else {
        mostrarMensaje('❌ Error al eliminar el psicólogo', 'error');
      }
    } catch (error) {
      console.error('Error eliminando psicólogo:', error);
      mostrarMensaje('❌ Error al eliminar el psicólogo', 'error');
    } finally {
      setProcesando(false);
    }
  };

  const manejarFormulario = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar todos los campos
    validarCampo('nombre', formulario.nombre);
    validarCampo('apellido', formulario.apellido);
    validarCampo('especialidades', formulario.especialidades);
    validarCampo('descripcion', formulario.descripcion);
    validarCampo('experiencia', formulario.experiencia);
    validarCampo('precio', formulario.precio);
    
    if (Object.keys(erroresValidacion).length > 0) {
      mostrarMensaje('❌ Por favor corrige los errores en el formulario', 'error');
      return;
    }

    setProcesando(true);
    
    try {
      const especialidades = formulario.especialidades
        .split(',')
        .map(esp => esp.trim())
        .filter(esp => esp.length > 0);

      if (psicologoEditando) {
        // Actualizar psicólogo existente
        const psicologoActualizado: Psicologo = {
          ...psicologoEditando,
          nombre: formulario.nombre.trim(),
          apellido: formulario.apellido.trim(),
          especialidades,
          experiencia: formulario.experiencia,
          precio: formulario.precio,
          descripcion: formulario.descripcion.trim(),
          modalidades: formulario.modalidades
        };

        const exito = await actualizarPsicologo(psicologoActualizado);
        
        if (exito) {
          mostrarMensaje(`✅ Psicólogo ${psicologoActualizado.nombre} ${psicologoActualizado.apellido} actualizado exitosamente`);
          limpiarFormulario();
          setTabActiva('psicologos');
        } else {
          mostrarMensaje('❌ Error al actualizar el psicólogo', 'error');
        }
      } else {
        // Crear nuevo psicólogo
        const nuevoPsicologo: Psicologo = {
          id: `psi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          nombre: formulario.nombre.trim(),
          apellido: formulario.apellido.trim(),
          especialidades,
          experiencia: formulario.experiencia,
          precio: formulario.precio,
          descripcion: formulario.descripcion.trim(),
          rating: Math.round((Math.random() * 1.5 + 3.5) * 10) / 10,
          modalidades: formulario.modalidades,
          imagen: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=300&fit=crop&crop=face',
          disponibilidad: formulario.generarHorarios ? generarHorariosAleatorios() : []
        };

        const exito = await insertarPsicologo(nuevoPsicologo);
        
        if (exito) {
          mostrarMensaje(`✅ Psicólogo ${nuevoPsicologo.nombre} ${nuevoPsicologo.apellido} agregado exitosamente`);
          limpiarFormulario();
          setTabActiva('psicologos');
        } else {
          mostrarMensaje('❌ Error al agregar el psicólogo', 'error');
        }
      }
    } catch (error) {
      console.error('Error en formulario:', error);
      mostrarMensaje(`❌ Error al procesar el formulario: ${error instanceof Error ? error.message : 'Error desconocido'}`, 'error');
    } finally {
      setProcesando(false);
    }
  };

  const handleModalidadChange = (modalidad: Modalidad, checked: boolean) => {
    setFormulario(prev => {
      const nuevasModalidades = checked
        ? [...prev.modalidades, modalidad]
        : prev.modalidades.filter(m => m !== modalidad);
      
      return {
        ...prev,
        modalidades: nuevasModalidades
      };
    });
  };

  const abrirGestionHorarios = (psicologo: Psicologo) => {
    setPsicologoParaHorarios(psicologo);
    setMostrarGestionHorarios(true);
  };

  const cerrarGestionHorarios = () => {
    setMostrarGestionHorarios(false);
    setPsicologoParaHorarios(null);
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Cargando panel de administración...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-error">
        <h2>Error en el panel de administración</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="admin-panel-modern">
      {/* Header */}
      <div className="admin-header-modern">
        <div className="header-content">
          <h1>🛠️ Panel de Administración</h1>
          <p>Gestiona la plataforma de psicólogos</p>
        </div>
        <Link to="/" className="btn-back">
          ← Volver a la aplicación
        </Link>
      </div>

      {/* Navegación por pestañas */}
      <div className="admin-tabs">
        <button 
          className={`tab-button ${tabActiva === 'dashboard' ? 'active' : ''}`}
          onClick={() => setTabActiva('dashboard')}
        >
          📊 Dashboard
        </button>
        <button 
          className={`tab-button ${tabActiva === 'psicologos' ? 'active' : ''}`}
          onClick={() => setTabActiva('psicologos')}
        >
          👥 Psicólogos ({psicologos.length})
        </button>
        <button 
          className={`tab-button ${tabActiva === 'formulario' ? 'active' : ''}`}
          onClick={() => {
            setTabActiva('formulario');
            if (psicologoEditando) {
              limpiarFormulario();
            }
          }}
        >
          ✏️ {psicologoEditando ? 'Editar' : 'Nuevo'}
        </button>
        <button 
          className={`tab-button ${tabActiva === 'configuracion' ? 'active' : ''}`}
          onClick={() => setTabActiva('configuracion')}
        >
          ⚙️ Configuración
        </button>
      </div>

      {/* Mensajes */}
      {mensaje && (
        <div className={`admin-message-modern ${tipoMensaje}`}>
          {mensaje}
        </div>
      )}

      {/* Contenido de las pestañas */}
      <div className="admin-content">
        {tabActiva === 'dashboard' && (
          <div className="dashboard-content">
            {/* Estadísticas principales */}
            <div className="stats-grid-modern">
              <div className="stat-card-modern">
                <div className="stat-icon">👥</div>
                <div className="stat-content">
                  <h3>Psicólogos</h3>
                  <span className="stat-number">{stats.totalPsicologos}</span>
                  <span className="stat-change">+2 este mes</span>
                </div>
              </div>
              <div className="stat-card-modern">
                <div className="stat-icon">📅</div>
                <div className="stat-content">
                  <h3>Sesiones</h3>
                  <span className="stat-number">{stats.totalSesiones}</span>
                  <span className="stat-change">+15 esta semana</span>
                </div>
              </div>
              <div className="stat-card-modern">
                <div className="stat-icon">🏷️</div>
                <div className="stat-content">
                  <h3>Especialidades</h3>
                  <span className="stat-number">{stats.especialidadesUnicas}</span>
                  <span className="stat-change">Activas</span>
                </div>
              </div>
              <div className="stat-card-modern">
                <div className="stat-icon">⭐</div>
                <div className="stat-content">
                  <h3>Rating Promedio</h3>
                  <span className="stat-number">
                    {psicologos.length > 0 
                      ? (psicologos.reduce((acc, p) => acc + p.rating, 0) / psicologos.length).toFixed(1)
                      : '0.0'
                    }
                  </span>
                  <span className="stat-change">De 5.0</span>
                </div>
              </div>
            </div>

            {/* Acciones rápidas */}
            <div className="quick-actions">
              <h3>Acciones Rápidas</h3>
              <div className="action-buttons">
                <button 
                  className="action-button primary"
                  onClick={() => setTabActiva('formulario')}
                >
                  ✏️ Agregar Psicólogo
                </button>
                <button 
                  className="action-button secondary"
                  onClick={() => setTabActiva('psicologos')}
                >
                  👥 Ver Psicólogos
                </button>
                <button 
                  className="action-button danger"
                  onClick={() => setMostrarModalLimpiar(true)}
                  disabled={procesando}
                >
                  🗑️ Limpiar DB
                </button>
              </div>
            </div>

            {/* Estadísticas por especialidad */}
            <div className="specialty-stats">
              <h3>Especialidades Más Populares</h3>
              <div className="specialty-chart">
                {especialidadesUnicas.slice(0, 5).map(especialidad => {
                  const count = psicologos.filter(p => p.especialidades.includes(especialidad)).length;
                  const porcentaje = (count / psicologos.length) * 100;
                  
                  return (
                    <div key={especialidad} className="specialty-bar">
                      <span className="specialty-name">{especialidad}</span>
                      <div className="specialty-progress">
                        <div 
                          className="specialty-fill" 
                          style={{ width: `${porcentaje}%` }}
                        ></div>
                      </div>
                      <span className="specialty-count">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {tabActiva === 'psicologos' && (
          <div className="psicologos-content">
            {/* Controles de filtro */}
            <div className="filter-controls">
              <div className="search-box">
                <input
                  type="text"
                  placeholder="🔍 Buscar psicólogos..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="search-input"
                />
              </div>
              
              <div className="filter-group">
                <select
                  value={filtroEspecialidad}
                  onChange={(e) => setFiltroEspecialidad(e.target.value)}
                  className="filter-select"
                >
                  <option value="">Todas las especialidades</option>
                  {especialidadesUnicas.map(esp => (
                    <option key={esp} value={esp}>{esp}</option>
                  ))}
                </select>
                
                <select
                  value={filtroModalidad}
                  onChange={(e) => setFiltroModalidad(e.target.value as Modalidad | '')}
                  className="filter-select"
                >
                  <option value="">Todas las modalidades</option>
                  <option value="online">💻 Online</option>
                  <option value="presencial">🏢 Presencial</option>
                </select>
              </div>
              
              <div className="view-controls">
                <button
                  className={`view-button ${vistaLista === 'cards' ? 'active' : ''}`}
                  onClick={() => setVistaLista('cards')}
                >
                  📋 Cards
                </button>
                <button
                  className={`view-button ${vistaLista === 'tabla' ? 'active' : ''}`}
                  onClick={() => setVistaLista('tabla')}
                >
                  📊 Tabla
                </button>
              </div>
            </div>

            {/* Resultados */}
            <div className="results-info">
              Mostrando {psicologosFiltrados.length} de {psicologos.length} psicólogos
            </div>

            {/* Lista de psicólogos */}
            {psicologosFiltrados.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🔍</div>
                <h3>No se encontraron psicólogos</h3>
                <p>Intenta ajustar los filtros de búsqueda</p>
                <button 
                  className="btn-primary" 
                  onClick={() => {
                    setBusqueda('');
                    setFiltroEspecialidad('');
                    setFiltroModalidad('');
                  }}
                >
                  Limpiar filtros
                </button>
              </div>
            ) : (
              <div className={vistaLista === 'cards' ? 'psicologos-grid' : 'psicologos-table'}>
                {vistaLista === 'cards' ? (
                  psicologosFiltrados.map(psicologo => (
                    <div key={psicologo.id} className="psicologo-card-admin">
                      <div className="card-header">
                        <img src={psicologo.imagen} alt={psicologo.nombre} className="psicologo-avatar" />
                        <div className="card-info">
                          <h4>{psicologo.nombre} {psicologo.apellido}</h4>
                          <div className="rating">⭐ {psicologo.rating}</div>
                        </div>
                      </div>
                      
                      <div className="card-content">
                        <p className="experiencia">{psicologo.experiencia} años de experiencia</p>
                        <p className="precio">${psicologo.precio}/sesión</p>
                        
                        <div className="especialidades-tags">
                          {psicologo.especialidades.slice(0, 2).map(esp => (
                            <span key={esp} className="especialidad-tag">{esp}</span>
                          ))}
                          {psicologo.especialidades.length > 2 && (
                            <span className="mas-tags">+{psicologo.especialidades.length - 2}</span>
                          )}
                        </div>
                        
                        <div className="modalidades-badges">
                          {psicologo.modalidades.map(modalidad => (
                            <span key={modalidad} className="modalidad-badge">
                              {modalidad === 'online' ? '💻' : '🏢'} {modalidad}
                            </span>
                          ))}
                        </div>
                        
                        <div className="horarios-info">
                          {psicologo.tieneHorariosConfigurados 
                            ? '✅ Horarios configurados' 
                            : '❌ Sin horarios'}
                        </div>
                      </div>
                      
                      <div className="card-actions">
                        <button 
                          onClick={() => abrirGestionHorarios(psicologo)}
                          className="btn-action horarios"
                          disabled={procesando}
                        >
                          🕒
                        </button>
                        <button 
                          onClick={() => iniciarEdicion(psicologo)}
                          className="btn-action edit"
                          disabled={procesando}
                        >
                          ✏️
                        </button>
                        <button 
                          onClick={() => eliminarPsicologoHandler(psicologo.id, `${psicologo.nombre} ${psicologo.apellido}`)}
                          className="btn-action delete"
                          disabled={procesando}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="table-wrapper">
                    <table className="psicologos-table-view">
                      <thead>
                        <tr>
                          <th>Psicólogo</th>
                          <th>Especialidades</th>
                          <th>Experiencia</th>
                          <th>Precio</th>
                          <th>Rating</th>
                          <th>Horarios</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {psicologosFiltrados.map(psicologo => (
                          <tr key={psicologo.id}>
                            <td>
                              <div className="table-psicologo">
                                <img src={psicologo.imagen} alt={psicologo.nombre} className="table-avatar" />
                                <div>
                                  <div className="table-name">{psicologo.nombre} {psicologo.apellido}</div>
                                  <div className="table-modalidades">
                                    {psicologo.modalidades.map(m => m === 'online' ? '💻' : '🏢').join(' ')}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div className="table-especialidades">
                                {psicologo.especialidades.slice(0, 2).join(', ')}
                                {psicologo.especialidades.length > 2 && ' ...'}
                              </div>
                            </td>
                            <td>{psicologo.experiencia} años</td>
                            <td>${psicologo.precio}</td>
                            <td>⭐ {psicologo.rating}</td>
                            <td>
                              {psicologo.tieneHorariosConfigurados 
                                ? '✅ Configurados' 
                                : '❌ Sin configurar'}
                            </td>
                            <td>
                              <div className="table-actions">
                                <button 
                                  onClick={() => abrirGestionHorarios(psicologo)}
                                  className="btn-action-small horarios"
                                  disabled={procesando}
                                  title="Gestionar horarios"
                                >
                                  🕒
                                </button>
                                <button 
                                  onClick={() => iniciarEdicion(psicologo)}
                                  className="btn-action-small edit"
                                  disabled={procesando}
                                  title="Editar"
                                >
                                  ✏️
                                </button>
                                <button 
                                  onClick={() => eliminarPsicologoHandler(psicologo.id, `${psicologo.nombre} ${psicologo.apellido}`)}
                                  className="btn-action-small delete"
                                  disabled={procesando}
                                  title="Eliminar"
                                >
                                  🗑️
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {tabActiva === 'formulario' && (
          <div className="formulario-content">
            <h3>{psicologoEditando ? 'Editar Psicólogo' : 'Agregar Nuevo Psicólogo'}</h3>
            
            <form onSubmit={manejarFormulario} className="formulario-moderno">
              <div className="form-section">
                <h4>Información Personal</h4>
                <div className="form-row">
                  <div className="form-field">
                    <label>Nombre *</label>
                    <input
                      type="text"
                      value={formulario.nombre}
                      onChange={(e) => {
                        setFormulario({...formulario, nombre: e.target.value});
                        validarCampo('nombre', e.target.value);
                      }}
                      className={erroresValidacion.nombre ? 'error' : ''}
                      placeholder="Nombre del psicólogo"
                      required
                    />
                    {erroresValidacion.nombre && <span className="error-message">{erroresValidacion.nombre}</span>}
                  </div>
                  
                  <div className="form-field">
                    <label>Apellido *</label>
                    <input
                      type="text"
                      value={formulario.apellido}
                      onChange={(e) => {
                        setFormulario({...formulario, apellido: e.target.value});
                        validarCampo('apellido', e.target.value);
                      }}
                      className={erroresValidacion.apellido ? 'error' : ''}
                      placeholder="Apellido del psicólogo"
                      required
                    />
                    {erroresValidacion.apellido && <span className="error-message">{erroresValidacion.apellido}</span>}
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h4>Información Profesional</h4>
                
                <div className="form-field">
                  <label>Especialidades *</label>
                  <input
                    type="text"
                    value={formulario.especialidades}
                    onChange={(e) => {
                      setFormulario({...formulario, especialidades: e.target.value});
                      validarCampo('especialidades', e.target.value);
                    }}
                    className={erroresValidacion.especialidades ? 'error' : ''}
                    placeholder="Ej: Ansiedad, Depresión, Terapia Cognitivo-Conductual"
                    required
                  />
                  <small>Separa cada especialidad con una coma</small>
                  {erroresValidacion.especialidades && <span className="error-message">{erroresValidacion.especialidades}</span>}
                </div>

                <div className="form-row">
                  <div className="form-field">
                    <label>Experiencia (años) *</label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={formulario.experiencia}
                      onChange={(e) => {
                        const valor = parseInt(e.target.value) || 1;
                        setFormulario({...formulario, experiencia: valor});
                        validarCampo('experiencia', valor);
                      }}
                      className={erroresValidacion.experiencia ? 'error' : ''}
                      required
                    />
                    {erroresValidacion.experiencia && <span className="error-message">{erroresValidacion.experiencia}</span>}
                  </div>
                  
                  <div className="form-field">
                    <label>Precio por sesión ($) *</label>
                    <input
                      type="number"
                      min="30"
                      max="300"
                      step="5"
                      value={formulario.precio}
                      onChange={(e) => {
                        const valor = parseInt(e.target.value) || 30;
                        setFormulario({...formulario, precio: valor});
                        validarCampo('precio', valor);
                      }}
                      className={erroresValidacion.precio ? 'error' : ''}
                      required
                    />
                    {erroresValidacion.precio && <span className="error-message">{erroresValidacion.precio}</span>}
                  </div>
                </div>

                <div className="form-field">
                  <label>Modalidades disponibles *</label>
                  <div className="modalidades-checkboxes">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formulario.modalidades.includes('online')}
                        onChange={(e) => handleModalidadChange('online', e.target.checked)}
                      />
                      <span>💻 Online</span>
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formulario.modalidades.includes('presencial')}
                        onChange={(e) => handleModalidadChange('presencial', e.target.checked)}
                      />
                      <span>🏢 Presencial</span>
                    </label>
                  </div>
                </div>

                <div className="form-field">
                  <label>Descripción profesional *</label>
                  <textarea
                    value={formulario.descripcion}
                    onChange={(e) => {
                      setFormulario({...formulario, descripcion: e.target.value});
                      validarCampo('descripcion', e.target.value);
                    }}
                    className={erroresValidacion.descripcion ? 'error' : ''}
                    placeholder="Descripción profesional, especialidades, enfoque terapéutico..."
                    rows={4}
                    required
                  />
                  <small>{formulario.descripcion.length}/500 caracteres</small>
                  {erroresValidacion.descripcion && <span className="error-message">{erroresValidacion.descripcion}</span>}
                </div>

                {!psicologoEditando && (
                  <div className="form-field">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formulario.generarHorarios}
                        onChange={(e) => setFormulario({...formulario, generarHorarios: e.target.checked})}
                      />
                      <span>Generar horarios de disponibilidad automáticamente</span>
                    </label>
                    <small>Si no se marca, el psicólogo se creará sin horarios disponibles</small>
                  </div>
                )}
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  onClick={cancelarEdicion}
                  className="btn-secondary"
                  disabled={procesando}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={procesando || Object.keys(erroresValidacion).length > 0}
                >
                  {procesando ? 'Procesando...' : (psicologoEditando ? 'Actualizar Psicólogo' : 'Agregar Psicólogo')}
                </button>
              </div>
            </form>
          </div>
        )}

        {tabActiva === 'configuracion' && (
          <div className="configuracion-content">
            <h3>Configuración del Sistema</h3>
            
            <div className="config-section">
              <h4>Base de Datos</h4>
              <p>Gestiona los datos del sistema</p>
              
              <div className="config-actions">
                <button 
                  className="config-button danger"
                  onClick={() => setMostrarModalLimpiar(true)}
                  disabled={procesando}
                >
                  🗑️ Limpiar Base de Datos
                </button>
              </div>
            </div>

            <div className="config-section">
              <h4>Estadísticas del Sistema</h4>
              <div className="system-stats">
                <div className="system-stat">
                  <span className="stat-label">Total de Psicólogos:</span>
                  <span className="stat-value">{stats.totalPsicologos}</span>
                </div>
                <div className="system-stat">
                  <span className="stat-label">Total de Sesiones:</span>
                  <span className="stat-value">{stats.totalSesiones}</span>
                </div>
                <div className="system-stat">
                  <span className="stat-label">Especialidades Únicas:</span>
                  <span className="stat-value">{stats.especialidadesUnicas}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de gestión de horarios */}
      {mostrarGestionHorarios && psicologoParaHorarios && (
        <GestionHorarios
          psicologo={psicologoParaHorarios}
          onCerrar={cerrarGestionHorarios}
        />
      )}

      {/* Modal de confirmación para limpiar BD */}
      {mostrarModalLimpiar && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>🗑️ Limpiar Base de Datos</h3>
            </div>
            
            <div className="modal-body">
              <p className="warning-text">
                <strong>⚠️ ¿Estás seguro de que quieres limpiar toda la base de datos?</strong>
              </p>
              <p>Esta acción eliminará todos los psicólogos y sesiones.</p>
              
              <div className="regenerar-option">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={regenerarDatos}
                    onChange={(e) => setRegenerarDatos(e.target.checked)}
                  />
                  <span className="checkmark"></span>
                  Regenerar datos de prueba después de limpiar
                </label>
                <p className="option-description">
                  Incluye psicólogos de ejemplo y sesiones de prueba para facilitar el testing
                </p>
              </div>
            </div>
            
            <div className="modal-actions">
              <button 
                className="btn-secondary"
                onClick={() => setMostrarModalLimpiar(false)}
                disabled={procesando}
              >
                Cancelar
              </button>
              <button 
                className="btn-danger"
                onClick={manejarLimpiarBD}
                disabled={procesando}
              >
                {procesando ? 'Procesando...' : 'Confirmar Limpieza'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDatabase } from '../hooks/useDatabase';
import { Psicologo, Modalidad } from '../types';
import { generarHorariosAleatorios } from '../utils/horarioGenerator';
import { GestionHorarios } from './GestionHorarios';

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
  
  const [procesando, setProcesando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [psicologoEditando, setPsicologoEditando] = useState<Psicologo | null>(null);
  const [mostrarGestionHorarios, setMostrarGestionHorarios] = useState(false);
  const [psicologoParaHorarios, setPsicologoParaHorarios] = useState<Psicologo | null>(null);
  
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

  const mostrarMensaje = (msg: string, _tipo: 'success' | 'error' = 'success') => {
    setMensaje(msg);
    setTimeout(() => setMensaje(''), 5000);
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
    setMostrarFormulario(false);
    setPsicologoEditando(null);
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
    setMostrarFormulario(true);
  };

  const cancelarEdicion = () => {
    limpiarFormulario();
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

  const validarFormulario = (): string | null => {
    if (!formulario.nombre.trim()) {
      return 'El nombre es requerido';
    }
    if (!formulario.apellido.trim()) {
      return 'El apellido es requerido';
    }
    if (!formulario.especialidades.trim()) {
      return 'Debes agregar al menos una especialidad';
    }
    if (!formulario.descripcion.trim()) {
      return 'La descripción es requerida';
    }
    if (formulario.experiencia < 1 || formulario.experiencia > 30) {
      return 'La experiencia debe estar entre 1 y 30 años';
    }
    if (formulario.precio < 30 || formulario.precio > 300) {
      return 'El precio debe estar entre $30 y $300';
    }
    if (formulario.modalidades.length === 0) {
      return 'Debes seleccionar al menos una modalidad';
    }
    return null;
  };

  const manejarFormulario = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errorValidacion = validarFormulario();
    if (errorValidacion) {
      mostrarMensaje(`❌ ${errorValidacion}`, 'error');
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
          rating: Math.round((Math.random() * 1.5 + 3.5) * 10) / 10, // 3.5-5.0
          modalidades: formulario.modalidades,
          imagen: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=300&fit=crop&crop=face',
          disponibilidad: formulario.generarHorarios ? generarHorariosAleatorios() : []
        };

        const exito = await insertarPsicologo(nuevoPsicologo);
        
        if (exito) {
          mostrarMensaje(`✅ Psicólogo ${nuevoPsicologo.nombre} ${nuevoPsicologo.apellido} agregado exitosamente`);
          limpiarFormulario();
        } else {
          mostrarMensaje('❌ Error al agregar el psicólogo. Revisa la consola para más detalles.', 'error');
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
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div className="loading-spinner"></div>
        <p>Cargando panel de administración...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#e74c3c' }}>
        <h2>Error en el panel de administración</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1>🛠️ Panel de Administración</h1>
        <p>Gestiona la base de datos de psicólogos</p>
        <div style={{ marginTop: '15px' }}>
          <Link to="/" style={{ 
            color: 'white', 
            textDecoration: 'none', 
            background: 'rgba(255,255,255,0.2)', 
            padding: '8px 16px', 
            borderRadius: '20px',
            fontSize: '14px'
          }}>
            ← Volver a la aplicación
          </Link>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="admin-stats">
        <div className="stat-card">
          <h3>👥 Psicólogos</h3>
          <span className="stat-number">{stats.totalPsicologos}</span>
        </div>
        <div className="stat-card">
          <h3>📅 Sesiones</h3>
          <span className="stat-number">{stats.totalSesiones}</span>
        </div>
        <div className="stat-card">
          <h3>🏷️ Especialidades</h3>
          <span className="stat-number">{stats.especialidadesUnicas}</span>
        </div>
      </div>

      {/* Mensajes */}
      {mensaje && (
        <div className={`admin-message ${mensaje.includes('❌') ? 'error' : 'success'}`}>
          {mensaje}
        </div>
      )}

      {/* Acciones */}
      <div className="admin-actions">
        <button 
          onClick={() => {
            setPsicologoEditando(null);
            setMostrarFormulario(!mostrarFormulario);
          }}
          className="btn-secondary"
          disabled={procesando}
        >
          ✏️ Agregar Nuevo Psicólogo
        </button>
        
        <button 
          onClick={async () => {
            if (window.confirm('¿Estás seguro de que quieres limpiar toda la base de datos? Esto eliminará todos los datos del servidor.')) {
              setProcesando(true);
              try {
                const exito = await limpiarYRecargarDB();
                if (exito) {
                  mostrarMensaje('✅ Base de datos limpiada exitosamente');
                } else {
                  mostrarMensaje('❌ Error al limpiar la base de datos', 'error');
                }
              } catch (error) {
                console.error('Error limpiando base de datos:', error);
                mostrarMensaje('❌ Error al limpiar la base de datos', 'error');
              } finally {
                setProcesando(false);
              }
            }
          }}
          className="btn-danger"
          disabled={procesando}
        >
          🗑️ Limpiar DB
        </button>
      </div>

      {/* Formulario */}
      {mostrarFormulario && (
        <div className="admin-form">
          <h3>{psicologoEditando ? 'Editar Psicólogo' : 'Agregar Nuevo Psicólogo'}</h3>
          <form onSubmit={manejarFormulario}>
            <div className="form-row">
              <div className="form-group">
                <label>Nombre: *</label>
                <input
                  type="text"
                  value={formulario.nombre}
                  onChange={(e) => setFormulario({...formulario, nombre: e.target.value})}
                  placeholder="Nombre del psicólogo"
                  required
                />
              </div>
              <div className="form-group">
                <label>Apellido: *</label>
                <input
                  type="text"
                  value={formulario.apellido}
                  onChange={(e) => setFormulario({...formulario, apellido: e.target.value})}
                  placeholder="Apellido del psicólogo"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Especialidades (separadas por comas): *</label>
              <input
                type="text"
                value={formulario.especialidades}
                onChange={(e) => setFormulario({...formulario, especialidades: e.target.value})}
                placeholder="Ej: Ansiedad, Depresión, Terapia Cognitivo-Conductual"
                required
              />
              <small>Separa cada especialidad con una coma</small>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Experiencia (años): *</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={formulario.experiencia}
                  onChange={(e) => setFormulario({...formulario, experiencia: parseInt(e.target.value) || 1})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Precio por sesión ($): *</label>
                <input
                  type="number"
                  min="30"
                  max="300"
                  step="5"
                  value={formulario.precio}
                  onChange={(e) => setFormulario({...formulario, precio: parseInt(e.target.value) || 30})}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Modalidades disponibles: *</label>
              <div style={{ display: 'flex', gap: '20px', marginTop: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                  <input
                    type="checkbox"
                    checked={formulario.modalidades.includes('online')}
                    onChange={(e) => handleModalidadChange('online', e.target.checked)}
                  />
                  💻 Online
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                  <input
                    type="checkbox"
                    checked={formulario.modalidades.includes('presencial')}
                    onChange={(e) => handleModalidadChange('presencial', e.target.checked)}
                  />
                  🏢 Presencial
                </label>
              </div>
            </div>

            <div className="form-group">
              <label>Descripción: *</label>
              <textarea
                value={formulario.descripcion}
                onChange={(e) => setFormulario({...formulario, descripcion: e.target.value})}
                placeholder="Descripción profesional del psicólogo, especialidades, enfoque terapéutico..."
                rows={4}
                required
              />
            </div>

            {!psicologoEditando && (
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                  <input
                    type="checkbox"
                    checked={formulario.generarHorarios}
                    onChange={(e) => setFormulario({...formulario, generarHorarios: e.target.checked})}
                  />
                  Generar horarios de disponibilidad automáticamente
                </label>
                <small>Si no se marca, el psicólogo se creará sin horarios disponibles</small>
              </div>
            )}

            <div className="form-actions">
              <button type="submit" disabled={procesando} className="btn-primary">
                {procesando ? 'Procesando...' : (psicologoEditando ? 'Actualizar Psicólogo' : 'Agregar Psicólogo')}
              </button>
              <button type="button" onClick={cancelarEdicion} className="btn-secondary" disabled={procesando}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de psicólogos */}
      <div className="admin-list">
        <h3>📋 Psicólogos Registrados ({psicologos.length})</h3>
        <div className="psicologos-table">
          {psicologos.length === 0 ? (
            <div className="empty-state">
              <p>No hay psicólogos registrados</p>
              <p>Agrega algunos usando el botón de arriba</p>
            </div>
          ) : (
            <div className="table-container">
              {psicologos.map((psicologo) => (
                <div key={psicologo.id} className="psicologo-row">
                  <div className="psicologo-info">
                    <img src={psicologo.imagen} alt={psicologo.nombre} className="psicologo-avatar" />
                    <div className="psicologo-details">
                      <h4>{psicologo.nombre} {psicologo.apellido}</h4>
                      <p className="especialidades">{psicologo.especialidades.join(', ')}</p>
                      <p className="meta">
                        {psicologo.experiencia} años • ${psicologo.precio} • ⭐ {psicologo.rating}
                      </p>
                    </div>
                  </div>
                  <div className="psicologo-actions">
                    <span className="horarios-count">
                      {psicologo.disponibilidad.reduce((total, dia) => total + dia.horarios.length, 0)} horarios
                    </span>
                    <button 
                      onClick={() => abrirGestionHorarios(psicologo)}
                      disabled={procesando}
                      className="btn-special"
                    >
                      🕒 Horarios
                    </button>
                    <button 
                      onClick={() => iniciarEdicion(psicologo)}
                      disabled={procesando}
                      className="btn-edit"
                    >
                      ✏️ Editar
                    </button>
                    <button 
                      onClick={() => eliminarPsicologoHandler(psicologo.id, `${psicologo.nombre} ${psicologo.apellido}`)}
                      disabled={procesando}
                      className="btn-danger"
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de gestión de horarios */}
      {mostrarGestionHorarios && psicologoParaHorarios && (
        <GestionHorarios
          psicologo={psicologoParaHorarios}
          onCerrar={cerrarGestionHorarios}
        />
      )}
    </div>
  );
}; 
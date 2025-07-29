import React, { useState } from 'react';
import { Modalidad } from '../types';
import { useBuscarPsicologosDisponibles } from '../hooks/useBuscarPsicologosDisponibles';
import './BuscadorPsicologosDisponibles.css';
import { obtenerFechaArgentina, validarAnticipacionArgentina } from '../utils/timezone';

const BuscadorPsicologosDisponibles: React.FC = () => {
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [modalidad, setModalidad] = useState<Modalidad | ''>('');
  
  const {
    psicologosDisponibles,
    cargando,
    error,
    ultimaBusqueda,
    cantidadDisponibles,
    buscarPsicologos,
    limpiarResultados
  } = useBuscarPsicologosDisponibles();

  const handleBuscar = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fecha || !hora) {
      alert('Por favor ingrese fecha y hora');
      return;
    }

    // Validar que haya al menos 6 horas de anticipación
    if (!validarAnticipacionArgentina(fecha, hora)) {
      alert('La fecha y hora seleccionadas deben tener al menos 6 horas de anticipación desde ahora.');
      return;
    }

    await buscarPsicologos(fecha, hora, modalidad || undefined);
  };

  const obtenerFechaMinima = () => {
    return obtenerFechaArgentina(); // Hoy en Argentina
  };

  const obtenerFechaMaxima = () => {
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() + 30);
    return fechaLimite.toISOString().split('T')[0];
  };

  return (
    <div className="buscador-psicologos-disponibles">
      <div className="buscador-header">
        <h2>Buscar Psicólogos Disponibles</h2>
        <p>Encuentra qué psicólogos están disponibles en una fecha y hora específica</p>
      </div>

      <form onSubmit={handleBuscar} className="buscador-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="fecha">Fecha:</label>
            <input
              type="date"
              id="fecha"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              min={obtenerFechaMinima()}
              max={obtenerFechaMaxima()}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="hora">Hora:</label>
            <input
              type="time"
              id="hora"
              value={hora}
              onChange={(e) => setHora(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="modalidad">Modalidad (opcional):</label>
            <select
              id="modalidad"
              value={modalidad}
              onChange={(e) => setModalidad(e.target.value as Modalidad | '')}
            >
              <option value="">Todas las modalidades</option>
              <option value="presencial">Presencial</option>
              <option value="virtual">Virtual</option>
              <option value="telefonica">Telefónica</option>
            </select>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" disabled={cargando} className="btn-buscar">
            {cargando ? 'Buscando...' : 'Buscar Psicólogos'}
          </button>
          
          {psicologosDisponibles.length > 0 && (
            <button 
              type="button" 
              onClick={limpiarResultados}
              className="btn-limpiar"
            >
              Limpiar Resultados
            </button>
          )}
        </div>
      </form>

      {error && (
        <div className="error-message">
          <p>Error: {error}</p>
        </div>
      )}

      {ultimaBusqueda && (
        <div className="resultados-header">
          <h3>Resultados de Búsqueda</h3>
          <div className="busqueda-info">
            <p>
              <strong>Fecha:</strong> {ultimaBusqueda.fecha} | 
              <strong> Hora:</strong> {ultimaBusqueda.hora}
              {ultimaBusqueda.modalidad && (
                <span> | <strong>Modalidad:</strong> {ultimaBusqueda.modalidad}</span>
              )}
            </p>
            <p className="cantidad-disponibles">
              <strong>{cantidadDisponibles}</strong> psicólogo{cantidadDisponibles !== 1 ? 's' : ''} disponible{cantidadDisponibles !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      )}

      {psicologosDisponibles.length > 0 && (
        <div className="resultados-lista">
          {psicologosDisponibles.map((psicologo) => (
            <div key={psicologo.id} className="psicologo-card-disponible">
              <div className="psicologo-info">
                <img 
                  src={psicologo.imagen} 
                  alt={`${psicologo.nombre} ${psicologo.apellido}`}
                  className="psicologo-imagen"
                />
                <div className="psicologo-detalles">
                  <h4>{psicologo.nombre} {psicologo.apellido}</h4>
                  <p className="experiencia">{psicologo.experiencia} años de experiencia</p>
                  <p className="precio">${psicologo.precio} MXN</p>
                  <div className="rating">
                    ⭐ {psicologo.rating}/5
                  </div>
                  <div className="especialidades">
                    <strong>Especialidades:</strong>
                    <div className="especialidades-lista">
                      {psicologo.especialidades.map((esp, index) => (
                        <span key={index} className="especialidad-tag">
                          {esp}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="modalidades">
                    <strong>Modalidades:</strong>
                    <div className="modalidades-lista">
                      {psicologo.modalidades.map((mod, index) => (
                        <span key={index} className="modalidad-tag">
                          {mod}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="disponibilidad-info">
                <div className="disponibilidad-detalles">
                  <h5>Detalles de Disponibilidad:</h5>
                  <p><strong>Fecha:</strong> {psicologo.disponibilidadEncontrada.fecha}</p>
                  <p><strong>Hora:</strong> {psicologo.disponibilidadEncontrada.hora}</p>
                  <p><strong>Duración de sesión:</strong> {psicologo.disponibilidadEncontrada.duracionSesion} minutos</p>
                  <p><strong>Tiempo buffer:</strong> {psicologo.disponibilidadEncontrada.tiempoBuffer} minutos</p>
                </div>
                
                <button className="btn-agendar">
                  Agendar Cita
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {ultimaBusqueda && psicologosDisponibles.length === 0 && !cargando && !error && (
        <div className="sin-resultados">
          <p>No se encontraron psicólogos disponibles para la fecha y hora seleccionadas.</p>
          <p>Intente con otra fecha u hora, o sin filtrar por modalidad.</p>
        </div>
      )}
    </div>
  );
};

export default BuscadorPsicologosDisponibles;
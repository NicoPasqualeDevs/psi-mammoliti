import React from 'react';
import { FiltrosBusqueda } from '../types';
import { useDatabase } from '../hooks/useDatabase';

interface FiltrosBusquedaProps {
  filtros: FiltrosBusqueda;
  onFiltrosChange: (filtros: FiltrosBusqueda) => void;
}

export const FiltrosBusquedaComponent: React.FC<FiltrosBusquedaProps> = ({
  filtros,
  onFiltrosChange
}) => {
  const { especialidades } = useDatabase();

  const handleEspecialidadChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltrosChange({
      ...filtros,
      especialidad: e.target.value
    });
  };

  const handlePrecioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltrosChange({
      ...filtros,
      precioMax: parseInt(e.target.value)
    });
  };

  const handleDisponibilidadChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltrosChange({
      ...filtros,
      disponibilidad: e.target.value
    });
  };

  const handleModalidadChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltrosChange({
      ...filtros,
      modalidad: e.target.value as 'online' | 'presencial' | ''
    });
  };

  return (
    <div className="filtros-busqueda">
      <h3>Filtros de Búsqueda</h3>
      
      <div className="filtro-grupo">
        <label htmlFor="especialidad">Especialidad:</label>
        <select 
          id="especialidad"
          value={filtros.especialidad} 
          onChange={handleEspecialidadChange}
        >
          <option value="">Todas las especialidades</option>
          {especialidades.map(especialidad => (
            <option key={especialidad} value={especialidad}>
              {especialidad}
            </option>
          ))}
        </select>
      </div>

      <div className="filtro-grupo">
        <label htmlFor="precio">Precio máximo: ${filtros.precioMax}</label>
        <input
          type="range"
          id="precio"
          min="50"
          max="300"
          step="25"
          value={filtros.precioMax}
          onChange={handlePrecioChange}
        />
      </div>

      <div className="filtro-grupo">
        <label htmlFor="modalidad">Modalidad:</label>
        <select 
          id="modalidad"
          value={filtros.modalidad} 
          onChange={handleModalidadChange}
        >
          <option value="">Cualquier modalidad</option>
          <option value="online">💻 Online</option>
          <option value="presencial">🏢 Presencial</option>
        </select>
      </div>

      <div className="filtro-grupo">
        <label htmlFor="disponibilidad">Fecha disponible:</label>
        <select 
          id="disponibilidad"
          value={filtros.disponibilidad} 
          onChange={handleDisponibilidadChange}
        >
          <option value="">Cualquier fecha</option>
          <option value="2025-01-20">20 de Enero</option>
          <option value="2025-01-21">21 de Enero</option>
          <option value="2025-01-22">22 de Enero</option>
          <option value="2025-01-23">23 de Enero</option>
        </select>
      </div>
    </div>
  );
}; 
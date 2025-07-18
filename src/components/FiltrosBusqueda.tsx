import React from 'react';
import { FiltrosBusqueda } from '../types';
import { especialidades } from '../data/psicologos';

interface FiltrosBusquedaProps {
  filtros: FiltrosBusqueda;
  onFiltrosChange: (filtros: FiltrosBusqueda) => void;
}

export const FiltrosBusquedaComponent: React.FC<FiltrosBusquedaProps> = ({
  filtros,
  onFiltrosChange
}) => {
  const handleEspecialidadChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltrosChange({
      ...filtros,
      especialidad: e.target.value
    });
  };

  const handlePrecioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    // Actualizar la variable CSS para el progreso
    e.target.style.setProperty('--value', value.toString());
    onFiltrosChange({
      ...filtros,
      precioMax: value
    });
  };

  const handleDisponibilidadChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFiltrosChange({
      ...filtros,
      disponibilidad: e.target.value
    });
  };

  return (
    <div className="filtros-busqueda">
      <h3>Filtrar Psicólogos</h3>
      
      <div className="filtro-grupo">
        <label htmlFor="especialidad">Especialidad:</label>
        <select 
          id="especialidad"
          value={filtros.especialidad} 
          onChange={handleEspecialidadChange}
        >
          {especialidades.map(esp => (
            <option key={esp} value={esp}>{esp}</option>
          ))}
        </select>
      </div>

      <div className="filtro-grupo">
        <label htmlFor="precio">Precio máximo: ${filtros.precioMax}</label>
        <input
          type="range"
          id="precio"
          min="50"
          max="150"
          value={filtros.precioMax}
          onChange={handlePrecioChange}
          style={{ '--value': filtros.precioMax } as React.CSSProperties}
        />
      </div>

      <div className="filtro-grupo">
        <label htmlFor="disponibilidad">Disponibilidad:</label>
        <select
          id="disponibilidad"
          value={filtros.disponibilidad}
          onChange={handleDisponibilidadChange}
        >
          <option value="">Cualquier fecha</option>
          <option value="2024-12-16">16 de Diciembre</option>
          <option value="2024-12-17">17 de Diciembre</option>
          <option value="2024-12-18">18 de Diciembre</option>
          <option value="2024-12-19">19 de Diciembre</option>
        </select>
      </div>
    </div>
  );
}; 
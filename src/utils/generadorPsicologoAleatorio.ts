import { Modalidad } from '../types';
import {
  NOMBRES_MASCULINOS,
  NOMBRES_FEMENINOS,
  APELLIDOS,
  ESPECIALIDADES,
  MODALIDADES_OPCIONES,
  obtenerElementoAleatorio,
  obtenerVariosElementosAleatorios,
  generarRatingAleatorio,
  generarExperienciaAleatoria,
  generarPrecioAleatorio,
  generarDescripcionAleatoria,
  obtenerImagenPorGenero
} from '../constants/psicologosRandom';

export interface PsicologoAleatorioFormulario {
  nombre: string;
  apellido: string;
  especialidades: string; // String separado por comas para el formulario
  experiencia: number;
  precio: number;
  descripcion: string;
  modalidades: Modalidad[];
  generarHorarios: boolean;
  genero: 'masculino' | 'femenino';
}

export interface PsicologoAleatorioCompleto extends PsicologoAleatorioFormulario {
  id: string;
  rating: number;
  imagen: string;
  especialidadesArray: string[]; // Array de especialidades para uso interno
}

export const generarPsicologoAleatorio = (): PsicologoAleatorioFormulario => {
  // Decidir género aleatoriamente
  const esHombre = Math.random() < 0.5;
  const genero: 'masculino' | 'femenino' = esHombre ? 'masculino' : 'femenino';
  
  // Generar nombre y apellido según el género
  const nombre = esHombre 
    ? obtenerElementoAleatorio(NOMBRES_MASCULINOS)
    : obtenerElementoAleatorio(NOMBRES_FEMENINOS);
  const apellido = obtenerElementoAleatorio(APELLIDOS);
  
  // Generar especialidades (entre 2 y 4 especialidades)
  const especialidadesArray = obtenerVariosElementosAleatorios(ESPECIALIDADES, 2, 4);
  const especialidades = especialidadesArray.join(', ');
  
  // Generar experiencia y precio
  const experiencia = generarExperienciaAleatoria();
  const precio = generarPrecioAleatorio();
  
  // Generar modalidades
  const modalidades = obtenerElementoAleatorio(MODALIDADES_OPCIONES);
  
  // Generar descripción basada en las especialidades
  const descripcion = generarDescripcionAleatoria(especialidadesArray);
  
  return {
    nombre,
    apellido,
    especialidades,
    experiencia,
    precio,
    descripcion,
    modalidades,
    generarHorarios: true, // Por defecto generar horarios
    genero
  };
};

export const generarPsicologoCompletoAleatorio = (): PsicologoAleatorioCompleto => {
  const datosFormulario = generarPsicologoAleatorio();
  
  return {
    ...datosFormulario,
    id: `psi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    rating: generarRatingAleatorio(),
    imagen: obtenerImagenPorGenero(datosFormulario.nombre),
    especialidadesArray: datosFormulario.especialidades.split(', ')
  };
};

// Función para validar que los datos generados sean correctos
export const validarPsicologoAleatorio = (psicologo: PsicologoAleatorioFormulario): boolean => {
  return (
    psicologo.nombre.length > 0 &&
    psicologo.apellido.length > 0 &&
    psicologo.especialidades.length > 0 &&
    psicologo.experiencia >= 2 && psicologo.experiencia <= 25 &&
    psicologo.precio >= 50 && psicologo.precio <= 250 &&
    psicologo.descripcion.length >= 20 &&
    psicologo.modalidades.length > 0
  );
};
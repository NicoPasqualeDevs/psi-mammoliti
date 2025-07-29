import { Modalidad } from '../types';

export const NOMBRES_MASCULINOS = [
  'Alejandro', 'Carlos', 'Daniel', 'Eduardo', 'Fernando', 'Gabriel', 'Hugo', 'Ignacio',
  'Javier', 'Luis', 'Manuel', 'Nicolás', 'Oscar', 'Pablo', 'Ricardo', 'Sebastián',
  'Tomás', 'Victor', 'Diego', 'Andrés', 'Miguel', 'Rafael', 'Francisco', 'Antonio',
  'José', 'Juan', 'Pedro', 'Marcos', 'Rodrigo', 'Gonzalo'
];

export const NOMBRES_FEMENINOS = [
  'Alejandra', 'Ana', 'Beatriz', 'Carmen', 'Diana', 'Elena', 'Fernanda', 'Gabriela',
  'Helena', 'Isabel', 'Julia', 'Laura', 'María', 'Natalia', 'Olga', 'Patricia',
  'Rosa', 'Sofía', 'Teresa', 'Valeria', 'Andrea', 'Claudia', 'Mónica', 'Silvia',
  'Lucía', 'Cristina', 'Paola', 'Verónica', 'Mariana', 'Carla'
];

export const APELLIDOS = [
  'García', 'Rodríguez', 'González', 'Fernández', 'López', 'Martínez', 'Sánchez', 'Pérez',
  'Gómez', 'Martín', 'Jiménez', 'Ruiz', 'Hernández', 'Díaz', 'Moreno', 'Muñoz',
  'Álvarez', 'Romero', 'Alonso', 'Gutiérrez', 'Navarro', 'Torres', 'Domínguez', 'Vázquez',
  'Ramos', 'Gil', 'Ramírez', 'Serrano', 'Blanco', 'Suárez', 'Molina', 'Morales',
  'Ortega', 'Delgado', 'Castro', 'Ortiz', 'Rubio', 'Marín', 'Sanz', 'Iglesias'
];

export const ESPECIALIDADES = [
  'Terapia Cognitivo-Conductual',
  'Psicología Clínica',
  'Ansiedad y Estrés',
  'Depresión',
  'Terapia de Pareja',
  'Terapia Familiar',
  'Psicología Infantil',
  'Psicología del Adolescente',
  'Trastornos Alimentarios',
  'Adicciones',
  'Trauma y TEPT',
  'Terapia Sexual',
  'Duelo y Pérdida',
  'Autoestima',
  'Habilidades Sociales',
  'Control de Ira',
  'Trastornos del Sueño',
  'Mindfulness',
  'Psicología Positiva',
  'Terapia Gestalt',
  'Terapia Sistémica',
  'Neuropsicología',
  'Psicología Laboral',
  'Burnout',
  'Fobias',
  'TOC',
  'Trastorno Bipolar',
  'Esquizofrenia',
  'Terapia Humanista',
  'Psicoanálisis'
];

export const DESCRIPCIONES_BASE = [
  {
    inicio: [
      'Psicólogo especializado en',
      'Profesional con amplia experiencia en',
      'Terapeuta certificado en',
      'Especialista dedicado a',
      'Psicólogo clínico enfocado en'
    ],
    enfoque: [
      'con un enfoque humanista y empático',
      'utilizando técnicas cognitivo-conductuales',
      'con metodología integrativa',
      'basado en evidencia científica',
      'con enfoque sistémico',
      'utilizando terapias de tercera generación',
      'con orientación psicodinámica',
      'aplicando mindfulness y técnicas de relajación'
    ],
    objetivo: [
      'para ayudar a las personas a superar sus dificultades emocionales',
      'enfocado en el bienestar integral del paciente',
      'comprometido con el crecimiento personal de cada cliente',
      'dedicado a proporcionar un espacio seguro y de confianza',
      'orientado a resultados efectivos y duraderos',
      'centrado en el desarrollo de herramientas de afrontamiento',
      'especializado en crear vínculos terapéuticos sólidos',
      'enfocado en el empoderamiento y la autonomía del paciente'
    ],
    cierre: [
      'Mi objetivo es acompañarte en tu proceso de cambio y crecimiento personal.',
      'Trabajo de manera colaborativa para alcanzar tus objetivos terapéuticos.',
      'Ofrezco un ambiente cálido y profesional para tu proceso de sanación.',
      'Me comprometo a brindarte las herramientas necesarias para tu bienestar.',
      'Creo firmemente en la capacidad de cada persona para superar sus desafíos.',
      'Mi práctica se basa en la confianza, el respeto y la confidencialidad.',
      'Proporciono atención personalizada adaptada a tus necesidades específicas.',
      'Mi experiencia me permite ofrecer tratamientos efectivos y compasivos.'
    ]
  }
];

export const MODALIDADES_OPCIONES: Modalidad[][] = [
  ['online'],
  ['presencial'],
  ['online', 'presencial']
];

export const RANGOS_EXPERIENCIA = {
  min: 2,
  max: 25
};

export const RANGOS_PRECIO = {
  min: 50,
  max: 250,
  step: 25
};

export const IMAGENES_MASCULINAS = [
  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=300&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=300&h=300&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&h=300&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1594824047449-841d9d82deb3?w=300&h=300&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=300&h=300&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=300&h=300&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face'
];

export const IMAGENES_FEMENINAS = [
  'https://images.unsplash.com/photo-1593104547489-5cfb3839a3b5?w=300&h=300&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1614644147724-2d4785d69962?w=300&h=300&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&h=300&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=300&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=300&h=300&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1596815064285-45ed8a9c0463?w=300&h=300&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1589571894960-20bbe2828d0a?w=300&h=300&fit=crop&crop=face'
];

export const IMAGENES_PSICOLOGO = [...IMAGENES_MASCULINAS, ...IMAGENES_FEMENINAS];

export const obtenerElementoAleatorio = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

export const obtenerVariosElementosAleatorios = <T>(array: T[], min: number, max: number): T[] => {
  const cantidad = Math.floor(Math.random() * (max - min + 1)) + min;
  const elementos = [...array];
  const resultado: T[] = [];
  
  for (let i = 0; i < cantidad && elementos.length > 0; i++) {
    const index = Math.floor(Math.random() * elementos.length);
    resultado.push(elementos.splice(index, 1)[0]);
  }
  
  return resultado;
};

export const generarRatingAleatorio = (): number => {
  return Math.round((Math.random() * 1.5 + 3.5) * 10) / 10;
};

export const generarExperienciaAleatoria = (): number => {
  return Math.floor(Math.random() * (RANGOS_EXPERIENCIA.max - RANGOS_EXPERIENCIA.min + 1)) + RANGOS_EXPERIENCIA.min;
};

export const generarPrecioAleatorio = (): number => {
  const min = RANGOS_PRECIO.min;
  const max = RANGOS_PRECIO.max;
  const step = RANGOS_PRECIO.step;
  const steps = Math.floor((max - min) / step);
  return min + (Math.floor(Math.random() * (steps + 1)) * step);
};

export const esNombreMasculino = (nombre: string): boolean => {
  return NOMBRES_MASCULINOS.includes(nombre);
};

export const esNombreFemenino = (nombre: string): boolean => {
  return NOMBRES_FEMENINOS.includes(nombre);
};

export const obtenerImagenPorGenero = (nombre: string): string => {
  if (esNombreMasculino(nombre)) {
    return obtenerElementoAleatorio(IMAGENES_MASCULINAS);
  } else if (esNombreFemenino(nombre)) {
    return obtenerElementoAleatorio(IMAGENES_FEMENINAS);
  } else {
    // Fallback: seleccionar aleatoriamente si no se encuentra el nombre
    return obtenerElementoAleatorio(IMAGENES_PSICOLOGO);
  }
};

export const generarDescripcionAleatoria = (especialidades: string[]): string => {
  const base = DESCRIPCIONES_BASE[0];
  const inicio = obtenerElementoAleatorio(base.inicio);
  const especialidadPrincipal = especialidades[0];
  const enfoque = obtenerElementoAleatorio(base.enfoque);
  const objetivo = obtenerElementoAleatorio(base.objetivo);
  const cierre = obtenerElementoAleatorio(base.cierre);
  
  return `${inicio} ${especialidadPrincipal.toLowerCase()}, ${enfoque} ${objetivo}. ${cierre}`;
};
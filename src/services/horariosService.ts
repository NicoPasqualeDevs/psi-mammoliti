import { 
  HorarioTrabajo, 
  HorarioExcepcion, 
  Cita, 
  ConfiguracionHorarios, 
  HorarioGenerado, 
  PlantillaHorario,
  DisponibilidadRespuesta,
  Modalidad 
} from '../types';

export class HorariosService {
  
  /**
   * Genera horarios disponibles para un psicólogo en un rango de fechas
   */
  static generarHorariosDisponibles(
    fechaInicio: Date,
    fechaFin: Date,
    horariosTrabajoSemanales: HorarioTrabajo[],
    excepciones: HorarioExcepcion[],
    citasAgendadas: Cita[],
    configuracion: ConfiguracionHorarios
  ): DisponibilidadRespuesta[] {
    const resultado: DisponibilidadRespuesta[] = [];
    const fechaActual = new Date(fechaInicio);

    while (fechaActual <= fechaFin) {
      const fechaStr = fechaActual.toISOString().split('T')[0];
      const diaSemana = fechaActual.getDay();
      
      // Verificar si hay una excepción para este día
      const excepcionDia = excepciones.find(exc => exc.fecha === fechaStr);
      
      let horariosDelDia: HorarioGenerado[] = [];

      if (excepcionDia?.tipo === 'bloqueado') {
        // Día completamente bloqueado
        horariosDelDia = [];
      } else if (excepcionDia?.tipo === 'horario_especial') {
        // Día con horario especial
        horariosDelDia = this.generarHorariosDia(
          fechaStr,
          [{
            diaSemana,
            horaInicio: excepcionDia.horaInicio!,
            horaFin: excepcionDia.horaFin!,
            modalidades: excepcionDia.modalidades!,
            intervaloMinutos: configuracion.duracionSesion + configuracion.tiempoBuffer
          }],
          citasAgendadas,
          configuracion
        );
      } else {
        // Día normal según plantilla semanal
        const plantillasDelDia = horariosTrabajoSemanales
          .filter(horario => horario.diaSemana === diaSemana && horario.activo)
          .map(horario => ({
            diaSemana: horario.diaSemana,
            horaInicio: horario.horaInicio,
            horaFin: horario.horaFin,
            modalidades: horario.modalidades,
            intervaloMinutos: configuracion.duracionSesion + configuracion.tiempoBuffer
          }));

        horariosDelDia = this.generarHorariosDia(
          fechaStr,
          plantillasDelDia,
          citasAgendadas,
          configuracion
        );
      }

      resultado.push({
        fecha: fechaStr,
        horarios: horariosDelDia
      });

      // Avanzar al siguiente día
      fechaActual.setDate(fechaActual.getDate() + 1);
    }

    return resultado;
  }

  /**
   * Genera horarios para un día específico basado en plantillas
   */
  private static generarHorariosDia(
    fecha: string,
    plantillas: PlantillaHorario[],
    citasAgendadas: Cita[],
    configuracion: ConfiguracionHorarios
  ): HorarioGenerado[] {
    const horarios: HorarioGenerado[] = [];
    const citasDelDia = citasAgendadas.filter(cita => cita.fecha === fecha);

    plantillas.forEach(plantilla => {
      const horariosGenerados = this.generarIntervalosHorario(
        plantilla.horaInicio,
        plantilla.horaFin,
        configuracion.duracionSesion,
        configuracion.tiempoBuffer
      );

      horariosGenerados.forEach(intervalo => {
        // Verificar si el horario está ocupado
        const citaConflicto = citasDelDia.find(cita => 
          this.hayConflictoHorario(
            intervalo.horaInicio,
            intervalo.horaFin,
            cita.horaInicio,
            cita.horaFin
          )
        );

        horarios.push({
          fecha,
          horaInicio: intervalo.horaInicio,
          horaFin: intervalo.horaFin,
          modalidades: plantilla.modalidades,
          disponible: !citaConflicto,
          ocupadoPor: citaConflicto?.id
        });
      });
    });

    return horarios.sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));
  }

  /**
   * Genera intervalos de tiempo dentro de un rango
   */
  private static generarIntervalosHorario(
    horaInicio: string,
    horaFin: string,
    duracionMinutos: number,
    bufferMinutos: number
  ): { horaInicio: string; horaFin: string }[] {
    const intervalos: { horaInicio: string; horaFin: string }[] = [];
    
    const [horaIni, minIni] = horaInicio.split(':').map(Number);
    const [horaFin_, minFin] = horaFin.split(':').map(Number);
    
    const inicioMinutos = horaIni * 60 + minIni;
    const finMinutos = horaFin_ * 60 + minFin;
    const intervaloTotal = duracionMinutos + bufferMinutos;
    
    for (let minutos = inicioMinutos; minutos + duracionMinutos <= finMinutos; minutos += intervaloTotal) {
      const horaInicioIntervalo = this.minutosAHora(minutos);
      const horaFinIntervalo = this.minutosAHora(minutos + duracionMinutos);
      
      intervalos.push({
        horaInicio: horaInicioIntervalo,
        horaFin: horaFinIntervalo
      });
    }
    
    return intervalos;
  }

  /**
   * Convierte minutos del día a formato HH:MM
   */
  private static minutosAHora(minutos: number): string {
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return `${horas.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  /**
   * Verifica si hay conflicto entre dos rangos de horarios
   */
  private static hayConflictoHorario(
    inicio1: string,
    fin1: string,
    inicio2: string,
    fin2: string
  ): boolean {
    const [h1i, m1i] = inicio1.split(':').map(Number);
    const [h1f, m1f] = fin1.split(':').map(Number);
    const [h2i, m2i] = inicio2.split(':').map(Number);
    const [h2f, m2f] = fin2.split(':').map(Number);
    
    const min1i = h1i * 60 + m1i;
    const min1f = h1f * 60 + m1f;
    const min2i = h2i * 60 + m2i;
    const min2f = h2f * 60 + m2f;
    
    return min1i < min2f && min2i < min1f;
  }

  /**
   * Crea configuración por defecto para un psicólogo
   */
  static crearConfiguracionPorDefecto(psicologoId: string): ConfiguracionHorarios {
    return {
      psicologoId,
      duracionSesion: 60,
      tiempoBuffer: 15,
      diasAnticipacion: 30,
      zonaHoraria: 'America/Mexico_City',
      autoGenerar: true
    };
  }

  /**
   * Crea horarios de trabajo por defecto (Lunes a Viernes 9-17)
   */
  static crearHorariosTrabajoPorDefecto(
    psicologoId: string, 
    modalidades: Modalidad[]
  ): HorarioTrabajo[] {
    const horarios: HorarioTrabajo[] = [];
    
    // Lunes a Viernes
    for (let dia = 1; dia <= 5; dia++) {
      horarios.push({
        psicologoId,
        diaSemana: dia,
        horaInicio: '09:00',
        horaFin: '17:00',
        modalidades,
        activo: true
      });
    }
    
    return horarios;
  }

  /**
   * Valida un horario de trabajo
   */
  static validarHorarioTrabajo(horario: HorarioTrabajo): string[] {
    const errores: string[] = [];
    
    if (horario.diaSemana < 0 || horario.diaSemana > 6) {
      errores.push('Día de la semana debe estar entre 0 (Domingo) y 6 (Sábado)');
    }
    
    if (!this.esHoraValida(horario.horaInicio)) {
      errores.push('Hora de inicio inválida');
    }
    
    if (!this.esHoraValida(horario.horaFin)) {
      errores.push('Hora de fin inválida');
    }
    
    if (horario.horaInicio >= horario.horaFin) {
      errores.push('La hora de inicio debe ser anterior a la hora de fin');
    }
    
    if (!horario.modalidades || horario.modalidades.length === 0) {
      errores.push('Debe especificar al menos una modalidad');
    }
    
    return errores;
  }

  /**
   * Valida formato de hora HH:MM
   */
  private static esHoraValida(hora: string): boolean {
    const regex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return regex.test(hora);
  }

  /**
   * Obtiene el nombre del día de la semana
   */
  static obtenerNombreDia(diaSemana: number): string {
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return dias[diaSemana] || 'Día inválido';
  }

  /**
   * Convierte horarios al formato legacy para compatibilidad
   */
  static convertirAFormatoLegacy(
    disponibilidad: DisponibilidadRespuesta[]
  ): { fecha: string; horarios: { hora: string; modalidades: Modalidad[] }[] }[] {
    return disponibilidad.map(dia => ({
      fecha: dia.fecha,
      horarios: dia.horarios
        .filter(horario => horario.disponible)
        .map(horario => ({
          hora: horario.horaInicio,
          modalidades: horario.modalidades
        }))
    }));
  }
} 
export type TipoEvento = 'Consulta Nutricional' | 'Entrenamiento Personalizado' | 'Otro';
export type EstadoEvento = 'Pendiente' | 'Completado' | 'Cancelado';
export type PrioridadEvento = 'Baja' | 'Media' | 'Alta';

export interface AgendaEvent {
  id?: string;
  nutricionistaId: string;
  titulo: string;
  descripcion: string;
  fecha: string; // Formato YYYY-MM-DD
  horaInicio: string; // Formato HH:mm
  horaFin: string; // Formato HH:mm
  tipo: TipoEvento;
  actividadPersonalizada?: string; // Solo si tipo === 'Otro'
  prioridad: PrioridadEvento;
  estado: EstadoEvento;
  recordatorio: number; // Minutos previos (15, 30, 60, 1440)
  fechaCreacion: number;
  fechaActualizacion: number;
}
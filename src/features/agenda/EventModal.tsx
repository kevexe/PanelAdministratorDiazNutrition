import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { AgendaEvent, TipoEvento } from '../../types/agenda';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  eventoEditar?: AgendaEvent | null;
  fechaPreseleccionada?: string;
}

export default function EventModal({ isOpen, onClose, onSave, eventoEditar, fechaPreseleccionada }: EventModalProps) {
  const { register, handleSubmit, watch, reset, formState: { errors, isSubmitting } } = useForm<AgendaEvent>();

  const tipoSeleccionado = watch('tipo');

  useEffect(() => {
    if (eventoEditar) {
      reset(eventoEditar);
    } else {
      reset({
        titulo: '', descripcion: '', fecha: fechaPreseleccionada || '', 
        horaInicio: '09:00', horaFin: '10:00', tipo: 'Consulta Nutricional', 
        estado: 'Pendiente', prioridad: 'Media', recordatorio: 15
      });
    }
  }, [eventoEditar, fechaPreseleccionada, isOpen, reset]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-[#1A1C1E] border border-white/10 w-full max-w-lg rounded-xl shadow-2xl p-6 relative">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">{eventoEditar ? 'Editar Compromiso' : 'Nuevo Compromiso'}</h2>
          <button onClick={onClose} className="text-[#bac9cc] hover:text-[#00daf3]">✕</button>
        </div>

        <form onSubmit={handleSubmit(onSave)} className="space-y-4">
          <div>
            <label className="text-[10px] uppercase text-[#bac9cc] tracking-widest">Título</label>
            <input 
              {...register('titulo', { required: 'El título es obligatorio' })}
              className="w-full bg-[#131314] border border-white/10 rounded p-2 text-white mt-1 outline-none focus:border-[#00daf3]" 
            />
            {errors.titulo && <span className="text-red-400 text-xs">{errors.titulo.message}</span>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase text-[#bac9cc] tracking-widest">Fecha</label>
              <input type="date" {...register('fecha', { required: true })} className="w-full bg-[#131314] border border-white/10 rounded p-2 text-white mt-1 outline-none focus:border-[#00daf3] dark:[color-scheme:dark]" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] uppercase text-[#bac9cc] tracking-widest">Inicio</label>
                <input type="time" {...register('horaInicio', { required: true })} className="w-full bg-[#131314] border border-white/10 rounded p-2 text-white mt-1 outline-none focus:border-[#00daf3] dark:[color-scheme:dark]" />
              </div>
              <div>
                <label className="text-[10px] uppercase text-[#bac9cc] tracking-widest">Fin</label>
                <input type="time" {...register('horaFin', { required: true })} className="w-full bg-[#131314] border border-white/10 rounded p-2 text-white mt-1 outline-none focus:border-[#00daf3] dark:[color-scheme:dark]" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase text-[#bac9cc] tracking-widest">Tipo de Compromiso</label>
              <select {...register('tipo')} className="w-full bg-[#131314] border border-white/10 rounded p-2 text-white mt-1 outline-none focus:border-[#00daf3]">
                <option value="Consulta Nutricional">Consulta Nutricional</option>
                <option value="Entrenamiento Personalizado">Entrenamiento Personalizado</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase text-[#bac9cc] tracking-widest">Prioridad</label>
              <select {...register('prioridad')} className="w-full bg-[#131314] border border-white/10 rounded p-2 text-white mt-1 outline-none focus:border-[#00daf3]">
                <option value="Baja">Baja</option>
                <option value="Media">Media</option>
                <option value="Alta">Alta</option>
              </select>
            </div>
          </div>

          {/* CAMPO CONDICIONAL */}
          {tipoSeleccionado === 'Otro' && (
            <div className="animate-in fade-in slide-in-from-top-2">
              <label className="text-[10px] uppercase text-[#00daf3] tracking-widest">Especifique la actividad *</label>
              <input 
                {...register('actividadPersonalizada', { required: 'Debe especificar la actividad' })}
                placeholder="Ej. Reunión con proveedores, Congreso..."
                className="w-full bg-[#131314] border border-[#00daf3]/30 rounded p-2 text-[#00daf3] mt-1 outline-none focus:border-[#00daf3]" 
              />
              {errors.actividadPersonalizada && <span className="text-red-400 text-xs">{errors.actividadPersonalizada.message}</span>}
            </div>
          )}

          <div>
            <label className="text-[10px] uppercase text-[#bac9cc] tracking-widest">Descripción</label>
            <textarea {...register('descripcion')} rows={3} className="w-full bg-[#131314] border border-white/10 rounded p-2 text-white mt-1 outline-none focus:border-[#00daf3] resize-none" />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-bold text-[#bac9cc] hover:text-white">CANCELAR</button>
            <button type="submit" disabled={isSubmitting} className="bg-[#00daf3] text-[#131314] px-6 py-2 rounded text-xs font-bold hover:bg-[#72f5ff] transition-colors disabled:opacity-50">
              {isSubmitting ? 'GUARDANDO...' : 'GUARDAR EVENTO'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import toast, { Toaster } from 'react-hot-toast';
import { format } from 'date-fns';

import { agendaService } from '../services/agendaService';
import { AgendaEvent } from '../types/agenda';
import EventModal from '../components/agenda/EventModal';

// NOTA: Reemplazar con el ID real de Firebase Auth del usuario logueado
const CURRENT_USER_ID = "nutricionista_123"; 

export default function TitanAgendaApp() {
  const [eventos, setEventos] = useState<AgendaEvent[]>([]);
  const [cargando, setCargando] = useState(true);
  
  // Estados del Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eventoEditando, setEventoEditar] = useState<AgendaEvent | null>(null);
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string>('');

  // 1. Escuchar Firestore en Tiempo Real
  useEffect(() => {
    const unsubscribe = agendaService.suscribirEventos(CURRENT_USER_ID, (data) => {
      setEventos(data);
      setCargando(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. Mapear datos para FullCalendar
  const calendarEvents = eventos.map(ev => ({
    id: ev.id,
    title: ev.titulo,
    start: `${ev.fecha}T${ev.horaInicio}`,
    end: `${ev.fecha}T${ev.horaFin}`,
    backgroundColor: ev.tipo === 'Consulta Nutricional' ? 'rgba(0, 218, 243, 0.2)' : 
                     ev.tipo === 'Entrenamiento Personalizado' ? 'rgba(163, 230, 53, 0.2)' : 'rgba(192, 132, 252, 0.2)',
    borderColor: ev.tipo === 'Consulta Nutricional' ? '#00daf3' : 
                 ev.tipo === 'Entrenamiento Personalizado' ? '#a3e635' : '#c084fc',
    textColor: '#ffffff',
    extendedProps: { ...ev }
  }));

  // 3. Manejo de Drag & Drop (Reprogramación Automática)
  const handleEventDrop = async (info: any) => {
    const id = info.event.id;
    const newStart = info.event.start;
    const newEnd = info.event.end || info.event.start;
    
    const actualizacion = {
      fecha: format(newStart, 'yyyy-MM-dd'),
      horaInicio: format(newStart, 'HH:mm'),
      horaFin: format(newEnd, 'HH:mm'),
    };

    try {
      await agendaService.actualizarEvento(id, actualizacion);
      toast.success('Evento reprogramado exitosamente');
    } catch (error) {
      toast.error('Error al reprogramar');
      info.revert();
    }
  };

  // 4. Guardar desde Modal
  const handleSaveEvent = async (data: any) => {
    try {
      if (eventoEditando?.id) {
        await agendaService.actualizarEvento(eventoEditando.id, data);
        toast.success('Compromiso actualizado');
      } else {
        await agendaService.crearEvento({ ...data, nutricionistaId: CURRENT_USER_ID });
        toast.success('Compromiso creado');
      }
      setIsModalOpen(false);
    } catch (error) {
      toast.error('Error al guardar el evento');
    }
  };

  // 5. Eliminar (Con confirmación)
  const handleDelete = async (id: string) => {
    if(window.confirm('¿Estás seguro de eliminar este compromiso?')) {
      await agendaService.eliminarEvento(id);
      toast.success('Evento eliminado');
      setIsModalOpen(false);
    }
  };

  // --- MÉTRICAS DEL RESUMEN ---
  const hoyStr = format(new Date(), 'yyyy-MM-dd');
  const eventosHoy = eventos.filter(e => e.fecha === hoyStr).length;
  const pendientes = eventos.filter(e => e.estado === 'Pendiente').length;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#131314] text-[#e5e2e3] font-sans p-6 overflow-hidden">
      <Toaster position="top-right" toastOptions={{ style: { background: '#1c1b1b', color: '#fff', border: '1px solid #333' } }} />

      {/* HEADER & SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#1A1C1E] border border-white/5 rounded-xl p-4">
          <p className="text-[10px] text-[#bac9cc] uppercase tracking-widest">Eventos Hoy</p>
          <p className="text-3xl font-['Bodoni_Moda'] text-[#00daf3]">{eventosHoy}</p>
        </div>
        <div className="bg-[#1A1C1E] border border-white/5 rounded-xl p-4">
          <p className="text-[10px] text-[#bac9cc] uppercase tracking-widest">Total Pendientes</p>
          <p className="text-3xl font-['Bodoni_Moda'] text-white">{pendientes}</p>
        </div>
        <div className="bg-[#1A1C1E] border border-white/5 rounded-xl p-4 md:col-span-2 flex items-center justify-between">
           <div>
             <h3 className="font-bold text-white">Panel de Agenda</h3>
             <p className="text-xs text-[#bac9cc]">Gestión clínica y deportiva</p>
           </div>
           <button 
             onClick={() => { setEventoEditar(null); setFechaSeleccionada(hoyStr); setIsModalOpen(true); }}
             className="bg-[#00daf3] text-[#131314] px-4 py-2 rounded text-xs font-bold hover:bg-[#72f5ff] flex items-center gap-2 shadow-[0_0_15px_rgba(0,218,243,0.3)]"
            >
             <span className="material-symbols-outlined text-[16px]">add</span> NUEVO COMPROMISO
           </button>
        </div>
      </div>

      {/* CALENDARIO FULLCALENDAR */}
      <div className="flex-1 bg-[#1A1C1E] border border-white/5 rounded-xl p-4 overflow-hidden relative agenda-calendar-wrapper">
        {cargando && <div className="absolute inset-0 bg-[#131314]/50 backdrop-blur flex items-center justify-center z-50"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00daf3]"></div></div>}
        
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          events={calendarEvents}
          editable={true} // Permite Drag & Drop
          selectable={true}
          slotMinTime="06:00:00"
          slotMaxTime="22:00:00"
          allDaySlot={false}
          eventDrop={handleEventDrop}
          dateClick={(info) => {
            setEventoEditar(null);
            setFechaSeleccionada(format(info.date, 'yyyy-MM-dd'));
            setIsModalOpen(true);
          }}
          eventClick={(info) => {
            setEventoEditar(info.event.extendedProps as AgendaEvent);
            setIsModalOpen(true);
          }}
          height="100%"
        />
      </div>

      {/* MODAL */}
      <EventModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSaveEvent} 
        eventoEditar={eventoEditar}
        fechaPreseleccionada={fechaSeleccionada}
      />

      {/* ESTILOS GLOBALES PARA FULLCALENDAR THEME TITAN */}
      <style>{`
        .agenda-calendar-wrapper .fc-theme-standard .fc-scrollgrid { border-color: rgba(255,255,255,0.05); }
        .agenda-calendar-wrapper .fc-theme-standard th { border-color: rgba(255,255,255,0.05); background: #201f20; padding: 8px 0; color: #bac9cc; font-weight: 500; font-size: 12px; text-transform: uppercase; }
        .agenda-calendar-wrapper .fc-theme-standard td { border-color: rgba(255,255,255,0.05); }
        .agenda-calendar-wrapper .fc-col-header-cell-cushion { color: #bac9cc; text-decoration: none; }
        .agenda-calendar-wrapper .fc-timegrid-slot-label-cushion { color: #849495; font-size: 10px; }
        .agenda-calendar-wrapper .fc-button-primary { background: #131314 !important; border: 1px solid rgba(255,255,255,0.1) !important; color: #bac9cc !important; text-transform: uppercase; font-size: 10px; font-weight: bold; letter-spacing: 1px; }
        .agenda-calendar-wrapper .fc-button-active { background: #00daf3 !important; color: #131314 !important; border-color: #00daf3 !important; }
        .agenda-calendar-wrapper .fc-toolbar-title { font-family: 'Bodoni Moda', serif; font-size: 1.5rem; color: #fff; }
        .agenda-calendar-wrapper .fc-event { border-radius: 4px; padding: 2px 4px; font-size: 10px; cursor: pointer; transition: transform 0.2s; }
        .agenda-calendar-wrapper .fc-event:hover { transform: scale(1.02); filter: brightness(1.2); }
      `}</style>
    </div>
  );
}
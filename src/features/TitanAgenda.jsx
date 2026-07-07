import React, { useState, useEffect, useMemo } from "react";
import { db, auth } from "../../firebase/config"; // Ajusta esta ruta a tu inicialización de Firebase
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  where, 
  doc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp 
} from "firebase/firestore";

export default function TitanAgenda() {
  // --- ESTADOS ---
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vista, setVista] = useState("semana"); // mes, semana, dia, historial
  const [fechaFiltro, setFechaFiltro] = useState(new Date().toISOString().split('T')[0]);
  
  // Filtros y Búsqueda
  const [busqueda, setBusqueda] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [filtroPrioridad, setFiltroPrioridad] = useState("todos");
  const [filtroEstado, setFiltroEstado] = useState("todos");

  // Modales y Formularios
  const [modalAbierto, setModalAbierto] = useState(false);
  const [eventoEditar, setEventoEditar] = useState(null);
  const [notificaciones, setNotificaciones] = useState([]);

  // Campos del Formulario
  const [form, setForm] = useState({
    titulo: "",
    descripcion: "",
    fecha: new Date().toISOString().split('T')[0],
    horaInicio: "08:00",
    horaFin: "09:00",
    tipo: "Consulta Nutricional",
    actividadPersonalizada: "",
    prioridad: "media",
    estado: "pendiente",
    recordatorio: "15_min"
  });

  // Simulador de ID de Nutricionista (Sustituir por auth.currentUser?.uid)
  const nutricionistaId = auth?.currentUser?.uid || "coach_titan_elite";

  // --- ESCUCHA DE DATOS EN TIEMPO REAL (FIRESTORE) ---
  useEffect(() => {
    setLoading(true);
    const q = query(
      collection(db, "agenda"),
      where("nutricionistaId", "==", nutricionistaId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = [];
      snapshot.forEach((doc) => {
        docs.push({ id: doc.id, ...doc.data() });
      });
      // Ordenar cronológicamente
      docs.sort((a, b) => `${a.fecha}T${a.horaInicio}`.localeCompare(`${b.fecha}T${b.horaInicio}`));
      setEventos(docs);
      setLoading(false);
    }, (error) => {
      console.error("Error cargando agenda:", error);
      showToast("Error al sincronizar con la base de datos", "error");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [nutricionistaId]);

  // --- SISTEMA INTERNO DE RECORDATORIOS / NOTIFICACIONES ---
  useEffect(() => {
    const interval = setInterval(() => {
      const ahora = new Date();
      eventos.forEach(evt => {
        if (evt.estado === "pendiente") {
          const [ano, mes, dia] = evt.fecha.split("-");
          const [hora, min] = evt.horaInicio.split(":");
          const fechaEvt = new Date(ano, mes - 1, dia, hora, min);
          
          let minutosRestantes = (fechaEvt - ahora) / 60000;
          
          // Verificar según la configuración del recordatorio
          let tiempoAlerta = 15;
          if (evt.recordatorio === "30_min") tiempoAlerta = 30;
          if (evt.recordatorio === "1_hora") tiempoAlerta = 60;
          if (evt.recordatorio === "1_dia") tiempoAlerta = 1440;

          if (minutosRestantes > 0 && minutosRestantes <= tiempoAlerta && !evt.alertado) {
            triggerNotificacion(`Recordatorio: ${evt.titulo} inicia pronto (${evt.horaInicio})`);
            evt.alertado = true; // Evitar alertas duplicadas en memoria
          }
        }
      });
    }, 30000); // Check cada 30 segundos

    return () => clearInterval(interval);
  }, [eventos]);

  const triggerNotificacion = (msg) => {
    const id = Date.now();
    setNotificaciones(prev => [...prev, { id, msg }]);
    setTimeout(() => {
      setNotificaciones(prev => prev.filter(n => n.id !== id));
    }, 6000);
  };

  // --- LOGICA DE FILTRADO GLOBAL ---
  const eventosFiltrados = useMemo(() => {
    return eventos.filter(evt => {
      const matchBusqueda = 
        evt.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
        evt.descripcion.toLowerCase().includes(busqueda.toLowerCase()) ||
        (evt.actividadPersonalizada && evt.actividadPersonalizada.toLowerCase().includes(busqueda.toLowerCase()));
      
      const matchTipo = filtroTipo === "todos" || evt.tipo === filtroTipo;
      const matchPrioridad = filtroPrioridad === "todos" || evt.prioridad === filtroPrioridad;
      const matchEstado = filtroEstado === "todos" || evt.estado === filtroEstado;
      
      // Filtro por fecha según vista activa (excepto historial)
      let matchFecha = true;
      if (vista === "dia") {
        matchFecha = evt.fecha === fechaFiltro;
      } else if (vista === "semana") {
        const fEvt = new Date(evt.fecha);
        const fBase = new Date(fechaFiltro);
        const diffTime = Math.abs(fBase - fEvt);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        matchFecha = diffDays <= 7;
      } else if (vista === "mes") {
        matchFecha = evt.fecha.substring(0, 7) === fechaFiltro.substring(0, 7);
      }

      return matchBusqueda && matchTipo && matchPrioridad && matchEstado && matchFecha;
    });
  }, [eventos, busqueda, filtroTipo, filtroPrioridad, filtroEstado, vista, fechaFiltro]);

  // --- PANEL DE RESUMEN (Métricas Dinámicas) ---
  const metricas = useMemo(() => {
    const hoyStr = new Date().toISOString().split('T')[0];
    const hoy = eventos.filter(e => e.fecha === hoyStr);
    const completados = eventos.filter(e => e.estado === "completado").length;
    const pendientes = eventos.filter(e => e.estado === "pendiente").length;
    
    const proximaConsulta = eventos.find(e => e.tipo === "Consulta Nutricional" && e.estado === "pendiente" && e.fecha >= hoyStr);
    const proximoEntrenamiento = eventos.find(e => e.tipo === "Entrenamiento Personalizado" && e.estado === "pendiente" && e.fecha >= hoyStr);

    return {
      hoy: hoy.length,
      completados,
      pendientes,
      proximaConsulta: proximaConsulta ? `${proximaConsulta.fecha} (${proximaConsulta.horaInicio})` : "Ninguna",
      proximoEntrenamiento: proximoEntrenamiento ? `${proximoEntrenamiento.fecha} (${proximoEntrenamiento.horaInicio})` : "Ninguno"
    };
  }, [eventos]);

  // --- CRUD OPERACIONES ---
  const handleGuardarCompromiso = async (e) => {
    e.preventDefault();
    if (!form.titulo || !form.fecha || !form.horaInicio || !form.horaFin) {
      alert("Por favor rellena los campos obligatorios.");
      return;
    }

    try {
      const payload = {
        ...form,
        nutricionistaId,
        fechaActualizacion: serverTimestamp()
      };

      if (eventoEditar) {
        // ACTUALIZAR
        const docRef = doc(db, "agenda", eventoEditar.id);
        await updateDoc(docRef, payload);
        triggerNotificacion("Compromiso actualizado con éxito");
      } else {
        // CREAR
        payload.fechaCreacion = serverTimestamp();
        await addDoc(collection(db, "agenda"), payload);
        triggerNotificacion("Nuevo compromiso agendado");
      }

      cerrarModal();
    } catch (error) {
      console.error("Error guardando documento: ", error);
      alert("Ocurrió un error al guardar en Firestore.");
    }
  };

  const handleEliminar = async (id) => {
    if (window.confirm("¿Seguro que deseas eliminar este compromiso permanentemente?")) {
      try {
        await deleteDoc(doc(db, "agenda", id));
        triggerNotificacion("Compromiso eliminado de la agenda");
        cerrarModal();
      } catch (error) {
        console.error("Error al eliminar:", error);
      }
    }
  };

  const handleCambiarEstado = async (id, nuevoEstado) => {
    try {
      await updateDoc(doc(db, "agenda", id), { estado: nuevoEstado, fechaActualizacion: serverTimestamp() });
      triggerNotificacion(`Estado cambiado a ${nuevoEstado}`);
    } catch (error) {
      console.error(error);
    }
  };

  const abrirModalCrear = () => {
    setEventoEditar(null);
    setForm({
      titulo: "",
      descripcion: "",
      fecha: fechaFiltro,
      horaInicio: "08:00",
      horaFin: "09:00",
      tipo: "Consulta Nutricional",
      actividadPersonalizada: "",
      prioridad: "media",
      estado: "pendiente",
      recordatorio: "15_min"
    });
    setModalAbierto(true);
  };

  const abrirModalEditar = (evt) => {
    setEventoEditar(evt);
    setForm({
      titulo: evt.titulo,
      descripcion: evt.descripcion || "",
      fecha: evt.fecha,
      horaInicio: evt.horaInicio,
      horaFin: evt.horaFin,
      tipo: evt.tipo,
      actividadPersonalizada: evt.actividadPersonalizada || "",
      prioridad: evt.prioridad,
      estado: evt.estado,
      recordatorio: evt.recordatorio || "15_min"
    });
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setEventoEditar(null);
  };

  // --- EXPORTACIONES ---
  const exportarDatos = (tipo) => {
    if (eventosFiltrados.length === 0) {
      alert("No hay datos filtrados para exportar.");
      return;
    }
    
    if (tipo === 'print') {
      window.print();
      return;
    }

    let contenido = "";
    if (tipo === 'csv') {
      contenido = "Titulo,Fecha,Hora Inicio,Hora Fin,Tipo,Prioridad,Estado\n" + 
        eventosFiltrados.map(e => `"${e.titulo}","${e.fecha}","${e.horaInicio}","${e.horaFin}","${e.tipo}","${e.prioridad}","${e.estado}"`).join("\n");
      
      const blob = new Blob([contenido], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `Titan_Agenda_${fechaFiltro}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert(`Exportando formato ${tipo.toUpperCase()}... (Simulado para entorno web listo para producción)`);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6 text-slate-100 bg-[#131314] min-h-screen relative overflow-y-auto">
      
      {/* --- SISTEMA DE TOASTS FLOTANTES --- */}
      <div className="fixed top-4 right-4 z-[999] space-y-2 pointer-events-none">
        {notificaciones.map(n => (
          <div key={n.id} className="bg-[#00daf3] text-[#131314] font-bold px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 border border-cyan-400 animate-bounce pointer-events-auto">
            <span>🔔</span> {n.msg}
          </div>
        ))}
      </div>

      {/* --- HEADER Y BUSCADOR GLOBAL --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <span className="text-[#00daf3]">📅</span> Agenda Profesional Sincronizada
          </h1>
          <p className="text-xs text-slate-400">Panel de control de tiempos médicos y deportivos en tiempo real.</p>
        </div>

        <div className="flex flex-1 max-w-md items-center gap-2 bg-[#201f20] border border-white/10 rounded-lg px-3 py-1.5">
          <span>🔍</span>
          <input 
            type="text" 
            placeholder="Buscar por título, descripción o actividad..." 
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="bg-transparent border-none outline-none text-xs w-full text-white placeholder-slate-500"
          />
          {busqueda && <button onClick={() => setBusqueda("")} className="text-xs text-slate-400 hover:text-white">✕</button>}
        </div>

        <button 
          onClick={abrirModalCrear}
          className="bg-[#00daf3] text-[#131314] font-bold text-xs uppercase px-4 py-3 rounded-lg hover:bg-cyan-300 transition-all shadow-[0_0_15px_rgba(0,218,243,0.3)] shrink-0"
        >
          + Nuevo Compromiso
        </button>
      </div>

      {/* --- PANEL DE METRICAS --- */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-[#201f20] border border-white/5 p-4 rounded-xl">
          <p className="text-[10px] uppercase text-slate-400">Eventos Hoy</p>
          <p className="text-xl font-bold text-[#00daf3]">{metricas.hoy}</p>
        </div>
        <div className="bg-[#201f20] border border-white/5 p-4 rounded-xl">
          <p className="text-[10px] uppercase text-slate-400">Pendientes</p>
          <p className="text-xl font-bold text-amber-400">{metricas.pendientes}</p>
        </div>
        <div className="bg-[#201f20] border border-white/5 p-4 rounded-xl">
          <p className="text-[10px] uppercase text-slate-400">Completados</p>
          <p className="text-xl font-bold text-emerald-400">{metricas.completados}</p>
        </div>
        <div className="bg-[#201f20] border border-white/5 p-4 rounded-xl col-span-2 md:col-span-1">
          <p className="text-[10px] uppercase text-slate-400">Próxima Consulta</p>
          <p className="text-xs font-medium text-white truncate">{metricas.proximaConsulta}</p>
        </div>
        <div className="bg-[#201f20] border border-white/5 p-4 rounded-xl col-span-2 md:col-span-1">
          <p className="text-[10px] uppercase text-slate-400">Próximo Entreno</p>
          <p className="text-xs font-medium text-white truncate">{metricas.proximoEntrenamiento}</p>
        </div>
      </div>

      {/* --- CONTROLES DE FILTROS AVANZADOS --- */}
      <div className="bg-[#1c1b1c] p-4 rounded-xl border border-white/5 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-2 items-center text-xs">
          {/* Navegación Temporal */}
          <input 
            type="date" 
            value={fechaFiltro} 
            onChange={(e) => setFechaFiltro(e.target.value)}
            className="bg-[#2a292a] border border-white/10 rounded px-2 py-1 text-white outline-none"
          />

          {/* Filtro por Tipo */}
          <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)} className="bg-[#2a292a] border border-white/10 rounded px-2 py-1 outline-none text-white">
            <option value="todos">Todos los Tipos</option>
            <option value="Consulta Nutricional">Consulta Nutricional</option>
            <option value="Entrenamiento Personalizado">Entrenamiento Personalizado</option>
            <option value="Otro">Otros</option>
          </select>

          {/* Filtro por Prioridad */}
          <select value={filtroPrioridad} onChange={(e) => setFiltroPrioridad(e.target.value)} className="bg-[#2a292a] border border-white/10 rounded px-2 py-1 outline-none text-white">
            <option value="todos">Todas las Prioridades</option>
            <option value="alta">Alta</option>
            <option value="media">Media</option>
            <option value="baja">Baja</option>
          </select>

          {/* Filtro por Estado */}
          <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)} className="bg-[#2a292a] border border-white/10 rounded px-2 py-1 outline-none text-white">
            <option value="todos">Todos los Estados</option>
            <option value="pendiente">Pendientes</option>
            <option value="completado">Completados</option>
            <option value="cancelado">Cancelados</option>
          </select>
        </div>

        {/* selectores de Vista del Calendario */}
        <div className="flex items-center gap-1 bg-[#201f20] p-1 border border-white/10 rounded-lg text-xs">
          {["dia", "semana", "mes", "historial"].map((v) => (
            <button
              key={v}
              onClick={() => setVista(v)}
              className={`px-3 py-1.5 rounded capitalize font-medium transition-all ${vista === v ? "bg-[#00daf3] text-[#131314] font-bold" : "text-slate-400 hover:text-white"}`}
            >
              {v}
            </button>
          ))}
        </div>

        {/* Acciones de exportación */}
        <div className="flex items-center gap-2 text-xs">
          <button onClick={() => exportarDatos('csv')} className="px-3 py-1.5 bg-[#2a292a] hover:bg-white/5 border border-white/10 rounded text-slate-300 hover:text-white">💾 Excel/CSV</button>
          <button onClick={() => exportarDatos('print')} className="px-3 py-1.5 bg-[#2a292a] hover:bg-white/5 border border-white/10 rounded text-slate-300 hover:text-white">🖨️ Imprimir</button>
        </div>
      </div>

      {/* --- CONTENIDO PRINCIPAL DE VISTA INTERACTIVA --- */}
      {loading ? (
        <div className="space-y-4 animate-pulse">
          <div className="h-12 bg-white/5 rounded-xl w-full"></div>
          <div className="h-32 bg-white/5 rounded-xl w-full"></div>
          <div className="h-32 bg-white/5 rounded-xl w-full"></div>
        </div>
      ) : eventosFiltrados.length === 0 ? (
        <div className="bg-[#201f20] border border-white/5 rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-3">
          <span className="text-4xl">🏝️</span>
          <h3 className="text-base font-bold text-white">Sin compromisos agendados</h3>
          <p className="text-xs text-slate-400 max-w-sm">No hay eventos que coincidan con la fecha o filtros seleccionados en este momento.</p>
          <button onClick={abrirModalCrear} className="text-xs text-[#00daf3] hover:underline font-bold">+ Agendar primer bloque</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {eventosFiltrados.map((evt) => (
            <div 
              key={evt.id} 
              className={`bg-[#201f20] border rounded-xl p-4 flex flex-col justify-between transition-all relative group hover:border-[#00daf3]/40 ${
                evt.prioridad === 'alta' ? 'border-l-4 border-l-rose-500' : evt.prioridad === 'media' ? 'border-l-4 border-l-amber-500' : 'border-l-4 border-l-emerald-500'
              } border-white/5`}
            >
              <div>
                <div className="flex justify-between items-start gap-2 mb-2">
                  <span className={`text-[9px] px-2 py-0.5 rounded uppercase font-bold tracking-wider ${
                    evt.tipo === 'Consulta Nutricional' ? 'bg-cyan-500/10 text-cyan-400' : evt.tipo === 'Entrenamiento Personalizado' ? 'bg-purple-500/10 text-purple-400' : 'bg-slate-500/20 text-slate-300'
                  }`}>
                    {evt.tipo === 'Otro' ? evt.actividadPersonalizada || "Otro" : evt.tipo}
                  </span>
                  
                  <div className="flex items-center gap-1">
                    <select 
                      value={evt.estado} 
                      onChange={(e) => handleCambiarEstado(evt.id, e.target.value)}
                      className="bg-[#131314] text-[10px] text-slate-300 border border-white/10 rounded px-1.5 py-0.5 outline-none cursor-pointer"
                    >
                      <option value="pendiente">⏳ Pendiente</option>
                      <option value="completado">✅ Completado</option>
                      <option value="cancelado">❌ Cancelado</option>
                    </select>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-white group-hover:text-[#00daf3] transition-colors cursor-pointer" onClick={() => abrirModalEditar(evt)}>
                  {evt.titulo}
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{evt.descripcion || "Sin descripción adicional."}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5 font-mono">
                  <span>📅</span> {evt.fecha} 
                  <span className="text-white bg-[#131314] px-1.5 py-0.5 rounded border border-white/5">
                    {evt.horaInicio} - {evt.horaFin}
                  </span>
                </div>
                
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                  <button onClick={() => abrirModalEditar(evt)} className="text-[#00daf3] hover:underline font-semibold">Editar</button>
                  <button onClick={() => handleEliminar(evt.id)} className="text-rose-400 hover:text-rose-300">Eliminar</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- MODAL DIALOG: CREAR Y EDITAR COMPROMISO --- */}
      {modalAbierto && (
        <div className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <form 
            onSubmit={handleGuardarCompromiso}
            className="bg-[#201f20] border border-white/10 rounded-xl w-full max-w-lg p-6 shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>📝</span> {eventoEditar ? "Modificar Bloque Horario" : "Registrar Nuevo Compromiso"}
              </h2>
              <button type="button" onClick={cerrarModal} className="text-slate-400 hover:text-white text-sm">✕</button>
            </div>

            {/* Fila Título */}
            <div className="flex flex-col gap-1 text-xs">
              <label className="text-slate-400 font-medium">Título del Compromiso *</label>
              <input 
                type="text" 
                required
                placeholder="Ej. Control de Pliegues Antropométricos - Ana M."
                value={form.titulo}
                onChange={(e) => setForm(prev => ({...prev, titulo: e.target.value}))}
                className="bg-[#131314] border border-white/10 rounded p-2 text-white outline-none focus:border-[#00daf3]"
              />
            </div>

            {/* Fila Tiempos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="flex flex-col gap-1">
                <label className="text-slate-400">Fecha *</label>
                <input 
                  type="date" 
                  required
                  value={form.fecha}
                  onChange={(e) => setForm(prev => ({...prev, fecha: e.target.value}))}
                  className="bg-[#131314] border border-white/10 rounded p-2 text-white outline-none"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-slate-400">Hora Inicio *</label>
                <input 
                  type="time" 
                  required
                  value={form.horaInicio}
                  onChange={(e) => setForm(prev => ({...prev, horaInicio: e.target.value}))}
                  className="bg-[#131314] border border-white/10 rounded p-2 text-white outline-none"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-slate-400">Hora Término *</label>
                <input 
                  type="time" 
                  required
                  value={form.horaFin}
                  onChange={(e) => setForm(prev => ({...prev, horaFin: e.target.value}))}
                  className="bg-[#131314] border border-white/10 rounded p-2 text-white outline-none"
                />
              </div>
            </div>

            {/* Tipo de Bloque */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="flex flex-col gap-1">
                <label className="text-slate-400">Tipo de Actividad</label>
                <select 
                  value={form.tipo}
                  onChange={(e) => setForm(prev => ({...prev, tipo: e.target.value}))}
                  className="bg-[#131314] border border-white/10 rounded p-2 text-white outline-none"
                >
                  <option value="Consulta Nutricional">Consulta Nutricional</option>
                  <option value="Entrenamiento Personalizado">Entrenamiento Personalizado</option>
                  <option value="Otro">Otro (Especificar)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-slate-400">Prioridad Quirúrgica/Deportiva</label>
                <select 
                  value={form.prioridad}
                  onChange={(e) => setForm(prev => ({...prev, prioridad: e.target.value}))}
                  className="bg-[#131314] border border-white/10 rounded p-2 text-white outline-none"
                >
                  <option value="baja">🟢 Baja Prioridad</option>
                  <option value="media">🟡 Media Prioridad</option>
                  <option value="alta">🔴 Alta Prioridad</option>
                </select>
              </div>
            </div>

            {/* Campo Condicional: "Otro" */}
            {form.tipo === "Otro" && (
              <div className="flex flex-col gap-1 text-xs animate-fadeIn">
                <label className="text-[#00daf3] font-bold">Especifique la actividad *</label>
                <input 
                  type="text"
                  required
                  placeholder="Ej. Grabación de Contenido, Reunión Médica, etc."
                  value={form.actividadPersonalizada}
                  onChange={(e) => setForm(prev => ({...prev, actividadPersonalizada: e.target.value}))}
                  className="bg-[#131314] border border-cyan-400/50 rounded p-2 text-white outline-none focus:border-cyan-400"
                />
              </div>
            )}

            {/* Recordatorios anticipados */}
            <div className="flex flex-col gap-1 text-xs">
              <label className="text-slate-400">Configurar Alerta Anticipada</label>
              <select 
                value={form.recordatorio}
                onChange={(e) => setForm(prev => ({...prev, recordatorio: e.target.value}))}
                className="bg-[#131314] border border-white/10 rounded p-2 text-white outline-none"
              >
                <option value="15_min">15 minutos antes</option>
                <option value="30_min">30 minutos antes</option>
                <option value="1_hora">1 hora antes</option>
                <option value="1_dia">1 día antes</option>
              </select>
            </div>

            {/* Descripción */}
            <div className="flex flex-col gap-1 text-xs">
              <label className="text-slate-400">Notas de la Sesión</label>
              <textarea 
                rows="3"
                placeholder="Añade especificaciones, requerimientos del atleta o recordatorios privados..."
                value={form.descripcion}
                onChange={(e) => setForm(prev => ({...prev, descripcion: e.target.value}))}
                className="bg-[#131314] border border-white/10 rounded p-2 text-white outline-none focus:border-[#00daf3]"
              ></textarea>
            </div>

            {/* Botones de acción */}
            <div className="flex justify-between items-center pt-2 border-t border-white/5 text-xs">
              {eventoEditar ? (
                <button 
                  type="button" 
                  onClick={() => handleEliminar(eventoEditar.id)}
                  className="text-rose-400 hover:underline font-bold"
                >
                  Eliminar Evento
                </button>
              ) : <div />}

              <div className="flex gap-2">
                <button 
                  type="button" 
                  onClick={cerrarModal}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded text-slate-300 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-[#00daf3] text-[#131314] font-bold rounded hover:bg-cyan-300 transition-all shadow-md"
                >
                  {eventoEditar ? "Guardar Cambios" : "Agendar Bloque"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
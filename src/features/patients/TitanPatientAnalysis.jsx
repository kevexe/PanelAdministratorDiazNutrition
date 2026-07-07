// src/TitanPatientAnalysis.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from './../../firebase/firebase';  // ⚠️ Ajusta esta ruta según la ubicación real de tu firebase.js
import { doc, onSnapshot } from 'firebase/firestore';

export default function TitanPatientAnalysis() {
  const navigate = useNavigate();
  
  // Estados para manejar el atleta cargado
  const [atleta, setAtleta] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Obtenemos el ID del atleta guardado en la sesión
    const atletaId = sessionStorage.getItem("atleta_seleccionado_id");
    
    if (!atletaId) {
      setLoading(false);
      return;
    }

    // 2. Escuchamos el documento del atleta en tiempo real
    const docRef = doc(db, "usuarios", atletaId);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setAtleta({ id: docSnap.id, ...docSnap.data() });
      } else {
        console.error("El atleta seleccionado no existe en Firestore.");
      }
      setLoading(false);
    }, (error) => {
      console.error("Error al cargar la telemetría del atleta:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Función auxiliar para formatear la fecha de registro de forma elegante
  const formatFecha = (isoString) => {
    if (!isoString) return "No registrada";
    const fecha = new Date(isoString);
    return fecha.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Estado de carga inicial si no hay sesión o está conectando
  if (loading) {
    return (
      <div className="w-full min-h-screen bg-[#0f0f10] flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-2 border-[#00f2ff] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-mono text-[#00f2ff] tracking-widest uppercase animate-pulse">Sincronizando Ficha Clínica Titan...</p>
        </div>
      </div>
    );
  }

  // Estado de alerta por si no se ha seleccionado ningún atleta previamente
  if (!atleta) {
    return (
      <div className="w-full min-h-screen bg-[#0f0f10] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#171719] border border-white/5 rounded-xl p-8 text-center space-y-4">
          <span className="text-4xl">🗄️</span>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Ningún Atleta Seleccionado</h3>
          <p className="text-xs text-[#a3a3a3] leading-relaxed">
            Para auditar los análisis avanzados de rendimiento, primero debes seleccionar un perfil activo desde la Base de Datos.
          </p>
          <button 
            onClick={() => navigate('/base-datos')}
            className="w-full py-2.5 bg-[#00f2ff] text-black text-xs font-black uppercase tracking-widest rounded-lg hover:bg-cyan-300 transition-colors"
          >
            Ir a Base de Datos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#0f0f10] text-[#e5e5e5] antialiased selection:bg-cyan-500 selection:text-black font-['Inter',_sans-serif] p-8 overflow-y-auto">
      
      <div className="max-w-[1600px] mx-auto grid grid-cols-12 gap-5">
        
        {/* ==================== PATIENT PROFILE HEADER ==================== */}
        <div className="col-span-12 bg-[#171719] border border-[#262626] rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center gap-8">
          <div className="flex items-center gap-6">
            {/* Imagen estática: Próximamente linkeada a la App Móvil */}
            <img 
              alt={atleta.nombre} 
              className="w-24 h-24 rounded-full object-cover border-2 border-[#00b4d8]" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBIKjH9JTxdyFaYTHPVXZ3IRvEi2YOPxRL9I44xhW9afbCGFHRr_k1UHGK_V0spFy3P0Z0uoVFcHNVwLWQAY_G4vwpYm5zEEF2tlGWNxuNlTJDepbhU8o8EqDKHygWq3zDU8d8eps5y7zR1h81cnSTODuonbnwDdIaj5fvIFqCmN1dPYSucwZP5p6RGxLuhuEE6fCigDpYr_r0ZTVNOhTiy7fhcxungUnKSM0DkRCe6y6v6kCe0DhEMwFCMBxnUlMinAUeLVm89Ir9o"
            />
            <div>
              {/* NOMBRE DINÁMICO */}
              <h2 className="text-2xl text-white mb-1 tracking-wide font-semibold">
                {atleta.nombre} {atleta.apellido || ''}
              </h2>
              <div className="flex gap-2 mb-2">
                <span className="px-2 py-0.5 rounded bg-[#1f1f23] border border-[#262626] text-[11px] font-medium text-[#a3a3a3] flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${atleta.isActive ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                  {atleta.isActive ? 'ACTIVO' : 'INACTIVO'}
                </span>
                <span className={`px-2 py-0.5 rounded border text-[11px] font-semibold uppercase ${
                  atleta.modalidad === 'ONLINE' 
                    ? 'bg-purple-950/40 border-purple-800 text-purple-400' 
                    : 'bg-cyan-950/40 border-cyan-800 text-[#00f2ff]'
                }`}>
                  {atleta.modalidad || 'PRESENCIAL'}
                </span>
              </div>
            </div>
          </div>
          
          {/* MÉTRICAS FLUIDAS EXTRACTADAS DE LA BASE DE DATOS */}
          <div className="flex-1 flex flex-wrap gap-x-8 gap-y-4 justify-end">
            <div className="flex flex-col">
              <span className="text-[11px] font-medium text-[#737373] tracking-wider">EDAD</span>
              <span className="text-lg text-white font-semibold">{atleta.edad || '--'}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-medium text-[#737373] tracking-wider">PESO</span>
              <span className="text-lg text-white font-semibold">
                {atleta.antropometria?.peso || '--'} <span className="text-xs text-[#a3a3a3] font-normal">kg</span>
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-medium text-[#737373] tracking-wider">ESTATURA</span>
              <span className="text-lg text-white font-semibold">
                {atleta.antropometria?.estatura || '--'} <span className="text-xs text-[#a3a3a3] font-normal">cm</span>
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-medium text-[#737373] tracking-wider">FECHA REGISTRO</span>
              <span className="text-lg text-white font-semibold">{formatFecha(atleta.createdAt)}</span>
            </div>
            <div className="flex flex-col border-l border-[#262626] pl-6">
              <span className="text-[11px] font-medium text-[#737373] tracking-wider">OBJETIVO PRINCIPAL</span>
              <span className="text-sm text-[#00f2ff] font-medium max-w-[220px] truncate">
                {atleta.estrategiaNutricional?.enfoqueDietoterapeutico || "Acondicionamiento Base"}
              </span>
            </div>
          </div>
        </div>

        {/* ==================== EXECUTIVE SUMMARY (ESTÁTICO PARA GOOGLE API) ==================== */}
        <div className="col-span-12 bg-[#171719] border border-[#262626] border-l-4 border-l-[#00f2ff] rounded-xl p-6">
          <div className="flex gap-4 items-start">
            <span className="material-symbols-outlined text-[#00f2ff] mt-1">auto_awesome</span>
            <div>
              <h3 className="text-[11px] font-semibold text-[#a3a3a3] mb-1 tracking-wider">RESUMEN TITAN AI</h3>
              <p className="text-xl text-[#e5e5e5] leading-relaxed tracking-wide font-normal">
                Paciente con <span className="text-[#00f2ff] font-semibold">91% de adherencia</span>. Ha perdido <span className="text-[#00f2ff] font-semibold">8.4 kg</span> en 12 semanas. Recuperación muscular óptima post-ciclo. Ligera fatiga en cadena posterior detectada.
              </p>
            </div>
          </div>
        </div>

        {/* ==================== THREE COLUMN LAYOUT ==================== */}
        
        {/* Left Column: Body Comp & Metrics (Estático - Viene de App Móvil) */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-5">
          <div className="bg-[#171719] border border-[#262626] rounded-xl p-5">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-[11px] font-semibold text-[#a3a3a3] tracking-wider">COMPOSICIÓN CORPORAL</h3>
              <button 
                onClick={() => navigate('/comparacion')} 
                className="text-[#737373] hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined text-sm">open_in_full</span>
              </button>
            </div>
                        
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-end mb-1.5">
                  <span className="text-sm text-[#e5e5e5]">Masa Grasa</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#737373] line-through">18.5%</span>
                    <span className="text-base text-[#00f2ff] font-semibold">14.2%</span>
                  </div>
                </div>
                <div className="w-full bg-[#262626] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#00f2ff] h-full" style={{ width: '76%' }}></div>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[10px] text-emerald-500 font-medium flex items-center gap-0.5">↓ 4.3%</span>
                  <span className="text-[10px] text-[#737373]">Meta: 12%</span>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-end mb-1.5">
                  <span className="text-sm text-[#e5e5e5]">Masa Muscular</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#737373] line-through">42.1kg</span>
                    <span className="text-base text-[#00f2ff] font-semibold">44.8kg</span>
                  </div>
                </div>
                <div className="w-full bg-[#262626] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#00f2ff] h-full" style={{ width: '85%' }}></div>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[10px] text-emerald-500 font-medium flex items-center gap-0.5">↑ 2.7kg</span>
                  <span className="text-[10px] text-[#737373]">Meta: 46kg</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Alertas y Riesgos (Estático - Viene de App Móvil) */}
          <div className="bg-[#171719] border border-[#262626] rounded-xl p-5 flex-1">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[11px] font-semibold text-[#a3a3a3] tracking-wider">ALERTAS Y RIESGOS</h3>
            </div>
            <div className="flex flex-col gap-3">
              <div className="bg-[#1f1a14] border border-[#db7b04]/30 rounded-lg p-3 flex gap-3 items-start">
                <span className="material-symbols-outlined text-[#f59e0b]">warning</span>
                <div>
                  <h4 className="text-sm text-[#e5e5e5] font-medium">Riesgo de Sobrentrenamiento</h4>
                  <p className="text-xs text-[#a3a3a3] mt-0.5">HRV ha bajado un 15% en los últimos 3 días.</p>
                </div>
              </div>
              <div className="bg-[#141f18] border border-emerald-500/20 rounded-lg p-3 flex gap-3 items-start">
                <span className="material-symbols-outlined text-emerald-500">check_circle</span>
                <div>
                  <h4 className="text-sm text-[#e5e5e5] font-medium">Adherencia Dietética</h4>
                  <p className="text-xs text-[#a3a3a3] mt-0.5">Consumo de macronutrientes en rango óptimo.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Center Column: 3D Anatomy Model (Estático) */}
        <div className="col-span-12 lg:col-span-4 relative flex items-center justify-center min-h-[450px] bg-[#171719] border border-[#262626] rounded-xl overflow-hidden">
          <div className="absolute top-4 left-4 z-10">
            <span className="text-[10px] font-semibold text-[#a3a3a3] border border-[#262626] px-2 py-1 rounded bg-[#121212]">VISTA ANTERIOR</span>
          </div>
          
          <div className="absolute top-1/3 left-1/4 z-10 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#f59e0b]"></div>
            <div className="bg-[#1f1f23] border border-[#262626] px-2 py-1 rounded text-[10px] text-[#e5e5e5]">Deltoide Ant. (Fatiga)</div>
          </div>
          
          <div className="absolute bottom-1/3 right-1/4 z-10 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#00f2ff]"></div>
            <div className="bg-[#1f1f23] border border-[#262626] px-2 py-1 rounded text-[10px] text-[#e5e5e5]">Cuádriceps (Óptimo)</div>
          </div>
          
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1 z-10 bg-[#1f1f23] rounded-lg p-1 border border-[#262626]">
            <button className="w-8 h-8 rounded flex items-center justify-center text-[#a3a3a3] hover:text-white hover:bg-[#262626] transition-colors"><span className="material-symbols-outlined text-sm">360</span></button>
            <button className="w-8 h-8 rounded flex items-center justify-center text-[#00f2ff] bg-[#171719] border border-[#262626] transition-colors"><span className="material-symbols-outlined text-sm">front_hand</span></button>
          </div>
        </div>

        {/* Right Column: Heatmaps & Compliance (Estático) */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-5">
          
          {/* Diet Compliance Heatmap */}
          <div className="bg-[#171719] border border-[#262626] rounded-xl p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[11px] font-semibold text-[#a3a3a3] tracking-wider">CUMPLIMIENTO DIETA (30D)</h3>
              <span className="text-sm font-semibold text-[#00f2ff]">94%</span>
            </div>
            
            <div className="grid grid-cols-7 gap-1.5">
              {Array.from({ length: 28 }).map((_, i) => {
                let colorClass = "bg-[#1f1f23] border border-[#262626]";
                if(i === 12 || i === 18) colorClass = "bg-[#3a2a14] border border-[#543d1e]";
                if(i === 5) colorClass = "bg-[#3a1414] border border-[#541e1e]";
                if(i >= 20) colorClass = "bg-[#00f2ff]/20 border border-[#00f2ff]/60";
                
                return (
                  <div 
                    key={i} 
                    className={`aspect-square rounded ${colorClass} transition-colors cursor-pointer`} 
                  />
                );
              })}
            </div>
          </div>
          
          {/* Cardio/Training Metrics */}
          <div className="bg-[#171719] border border-[#262626] rounded-xl p-5 flex-1">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[11px] font-semibold text-[#a3a3a3] tracking-wider">CARGA DE ENTRENAMIENTO</h3>
            </div>
            
            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <div className="relative w-14 h-14 flex-shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#262626" strokeWidth="3.5"></path>
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#00f2ff" strokeDasharray="85, 100" strokeWidth="3.5"></path>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs text-white font-bold">85%</span>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm text-[#e5e5e5] font-medium">Volumen Semanal</h4>
                  <p className="text-xs text-[#a3a3a3]">12.4h / 14.5h Objetivo</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#1f1f23] rounded-lg p-3 border border-[#262626]">
                  <span className="material-symbols-outlined text-[#00f2ff] text-base mb-1">directions_run</span>
                  <div className="text-lg text-white font-bold">42.5 <span className="text-xs text-[#a3a3a3] font-normal">km</span></div>
                  <div className="text-[10px] text-[#737373] uppercase font-medium">Distancia Semanal</div>
                </div>
                <div className="bg-[#1f1f23] rounded-lg p-3 border border-[#262626]">
                  <span className="material-symbols-outlined text-[#00f2ff] text-base mb-1">local_fire_department</span>
                  <div className="text-lg text-white font-bold">8,450 <span className="text-xs text-[#a3a3a3] font-normal">kcal</span></div>
                  <div className="text-[10px] text-[#737373] uppercase font-medium">Calorías Semanal</div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
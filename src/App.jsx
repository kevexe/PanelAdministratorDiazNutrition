import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { db } from "./firebase/firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import TitanDatabase from "./features/admin/TitanDatabase"; // Asegúrate de apuntar a la carpeta donde lo creaste

// --- PAGES ---
import Dashboard from "./pages/Dashboard";

// --- FEATURES ---
import TitanPatientAnalysis from "./features/patients/TitanPatientAnalysis"; 
import TitanTraining from "./features/training/TitanTraining";
import TitanAdvancedComparison from "./features/analytics/TitanAdvancedComparison";
import TitanAgenda from "./features/agenda/TitanAgenda";
import TitanActivationCodes from "./features/admin/TitanActivationCodes";
import TitanPatientRegistration from "./features/patients/TitanPatientRegistration"; 

// --- LAYOUTS ---
import TitanApp from "./layouts/TitanApp";

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const [mostrarModalPacientes, setMostrarModalPacientes] = useState(false);
  const [rutaDestinoModal, setRutaDestinoModal] = useState("");
  
  // Estados para Firebase y Buscador de la Barra Lateral
  const [pacientes, setPacientes] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(true);

const [idAtletaActual, setIdAtletaActual] = useState(sessionStorage.getItem("atleta_seleccionado_id"));

  const isActive = (path) => location.pathname === path;

  // --- ESCUCHA DE CLIENTES DESDE LA NUEVA COLECCIÓN 'usuarios' ---
  useEffect(() => {
    // 1. Consultamos solo a los usuarios que son afiliados y están activos
    const q = query(
      collection(db, "usuarios"),
      where("estadoDeCuenta", "==", "afiliado"),
      where("isActive", "==", true)
    );
    

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        
        // 2. Extraemos las iniciales inteligentemente
        let iniciales = "PT";
        if (data.nombre) {
           const nombreCompleto = `${data.nombre} ${data.apellido || ''}`.trim();
           const palabras = nombreCompleto.split(" ");
           iniciales = palabras.length > 1 
            ? `${palabras[0][0]}${palabras[1][0]}`.toUpperCase() 
            : `${palabras[0][0]}`.toUpperCase();
        }

        docs.push({ 
          id: doc.id, 
          iniciales,
          ...data 
        });
      });

      // 3. Ordenamos alfabéticamente por nombre (Hecho en JS para no requerir índices en Firebase)
      docs.sort((a, b) => (a.nombre || "").localeCompare(b.nombre || ""));

      // 4. Actualizamos el estado que alimenta la barra lateral
      setPacientes(docs);
      setLoading(false);
    }, (error) => {
      console.error("Error cargando la colección de afiliados:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // --- LÓGICA DE FILTRADO (BÚSQUEDA POR NOMBRE E ID) ---
  const pacientesFiltrados = pacientes.filter((p) => {
    const queryLower = busqueda.toLowerCase();
    const nombreCompleto = `${p.nombre || ''} ${p.apellido || ''}`.toLowerCase();
    const matchNombre = nombreCompleto.includes(queryLower);
    const matchId = p.id?.toLowerCase().includes(queryLower);
    const matchDui = p.identificacion?.toLowerCase().includes(queryLower); // Ajustado al campo que creamos en tu registro
    return matchNombre || matchId || matchDui;
  });

  const abrirSelectorPacientes = (ruta) => {
    setRutaDestinoModal(ruta);
    setMostrarModalPacientes(true);
  };

 const seleccionarPaciente = (paciente) => {
    setMostrarModalPacientes(false);
    sessionStorage.setItem("atleta_seleccionado_id", paciente.id);
    setIdAtletaActual(paciente.id); // <--- AÑADE ESTA LÍNEA
    navigate(rutaDestinoModal);
  };

  return (
    <div className="bg-[#131314] text-[#e5e2e3] font-sans antialiased h-screen flex overflow-hidden selection:bg-[#00daf3]/30 selection:text-[#c3f5ff] relative">
      
      {/* ==================== SIDEBAR COMPLETA ==================== */}
      <nav className="hidden md:flex bg-[#201f20] w-[280px] border-r border-white/10 flex-col py-8 z-50 shrink-0">
        
        {/* Marca / Logo */}
        <div className="px-6 mb-8 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-[#00daf3]/20 flex items-center justify-center border border-[#00daf3]/30">
            <span className="text-[#00daf3] font-bold text-xl">T</span>
          </div>
          <div>
            <h1 className="text-base font-bold text-[#00daf3]">Titan Performance</h1>
            <p className="text-[10px] uppercase tracking-wider text-[#bac9cc]">Portal de Monitoreo Elite</p>
          </div>
        </div>

        {/* Botón Principal: Redirige al registro */}
        <div className="px-6 mb-6">
          <button 
            onClick={() => navigate('/register-patient')}
            className="w-full py-3 bg-[#00daf3] text-[#131314] text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-[#c3f5ff] transition-colors flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,218,243,0.3)]"
          >
            <span>+</span> Nuevo Cliente
          </button>
        </div>

        {/* Listado del Menú con Scroll Moderno */}
        <div className="flex-1 overflow-y-auto px-6 flex flex-col gap-2 
          [&::-webkit-scrollbar]:w-1.5 
          [&::-webkit-scrollbar-track]:bg-transparent 
          [&::-webkit-scrollbar-thumb]:bg-[#00daf3]/20 
          [&::-webkit-scrollbar-thumb]:rounded-full 
          hover:[&::-webkit-scrollbar-thumb]:bg-[#00daf3]/40">
          
          <button 
            onClick={() => navigate('/')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-xs uppercase tracking-wider transition-all w-full text-left ${
              isActive('/') 
                ? 'text-[#00daf3] border-r-2 border-[#00daf3] bg-[#00daf3]/5 font-bold' 
                : 'text-[#bac9cc] hover:bg-white/5 hover:text-white'
            }`}
          >
            <span>📊</span> Panel de Control
          </button>

          <button 
            onClick={() => abrirSelectorPacientes('/editor-plan')}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-xs uppercase tracking-wider text-[#bac9cc] hover:bg-white/5 hover:text-white transition-all w-full text-left"
          >
            <span>🍎</span> Nutrición
          </button>

          <button 
            onClick={() => abrirSelectorPacientes('/training')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-xs uppercase tracking-wider transition-all w-full text-left ${
              isActive('/training') 
                ? 'text-[#00daf3] border-r-2 border-[#00daf3] bg-[#00daf3]/5 font-bold' 
                : 'text-[#bac9cc] hover:bg-white/5 hover:text-white'
            }`}
          >
            <span>🏋️</span> Entrenamiento
          </button>

          <button 
            onClick={() => navigate('/agenda')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-xs uppercase tracking-wider transition-all w-full text-left ${
              isActive('/agenda') 
                ? 'text-[#00daf3] border-r-2 border-[#00daf3] bg-[#00daf3]/5 font-bold' 
                : 'text-[#bac9cc] hover:bg-white/5 hover:text-white'
            }`}
          >
            <span>📅</span> Agenda
          </button>

          <button 
            onClick={() => navigate('/generate-codes')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-xs uppercase tracking-wider transition-all w-full text-left ${
              isActive('/generate-codes') 
                ? 'text-[#00daf3] border-r-2 border-[#00daf3] bg-[#00daf3]/5 font-bold' 
                : 'text-[#bac9cc] hover:bg-white/5 hover:text-white'
            }`}
          >
            <span>🔑</span> Generar Códigos
          </button>

          {/* NUEVO BOTÓN: BASE DE DATOS */}
          <button 
            onClick={() => navigate('/base-datos')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-xs uppercase tracking-wider transition-all w-full text-left ${
              isActive('/base-datos') 
                ? 'text-[#00daf3] border-r-2 border-[#00daf3] bg-[#00daf3]/5 font-bold' 
                : 'text-[#bac9cc] hover:bg-white/5 hover:text-white'
            }`}
          >
            <span>🗄️</span> Base de Datos
          </button>
          
          <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-xs uppercase tracking-wider text-[#bac9cc] hover:bg-white/5 hover:text-white transition-all w-full text-left">
            <span>⚙️</span> Configuración
          </button>
        </div>

        {/* ==================== BUSCADOR INTEGRADO EN BARRA LATERAL ==================== */}
        <div className="px-6 mt-auto border-t border-white/5 pt-4 flex flex-col max-h-[220px]">
          <p className="text-[10px] uppercase tracking-wider text-[#bac9cc] mb-2">🔍 Buscar Atleta (Nombre/ID)</p>
          
          <input 
            type="text" 
            placeholder="Escribe ID o Nombre..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full bg-[#131314] border border-white/10 rounded px-2 py-1.5 text-xs text-white outline-none focus:border-[#00daf3] placeholder-slate-600 mb-2"
          />

          <div className="overflow-y-auto space-y-1 pr-1 flex-1 
            [&::-webkit-scrollbar]:w-1
            [&::-webkit-scrollbar-thumb]:bg-white/10
            [&::-webkit-scrollbar-thumb]:rounded-full">
            {loading ? (
              <p className="text-[10px] text-slate-500 animate-pulse">Buscando en el servidor...</p>
            ) : pacientesFiltrados.length === 0 ? (
              <p className="text-[10px] text-slate-500 italic">No se encontraron coincidencias</p>
            ) : (
              pacientesFiltrados.slice(0, 4).map((paciente) => (
                <div 
                  key={paciente.id}
                 onClick={() => {
                    sessionStorage.setItem("atleta_seleccionado_id", paciente.id);
                    setIdAtletaActual(paciente.id); // <--- AÑADE ESTA LÍNEA
                    navigate('/patient');
                  }}
                  className="flex items-center gap-2.5 p-1.5 rounded hover:bg-white/5 cursor-pointer transition-colors group"
                >
                  <div className="w-6 h-6 rounded-full bg-[#00daf3]/10 border border-[#00daf3]/20 flex items-center justify-center text-[9px] font-bold text-[#00daf3] shrink-0">
                    {paciente.iniciales}
                  </div>
                  <div className="truncate min-w-0 flex-1">
                    <p className="text-xs text-white font-medium truncate group-hover:text-[#00daf3] transition-colors">{paciente.nombre} {paciente.apellido}</p>
                    <p className="text-[8px] font-mono text-slate-500 truncate">ID: {paciente.id.substring(0,8)}...</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer Sidebar */}
        <div className="px-6 pt-4 border-t border-white/10 mt-2">
          <button className="flex items-center gap-3 px-4 py-2 text-xs uppercase tracking-wider text-[#bac9cc] hover:text-white w-full text-left">
            <span>❓</span> Soporte Técnico
          </button>
          <button className="flex items-center gap-3 px-4 py-2 text-xs uppercase tracking-wider text-red-400 hover:text-red-300 mt-1 w-full text-left">
            <span>🚪</span> Cerrar Sesión
          </button>
        </div>
      </nav>

      {/* ==================== CONTENEDOR DERECHO PRINCIPAL ==================== */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Top Bar / Encabezado */}
        <header className="bg-[#131314]/85 sticky top-0 z-40 backdrop-blur-2xl border-b border-white/10 flex justify-between items-center w-full px-6 md:px-10 py-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-black text-white">Hola, <span className="text-[#00daf3]">Coach</span></h2>
              <span className="px-2 py-0.5 bg-[#2a2a2b] rounded font-mono text-[10px] text-[#bac9cc] border border-white/5">SISTEMA COMPLETO</span>
            </div>
            <p className="text-xs text-[#bac9cc] italic mt-0.5 opacity-80">"Monitoreo centralizado y escalable conectado a Cloud Firestore."</p>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => abrirSelectorPacientes('/editor-plan')}
              className="px-4 py-2 bg-[#2a2a2b] border border-[#00daf3]/30 text-[#00daf3] text-xs uppercase tracking-wider rounded hover:bg-[#00daf3]/10 transition-colors"
            >
              Actualizar Plan
            </button>
            <div className="w-8 h-8 rounded-full bg-[#00daf3]/30 border border-[#00daf3] cursor-pointer"></div>
          </div>
        </header>

        {/* Vistas de la aplicación intercambiables mediante enrutador */}
        <div className="flex-1 overflow-y-auto relative">
          <Routes>
            <Route path="/" element={<Dashboard />} />
          <Route path="/patient" element={<TitanPatientAnalysis key={idAtletaActual} />} />
            <Route path="/editor-plan" element={<TitanApp />} />
            <Route path="/training" element={<TitanTraining />} />
            <Route path="/register-patient" element={<TitanPatientRegistration />} />
            <Route path="/generate-codes" element={<TitanActivationCodes />} />
            <Route path="/comparacion" element={<TitanAdvancedComparison />} />
            <Route path="/agenda" element={<TitanAgenda />} />
            
           <Route path="/base-datos" element={<TitanDatabase />} />
          </Routes>
        </div>
      </div>

      {/* ==================== MODAL SELECCIÓN DE PACIENTES ==================== */}
      {mostrarModalPacientes && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md transition-all">
          <div className="bg-[#201f20] border border-white/10 w-full max-w-md rounded-xl p-6 shadow-[0_0_50px_rgba(0,218,243,0.15)] flex flex-col gap-4 relative">
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="text-[#00daf3]">📋</span> Seleccionar Atleta Activo
                </h3>
                <p className="text-xs text-[#bac9cc] mt-0.5">Elige un perfil de la base de datos de Firebase.</p>
              </div>
              <button onClick={() => setMostrarModalPacientes(false)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                ✕
              </button>
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {pacientes.map((paciente) => (
                <div key={paciente.id} onClick={() => seleccionarPaciente(paciente)} className="flex items-center justify-between p-3 rounded-lg bg-[#131314] border border-white/5 hover:border-[#00daf3]/40 hover:bg-[#00daf3]/5 cursor-pointer transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#00daf3]/10 border border-[#00daf3]/20 flex items-center justify-center text-xs font-bold text-[#00daf3] group-hover:bg-[#00daf3]/20 transition-colors">
                      {paciente.iniciales}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white group-hover:text-[#00daf3] transition-colors">{paciente.nombre} {paciente.apellido}</h4>
                      {/* Mostrará el teléfono si existe */}
                      <p className="text-[11px] text-[#bac9cc]">{paciente.modalidad || "PRESENCIAL"} — {paciente.telefono || "Sin Teléfono"}</p>
                    </div>
                  </div>
                  <span className="text-xs text-[#00daf3] opacity-0 group-hover:opacity-100 transition-opacity font-mono font-bold">
                    Cargar →
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2 border-t border-white/5">
              <button onClick={() => setMostrarModalPacientes(false)} className="px-4 py-2 bg-white/5 rounded text-xs font-bold hover:bg-white/10 transition-colors text-[#bac9cc]">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
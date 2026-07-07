import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  
  // Estados para controlar las animaciones
  const [showWelcome, setShowWelcome] = useState(true);
  const [startDashboardAnimation, setStartDashboardAnimation] = useState(false);
  const [saludo, setSaludo] = useState('');

  // Función para calcular si es de día, tarde o noche
  useEffect(() => {
    const hora = new Date().getHours();
    if (hora >= 5 && hora < 12) setSaludo("Buenos días");
    else if (hora >= 12 && hora < 19) setSaludo("Buenas tardes");
    else setSaludo("Buenas noches");

    // Temporizador: A los 2.5 segundos, oculta la bienvenida e inicia el Dashboard
    const timer = setTimeout(() => {
      setShowWelcome(false);
      // Damos un pequeño respiro de 300ms antes de que las tarjetas empiecen a subir
      setTimeout(() => setStartDashboardAnimation(true), 300);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* ==================== PANTALLA DE BIENVENIDA (OVERLAY) ==================== */}
      <div 
        className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0a0a0a] transition-all duration-1000 ease-in-out ${
          showWelcome ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
        }`}
      >
        <h1 className={`text-3xl md:text-5xl lg:text-6xl text-white font-light tracking-[0.2em] uppercase text-center px-4 transition-all duration-1000 ease-out transform ${
          showWelcome ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-8 opacity-0 scale-95'
        }`}>
          {saludo}, <br className="md:hidden" />
          <span className="font-bold text-[#00daf3] mt-2 md:mt-0 md:ml-4 inline-block drop-shadow-[0_0_15px_rgba(0,218,243,0.4)]">
            Johan
          </span>
        </h1>
        <div className="w-12 h-[1px] bg-[#00daf3]/50 mt-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 h-full bg-[#00daf3] w-full animate-[pulse_1.5s_ease-in-out_infinite]"></div>
        </div>
      </div>

      {/* ==================== DASHBOARD PRINCIPAL ==================== */}
      <div className="flex-1 overflow-y-auto p-6 md:p-10 pb-12 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#00daf3]/20 [&::-webkit-scrollbar-thumb]:rounded-full">
        
        {/* Bento Grid Layout (Contenido Principal) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 max-w-[1440px] mx-auto mb-16">
          
          {/* 1. MÉTRICAS GENERALES (Entran una por una) */}
          <div className="md:col-span-12 grid grid-cols-2 lg:grid-cols-4 gap-6 mb-2">
            
            {/* Tarjeta 1 */}
            <div 
              onClick={() => navigate('/patient')} 
              className={`bg-gradient-to-b from-[#1A1C1E] to-[#131314] border border-white/5 rounded-xl p-5 relative overflow-hidden group cursor-pointer hover:border-[#00daf3]/30 transition-all duration-700 ease-out delay-[100ms] ${
                startDashboardAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
              }`}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#00daf3]/5 rounded-full blur-xl -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
              <div className="flex justify-between items-start mb-4 relative z-10">
                <h3 className="text-xs uppercase tracking-wider text-[#bac9cc] font-semibold">Pacientes Activos</h3>
                <span className="text-[#00daf3] text-xl">👥</span>
              </div>
              <div className="flex items-end gap-3 relative z-10">
                <span className="text-4xl md:text-5xl font-bold text-white">142</span>
                <span className="text-xs text-green-400 mb-2 flex items-center">↑ 12%</span>
              </div>
            </div>

            {/* Tarjeta 2 */}
            <div className={`bg-gradient-to-b from-[#1A1C1E] to-[#131314] border border-white/5 rounded-xl p-5 relative overflow-hidden group transition-all duration-700 ease-out delay-[200ms] ${
              startDashboardAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            }`}>
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#ffb4aa]/5 rounded-full blur-xl -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
              <div className="flex justify-between items-start mb-4 relative z-10">
                <h3 className="text-xs uppercase tracking-wider text-[#bac9cc] font-semibold">Nuevos (Mes)</h3>
                <span className="text-[#ffb4aa] text-xl">👤</span>
              </div>
              <div className="flex items-end gap-3 relative z-10">
                <span className="text-4xl md:text-5xl font-bold text-white">18</span>
                <span className="text-xs text-green-400 mb-2 flex items-center">↑ 4</span>
              </div>
            </div>

            {/* Tarjeta 3 */}
            <div className={`bg-gradient-to-b from-[#1A1C1E] to-[#131314] border border-white/5 rounded-xl p-5 relative overflow-hidden group transition-all duration-700 ease-out delay-[300ms] ${
              startDashboardAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            }`}>
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#00e5ff]/5 rounded-full blur-xl -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
              <div className="flex justify-between items-start mb-4 relative z-10">
                <h3 className="text-xs uppercase tracking-wider text-[#bac9cc] font-semibold">Planes Enviados</h3>
                <span className="text-[#00e5ff] text-xl">🚀</span>
              </div>
              <div className="flex items-end gap-3 relative z-10">
                <span className="text-4xl md:text-5xl font-bold text-white">86</span>
                <span className="text-xs text-[#bac9cc] mb-2">/ 100 meta</span>
              </div>
            </div>

            {/* Tarjeta 4 */}
            <div className={`bg-gradient-to-b from-[#1A1C1E] to-[#131314] border border-white/5 rounded-xl p-5 relative overflow-hidden group transition-all duration-700 ease-out delay-[400ms] ${
              startDashboardAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            }`}>
              <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 rounded-full blur-xl -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
              <div className="flex justify-between items-start mb-4 relative z-10">
                <h3 className="text-xs uppercase tracking-wider text-[#bac9cc] font-semibold">Progreso Promedio</h3>
                <span className="text-green-400 text-xl">📉</span>
              </div>
              <div className="flex items-end gap-3 relative z-10">
                <span className="text-4xl md:text-5xl font-bold text-white">-1.2<span className="text-lg font-normal text-[#bac9cc]">kg</span></span>
                <span className="text-xs text-[#bac9cc] mb-2">sem/pac</span>
              </div>
            </div>
          </div>

          {/* 2. AGENDA DEL DÍA */}
          <div className={`md:col-span-12 lg:col-span-4 flex flex-col gap-4 transition-all duration-700 ease-out delay-[500ms] ${
              startDashboardAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}>
            <div className="bg-[#1c1b1c]/80 backdrop-blur-xl border border-white/10 rounded-xl flex flex-col h-[500px]">
              <div className="p-5 border-b border-white/5 flex justify-between items-center">
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <span className="text-[#00daf3]">📅</span> Agenda del Día
                </h3>
                <button className="text-[#bac9cc] hover:text-[#00daf3] transition-colors">•••</button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-3 space-y-4">
                <div className="flex gap-4 p-2 rounded-lg opacity-50">
                  <div className="w-12 text-right pt-1">
                    <span className="text-xs font-mono text-[#bac9cc]">08:00</span>
                  </div>
                  <div className="flex-1 bg-[#1c1b1c] border border-white/5 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="text-xs font-bold text-white">Revisión Inicial</h4>
                      <span className="text-[9px] bg-white/10 px-1 rounded">Completada</span>
                    </div>
                    <p className="text-sm text-[#bac9cc]">Roberto Gómez</p>
                  </div>
                </div>

                <div 
                  onClick={() => navigate('/patient')}
                  className="flex gap-4 p-2 rounded-lg bg-[#00daf3]/5 border border-[#00daf3]/20 cursor-pointer hover:bg-[#00daf3]/10 transition-all"
                >
                  <div className="w-12 text-right pt-1">
                    <span className="text-xs font-mono text-[#00daf3] font-bold">09:30</span>
                  </div>
                  <div className="flex-1 bg-[#1A1C1E] rounded-lg p-3 border border-[#00daf3]/10 shadow-[0_0_15px_rgba(0,218,243,0.05)]">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="text-xs font-bold text-[#00daf3]">Ajuste de Macros</h4>
                      <span className="text-[9px] bg-[#00daf3]/20 text-[#00daf3] px-1 rounded animate-pulse">Ahora</span>
                    </div>
                    <p className="text-sm font-bold text-white">Ana Martínez</p>
                    <p className="text-[11px] text-[#bac9cc] mt-1">📍 Clínica Central</p>
                  </div>
                </div>

                <div className="flex gap-4 p-2 rounded-lg">
                  <div className="w-12 text-right pt-1">
                    <span className="text-xs font-mono text-[#bac9cc]">11:00</span>
                  </div>
                  <div className="flex-1 bg-[#1c1b1c] border border-white/5 rounded-lg p-3">
                    <h4 className="text-xs font-bold text-white">Entrega de Plan</h4>
                    <p className="text-sm text-[#bac9cc]">Carlos Ruiz</p>
                    <span className="text-[9px] bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded mt-2 inline-block">Alta Prioridad</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. GRÁFICA Y RANKINGS */}
          <div className={`md:col-span-12 lg:col-span-8 flex flex-col gap-6 transition-all duration-700 ease-out delay-[600ms] ${
              startDashboardAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}>
            <div className="bg-[#1c1b1c]/80 backdrop-blur-xl border border-white/10 rounded-xl p-6 h-[260px] flex flex-col relative overflow-hidden">
              <div className="flex justify-between items-center mb-4 z-10">
                <div>
                  <h3 className="text-base font-semibold text-white">Evolución Global de Peso</h3>
                  <p className="text-xs text-[#bac9cc] mt-0.5">Promedio de pérdida vs. Objetivo de la cartera</p>
                </div>
                <select className="bg-[#201f20] border border-white/10 rounded text-xs text-[#bac9cc] py-1 px-2 focus:ring-1 focus:ring-[#00daf3] outline-none cursor-pointer">
                  <option>Últimos 6 meses</option>
                  <option>Este Año</option>
                </select>
              </div>

              <div className="flex-1 relative w-full mt-2 z-10 border-l border-b border-white/10">
                <svg className="absolute inset-0 w-full h-full pb-2" preserveAspectRatio="none" viewBox="0 0 100 100">
                  <path d="M0,30 Q20,20 40,45 T80,75 T100,60 L100,100 L0,100 Z" fill="rgba(0, 218, 243, 0.03)"></path>
                  <line x1="0" y1="65" x2="100" y2="65" stroke="#ffb4aa" strokeDasharray="3" strokeWidth="0.5" />
                  <path d="M0,30 Q20,20 40,45 T80,75 T100,60" fill="none" stroke="#00daf3" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="100" cy="60" r="2.5" fill="#00daf3" />
                </svg>
                <span className="absolute right-2 top-[58%] text-[9px] text-[#ffb4aa] font-mono">Meta Global</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[216px]">
              <div className="bg-gradient-to-b from-[#1A1C1E] to-[#131314] border border-white/5 rounded-xl p-5 flex flex-col">
                <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                  <span className="text-[#00daf3]">⭐</span> Top Cumplimiento
                </h3>
                <div className="flex-1 flex flex-col justify-center gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#e5e2e3]">Miguel Ángel T.</span>
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-[#00daf3] w-[98%]"></div>
                      </div>
                      <span className="text-xs font-mono text-[#00daf3]">98%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#e5e2e3]">Sofía R.</span>
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-[#00daf3]/80 w-[94%]"></div>
                      </div>
                      <span className="text-xs font-mono text-[#bac9cc]">94%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-b from-[#1A1C1E] to-[#131314] border border-red-500/20 rounded-xl p-5 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <span className="text-red-400">⚠️</span> En Riesgo
                  </h3>
                  <span className="text-[9px] bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded border border-red-500/20">Atención</span>
                </div>
                <div className="flex-1 flex flex-col justify-center gap-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white">Laura M.</p>
                      <p className="text-[10px] text-[#bac9cc]">Ausente 2 semanas</p>
                    </div>
                    <button className="px-2 py-1 bg-white/5 rounded text-xs hover:bg-red-500/20 hover:text-red-400 transition-colors">Revisar</button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white">Diego F.</p>
                      <p className="text-[10px] text-[#bac9cc]">Estancamiento peso</p>
                    </div>
                    <button className="px-2 py-1 bg-white/5 rounded text-xs hover:bg-white/10 transition-colors">Revisar</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* ==================== FOOTER INTEGRADO ==================== */}
        <footer className={`bg-[#131313]/80 backdrop-blur-3xl border-t border-white/10 py-12 mt-12 w-full transition-all duration-1000 ease-out delay-[800ms] ${
          startDashboardAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
        }`}>
          <div className="max-w-[1440px] mx-auto px-6 md:px-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
              
              {/* Brand Section */}
              <div className="flex flex-col gap-4">
                <span className="font-bold tracking-tighter text-white uppercase text-lg">TITAN PERFORMANCE</span>
                <p className="text-xs text-[#b9cacb] max-w-xs leading-relaxed">
                  Surgical precision for elite performance. The ultimate platform for professional athletic coaching and biometric optimization.
                </p>
                <div className="flex gap-4 mt-2">
                  <a href="#" className="text-[#b9cacb] hover:text-[#00dbe7] transition-colors">🌐</a>
                  <a href="#" className="text-[#b9cacb] hover:text-[#00dbe7] transition-colors">👥</a>
                  <a href="#" className="text-[#b9cacb] hover:text-[#00dbe7] transition-colors">📺</a>
                </div>
              </div>

              {/* Navigation */}
              <div>
                <h4 className="text-xs font-bold text-[#00dbe7] mb-6 tracking-widest uppercase">Navigation</h4>
                <ul className="flex flex-col gap-3">
                  <li><a href="#" className="text-sm text-[#b9cacb] hover:text-white transition-colors">Dashboard</a></li>
                  <li><a href="#" className="text-sm text-[#b9cacb] hover:text-white transition-colors">Patients</a></li>
                  <li><a href="#" className="text-sm text-[#b9cacb] hover:text-white transition-colors">Nutrition</a></li>
                  <li><a href="#" className="text-sm text-[#b9cacb] hover:text-white transition-colors">Training</a></li>
                  <li><a href="#" className="text-sm text-[#b9cacb] hover:text-white transition-colors">Biometrics</a></li>
                  <li><a href="#" className="text-sm text-[#b9cacb] hover:text-white transition-colors">Settings</a></li>
                </ul>
              </div>

              {/* Resources */}
              <div>
                <h4 className="text-xs font-bold text-[#00dbe7] mb-6 tracking-widest uppercase">Resources</h4>
                <ul className="flex flex-col gap-3">
                  <li><a href="#" className="text-sm text-[#b9cacb] hover:text-white transition-colors">Research Lab</a></li>
                  <li><a href="#" className="text-sm text-[#b9cacb] hover:text-white transition-colors">Performance Science</a></li>
                  <li><a href="#" className="text-sm text-[#b9cacb] hover:text-white transition-colors">Clinical Protocols</a></li>
                  <li><a href="#" className="text-sm text-[#b9cacb] hover:text-white transition-colors">Support</a></li>
                </ul>
              </div>

              {/* Legal */}
              <div>
                <h4 className="text-xs font-bold text-[#00dbe7] mb-6 tracking-widest uppercase">Legal</h4>
                <ul className="flex flex-col gap-3">
                  <li><a href="#" className="text-sm text-[#b9cacb] hover:text-white transition-colors">Privacy Policy</a></li>
                  <li><a href="#" className="text-sm text-[#b9cacb] hover:text-white transition-colors">Terms of Service</a></li>
                  <li><a href="#" className="text-sm text-[#b9cacb] hover:text-white transition-colors">Security</a></li>
                  <li><a href="#" className="text-sm text-[#b9cacb] hover:text-white transition-colors">Compliance</a></li>
                </ul>
              </div>
            </div>

            {/* Bottom Info */}
            <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-[10px] text-[#b9cacb] tracking-[0.2em] uppercase text-center md:text-left">
                © 2024 TITAN PERFORMANCE. SURGICAL PRECISION FOR ELITE PERFORMANCE.
              </p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#00dbe7] shadow-[0_0_10px_rgba(0,219,231,0.6)]"></div>
                <span className="text-[10px] font-bold text-[#00dbe7] tracking-wider uppercase">SYSTEMS OPERATIONAL</span>
              </div>
            </div>

          </div>
        </footer>

      </div>
    </>
  );
}
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function TitanTraining() {
  const navigate = useNavigate();

  // Estados interactivos del Panel de Control
  const [activeDay, setActiveDay] = useState('LUNES');
  const [editMode, setEditMode] = useState(true);
  
  // Estados para los inputs editables del protocolo activo
  const [protocolTitle, setProtocolTitle] = useState('Piernas y Transferencia de Potencia');
  const [directive, setDirective] = useState(
    'Enfoque en movimientos concéntricos explosivos. El paciente responde de manera óptima al aumento de volumen del microciclo anterior. Asegurar profundidad en las sentadillas.'
  );

  // Estados de Ejercicios del bloque A
  const [a1, setA1] = useState({ name: 'A1. Sentadilla Trasera con Barra', sets: '3 x 5', intensity: '80% 1RM', tempo: '2-0-X-1', rest: '120s' });
  const [a2, setA2] = useState({ name: 'A2. Saltos de Profundidad a Cajón', sets: '3 x 4', intensity: 'Altura Máx', tempo: 'Explosivo', rest: '90s' });

  const handleDeployPlan = () => {
    const completeTrainingPlan = {
      day: activeDay,
      title: protocolTitle,
      directive: directive,
      exercises: [a1, a2]
    };
    console.log("Desplegando Plan de Entrenamiento:", completeTrainingPlan);
    alert(`¡Protocolo de Entrenamiento [${activeDay}] publicado con éxito!`);
  };

  // Configuración de los días de la semana
  const daysConfig = [
    {
      id: 'LUNES',
      letter: 'L',
      defaultTitle: 'Piernas y Transferencia de Potencia',
      desc: 'Enfoque en movimientos concéntricos explosivos. Levantamiento principal: Sentadillas (3x5 @ 80% 1RM).',
      exercises: '6 EJERCICIOS',
      intensity: 'INTENSIDAD: ALTA',
      isHighIntensity: true
    },
    {
      id: 'MARTES',
      letter: 'M',
      defaultTitle: 'Hipertrofia Tren Superior',
      desc: 'Enfoque en tiempo bajo tensión y acumulación de volumen para musculatura del tren superior.',
      exercises: '8 EJERCICIOS',
      intensity: 'INTENSIDAD: MEDIA',
      isHighIntensity: false
    },
    {
      id: 'MIÉRCOLES',
      letter: 'X',
      defaultTitle: 'Recuperación Activa y Movilidad',
      desc: 'Trabajo cardiovascular de baja intensidad y ejercicios de movilidad para mejorar el flujo sanguíneo.',
      exercises: '4 EJERCICIOS',
      intensity: 'INTENSIDAD: BAJA',
      isHighIntensity: false
    },
    {
      id: 'JUEVES',
      letter: 'J',
      defaultTitle: 'Cadena Posterior y Core',
      desc: 'Variaciones pesadas de peso muerto seguidas de protocolos de estabilización del core.',
      exercises: '7 EJERCICIOS',
      intensity: 'INTENSIDAD: ALTA',
      isHighIntensity: true
    },
    {
      id: 'VIERNES',
      letter: 'V',
      defaultTitle: 'Accesorios Cuerpo Completo',
      desc: 'Abordando puntos débiles, movimientos unilaterales y ejercicios correctivos.',
      exercises: '8 EJERCICIOS',
      intensity: 'INTENSIDAD: MEDIA',
      isHighIntensity: false
    }
  ];

  return (
    <div className="min-h-screen w-full flex bg-[#131313] text-white font-sans antialiased overflow-hidden selection:bg-[#00daf3] selection:text-[#131313] relative">
      
      {/* Inyección de Estilos y Clases (Adaptado a tu theme) */}
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        body { font-family: 'Inter', sans-serif; }
        
        .cyan-glow { box-shadow: 0 0 20px rgba(0, 218, 243, 0.1); border-color: rgba(0, 218, 243, 0.4); }
        .cyan-text-glow { text-shadow: 0 0 10px rgba(0, 218, 243, 0.4); }
        
        .input-ghost { background: transparent; border: 1px solid transparent; transition: all 0.2s; }
        .input-ghost:hover { background: rgba(255,255,255,0.02); border-color: rgba(255,255,255,0.1); }
        .input-ghost:focus { border-color: rgba(0, 218, 243, 0.5); background: rgba(0, 218, 243, 0.05); outline: none; }
        
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0, 218, 243, 0.2); border-radius: 9999px; }
      `}} />

      {/* Contenedor Base */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden pl-20">
        
        {/* SideNavBar Lateral Izquierdo */}
        <aside className="bg-[#1A1C1E] h-screen w-20 flex flex-col fixed left-0 top-0 border-r border-white/5 z-40 items-center py-8">
          <div className="mb-12 cursor-pointer group" onClick={() => navigate('/')}>
            <div className="w-10 h-10 rounded-lg bg-[#1c1b1c] border border-white/10 flex items-center justify-center group-hover:border-[#00daf3] transition-colors relative overflow-hidden">
              <span className="text-xl text-[#00daf3] font-bold">T</span>
            </div>
          </div>
          <nav className="flex-1 flex flex-col gap-6 w-full items-center">
            <button onClick={() => navigate('/dashboard')} className="text-[#bac9cc] p-3 rounded-lg hover:bg-white/5 hover:text-white transition-colors relative group">
              <span className="material-symbols-outlined">dashboard</span>
            </button>
            <button className="text-[#00daf3] bg-[#00daf3]/10 p-3 rounded-lg border-l-2 border-[#00daf3] relative group">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>badge</span>
            </button>
            <button className="text-[#bac9cc] p-3 rounded-lg hover:bg-white/5 transition-colors">
              <span className="material-symbols-outlined">monitoring</span>
            </button>
            <button className="text-[#bac9cc] p-3 rounded-lg hover:bg-white/5 transition-colors">
              <span className="material-symbols-outlined">calendar_month</span>
            </button>
          </nav>
          <div className="mt-auto flex flex-col gap-4 w-full items-center">
            <button className="text-[#bac9cc] p-3 rounded-lg hover:bg-white/5">
              <span className="material-symbols-outlined">settings</span>
            </button>
            <div className="w-10 h-10 rounded-full bg-[#1c1b1c] border border-white/10 overflow-hidden cursor-pointer">
              <img alt="User" className="w-full h-full object-cover" src="https://ui-avatars.com/api/?name=Coach&background=1c1b1c&color=00daf3" />
            </div>
          </div>
        </aside>

        {/* Top Command Bar */}
        <header className="bg-[#131313]/90 backdrop-blur-md border-b border-white/5 h-20 flex items-center justify-between px-8 z-30 shrink-0">
          <div className="flex items-center gap-2 text-[11px] font-bold tracking-widest uppercase">
            <button onClick={() => navigate(-1)} className="text-[#bac9cc] hover:text-white transition-colors">PACIENTES</button>
            <span className="text-white/20 material-symbols-outlined text-sm">chevron_right</span>
            <span className="text-white">ANA MARTÍNEZ</span>
            <span className="text-white/20 material-symbols-outlined text-sm">chevron_right</span>
            <span className="text-[#00daf3]">ACTUALIZAR PLAN</span>
          </div>

          <div className="flex items-center gap-6">
            <button className="text-[11px] font-bold tracking-widest text-[#bac9cc] hover:text-white transition-colors uppercase">
              CANCELAR
            </button>
            <button 
              className="bg-transparent border border-[#00daf3] text-[#00daf3] hover:bg-[#00daf3] hover:text-[#131313] transition-all px-5 py-2 rounded text-[11px] tracking-widest font-bold flex items-center gap-2" 
              onClick={handleDeployPlan}
            >
              <span className="material-symbols-outlined text-[16px]">publish</span>
              PUBLICAR PLAN
            </button>
          </div>
        </header>

        {/* Global Status Bar */}
        <div className="bg-[#1A1C1E] border-b border-white/5 px-8 py-3 flex gap-8 items-center text-sm shrink-0 overflow-x-auto custom-scrollbar">
          <div className="flex items-center gap-2 min-w-max">
            <span className="material-symbols-outlined text-[#00daf3] text-[16px]">sync</span>
            <span className="text-[#bac9cc] text-[11px] font-mono">MACROCICLO:</span>
            <span className="text-white text-[12px] font-mono">Hipertrofia y Potencia (Sem 3/8)</span>
          </div>
          <div className="w-px h-3 bg-white/10"></div>
          <div className="flex items-center gap-2 min-w-max">
            <span className="material-symbols-outlined text-white text-[16px]">timer</span>
            <span className="text-[#bac9cc] text-[11px] font-mono">DURACIÓN PROM.:</span>
            <span className="text-white text-[12px] font-mono">72 min</span>
          </div>
          <div className="w-px h-3 bg-white/10"></div>
          <div className="flex items-center gap-2 min-w-max">
            <span className="material-symbols-outlined text-[#ffb4aa] text-[16px]">warning</span>
            <span className="text-[#bac9cc] text-[11px] font-mono">SESIONES PERDIDAS:</span>
            <span className="text-[#ffb4aa] text-[12px] font-mono">3 (Este Mes)</span>
          </div>
        </div>

        {/* Main Workspace Grid */}
        <main className="flex-1 flex overflow-hidden">
          
          {/* Left Panel: Weekly Architecture Stack */}
          <div className="w-[450px] border-r border-white/5 bg-[#1A1C1E]/30 flex flex-col h-full shrink-0">
            <div className="p-8 pb-4 shrink-0">
              <h2 className="text-2xl text-white font-bold mb-1">Arquitectura Semanal</h2>
              <p className="text-sm text-[#bac9cc]">Selecciona un día para modificar los parámetros.</p>
            </div>
            
            <div className="flex-1 overflow-y-auto px-8 flex flex-col gap-4 pb-20 custom-scrollbar">
              
              {/* Mapeo dinámico de los Días de la Semana */}
              {daysConfig.map((day) => {
                const isActive = activeDay === day.id;
                
                return (
                  <div 
                    key={day.id}
                    onClick={() => {
                      setActiveDay(day.id);
                      setProtocolTitle(day.defaultTitle);
                    }}
                    className={`rounded-xl p-5 cursor-pointer transition-all border ${
                      isActive 
                        ? 'cyan-glow bg-gradient-to-b from-[#1A1C1E] to-[#131313] translate-x-1' 
                        : 'border-white/5 bg-transparent hover:border-white/10 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded flex items-center justify-center font-mono text-xs font-bold border ${
                          isActive 
                            ? 'bg-[#00daf3]/10 text-[#00daf3] border-[#00daf3]/30' 
                            : 'bg-[#1c1b1c] text-[#bac9cc] border-white/10'
                        }`}>
                          {day.letter}
                        </div>
                        <div className={`text-xs font-bold tracking-widest ${
                          isActive 
                            ? 'text-[#00daf3] cyan-text-glow' 
                            : 'text-[#bac9cc]'
                        }`}>
                          {day.id}
                        </div>
                      </div>
                      {isActive && <span className="material-symbols-outlined text-[#00daf3] text-[18px]">edit_square</span>}
                    </div>
                    
                    <h3 className={`text-lg font-semibold mb-2 ${isActive ? 'text-white' : 'text-[#bac9cc]'}`}>
                      {isActive ? protocolTitle : day.defaultTitle}
                    </h3>
                    
                    {isActive && (
                      <p className="text-sm text-[#bac9cc] line-clamp-2 mb-4">{day.desc}</p>
                    )}
                    
                    <div className={`flex gap-2 ${!isActive ? 'mt-3' : ''}`}>
                      <span className="bg-[#1A1C1E] border border-white/5 rounded px-2.5 py-1 font-mono text-[10px] text-[#bac9cc]">
                        {day.exercises}
                      </span>
                      <span className={`rounded px-2.5 py-1 font-mono text-[10px] border ${
                        isActive && day.isHighIntensity
                          ? 'bg-[#00daf3]/10 border-[#00daf3]/20 text-[#00daf3]'
                          : 'bg-[#1A1C1E] border-white/5 text-[#bac9cc]'
                      }`}>
                        {day.intensity}
                      </span>
                    </div>
                  </div>
                );
              })}

            </div>
          </div>

          {/* Right Panel: Active Day Editor */}
          <div className="flex-1 bg-[#131313] flex flex-col h-full overflow-hidden relative">

            <div className="p-10 flex-1 overflow-y-auto relative z-10 custom-scrollbar max-w-4xl">
              {/* Day Header */}
              <div className="flex justify-between items-start mb-8">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="w-2 h-2 rounded-full bg-[#00daf3] shadow-[0_0_10px_rgba(0,218,243,0.6)]"></span>
                    <span className="text-[#00daf3] tracking-widest text-xs font-bold font-mono">EDITOR DE PROTOCOLO: {activeDay}</span>
                  </div>
                  <input 
                    className="input-ghost w-full font-bold text-3xl text-white mb-2 p-1 -ml-1 rounded" 
                    type="text" 
                    value={protocolTitle}
                    onChange={(e) => setProtocolTitle(e.target.value)}
                  />
                </div>
                
                {/* Switch Modo Edición */}
                <div className="flex items-center gap-3 bg-[#1A1C1E] px-3 py-2 rounded-lg border border-white/5">
                  <span className="text-[10px] text-[#bac9cc] font-bold tracking-widest">MODO EDICIÓN</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={editMode} onChange={() => setEditMode(!editMode)} className="sr-only peer" />
                    <div className="w-8 h-4 bg-[#1c1b1c] rounded-full peer border border-white/10 peer-checked:border-[#00daf3]/50 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#00daf3]"></div>
                  </label>
                </div>
              </div>

              {/* Focus Directives */}
              <div className="bg-[#1A1C1E] rounded-lg p-5 mb-8 border-l-2 border-l-[#00daf3] border border-white/5 border-l-solid">
                <h4 className="text-[10px] font-bold text-[#bac9cc] mb-2 tracking-wider">DIRECTRIZ DEL ENTRENADOR</h4>
                <textarea 
                  className="input-ghost w-full text-sm text-white resize-none h-16 p-1 rounded font-mono"
                  value={directive}
                  onChange={(e) => setDirective(e.target.value)}
                />
              </div>

              {/* Exercise Blocks */}
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white">Bloque A: Potencia Principal</h3>
                </div>

                {/* Exercise Item 1 */}
                <div className="bg-[#1A1C1E] border border-white/5 rounded-xl p-5 group hover:border-[#00daf3]/30 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="text-[#bac9cc] pt-1 cursor-grab"><span className="material-symbols-outlined">drag_indicator</span></div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-4">
                        <input className="input-ghost font-semibold text-lg text-white w-2/3 p-1 -ml-1 rounded" type="text" value={a1.name} onChange={(e) => setA1({...a1, name: e.target.value})} />
                        <button className="text-[#bac9cc] hover:text-[#ffb4aa] transition-colors"><span className="material-symbols-outlined text-sm">delete</span></button>
                      </div>
                      <div className="grid grid-cols-4 gap-4">
                        <div>
                          <label className="text-[10px] text-[#bac9cc] block mb-1.5 tracking-wider font-bold">SERIES x REPS</label>
                          <input className="input-ghost w-full bg-[#131313] border border-white/10 rounded px-3 py-2 font-mono text-sm text-center text-white" type="text" value={a1.sets} onChange={(e) => setA1({...a1, sets: e.target.value})} />
                        </div>
                        <div>
                          <label className="text-[10px] text-[#bac9cc] block mb-1.5 tracking-wider font-bold">INTENSIDAD</label>
                          <input className="input-ghost w-full bg-[#131313] border border-white/10 rounded px-3 py-2 font-mono text-sm text-center text-white" type="text" value={a1.intensity} onChange={(e) => setA1({...a1, intensity: e.target.value})} />
                        </div>
                        <div>
                          <label className="text-[10px] text-[#bac9cc] block mb-1.5 tracking-wider font-bold">TEMPO</label>
                          <input className="input-ghost w-full bg-[#131313] border border-white/10 rounded px-3 py-2 font-mono text-sm text-center text-white" type="text" value={a1.tempo} onChange={(e) => setA1({...a1, tempo: e.target.value})} />
                        </div>
                        <div>
                          <label className="text-[10px] text-[#bac9cc] block mb-1.5 tracking-wider font-bold">DESCANSO</label>
                          <input className="input-ghost w-full bg-[#131313] border border-white/10 rounded px-3 py-2 font-mono text-sm text-center text-white" type="text" value={a1.rest} onChange={(e) => setA1({...a1, rest: e.target.value})} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Exercise Item 2 */}
                <div className="bg-[#1A1C1E] border border-white/5 rounded-xl p-5 group hover:border-[#00daf3]/30 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="text-[#bac9cc] pt-1 cursor-grab"><span className="material-symbols-outlined">drag_indicator</span></div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-4">
                        <input className="input-ghost font-semibold text-lg text-white w-2/3 p-1 -ml-1 rounded" type="text" value={a2.name} onChange={(e) => setA2({...a2, name: e.target.value})} />
                        <button className="text-[#bac9cc] hover:text-[#ffb4aa] transition-colors"><span className="material-symbols-outlined text-sm">delete</span></button>
                      </div>
                      <div className="grid grid-cols-4 gap-4">
                        <div>
                          <label className="text-[10px] text-[#bac9cc] block mb-1.5 tracking-wider font-bold">SERIES x REPS</label>
                          <input className="input-ghost w-full bg-[#131313] border border-white/10 rounded px-3 py-2 font-mono text-sm text-center text-white" type="text" value={a2.sets} onChange={(e) => setA2({...a2, sets: e.target.value})} />
                        </div>
                        <div>
                          <label className="text-[10px] text-[#bac9cc] block mb-1.5 tracking-wider font-bold">INTENSIDAD</label>
                          <input className="input-ghost w-full bg-[#131313] border border-white/10 rounded px-3 py-2 font-mono text-sm text-center text-white" type="text" value={a2.intensity} onChange={(e) => setA2({...a2, intensity: e.target.value})} />
                        </div>
                        <div>
                          <label className="text-[10px] text-[#bac9cc] block mb-1.5 tracking-wider font-bold">TEMPO</label>
                          <input className="input-ghost w-full bg-[#131313] border border-white/10 rounded px-3 py-2 font-mono text-sm text-center text-white" type="text" value={a2.tempo} onChange={(e) => setA2({...a2, tempo: e.target.value})} />
                        </div>
                        <div>
                          <label className="text-[10px] text-[#bac9cc] block mb-1.5 tracking-wider font-bold">DESCANSO</label>
                          <input className="input-ghost w-full bg-[#131313] border border-white/10 rounded px-3 py-2 font-mono text-sm text-center text-white" type="text" value={a2.rest} onChange={(e) => setA2({...a2, rest: e.target.value})} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Add Block Placeholder */}
                <div className="border border-dashed border-white/10 rounded-xl p-4 mt-6 flex justify-center items-center gap-2 text-[#bac9cc] hover:text-[#00daf3] hover:border-[#00daf3]/50 hover:bg-[#00daf3]/5 transition-all cursor-pointer">
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  <span className="text-[11px] tracking-widest font-bold uppercase">AÑADIR NUEVO BLOQUE</span>
                </div>
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
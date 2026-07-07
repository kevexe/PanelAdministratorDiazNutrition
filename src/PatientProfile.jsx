import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function TitanPatientAnalysis() {
  const navigate = useNavigate();
  return (
    <div className="bg-[#060b0c] text-[#e2eded] flex h-screen overflow-hidden antialiased selection:bg-cyan-400 selection:text-cyan-950 font-['Inter',_sans-serif] relative">
      
      {/* Resplandor de fondo reflejado en el CSS original */}
      <div 
        className="absolute inset-0 pointer-events-none z-0" 
        style={{
          background: 'radial-gradient(50% 40% at 60% 0%, rgba(0, 242, 255, 0.05) 0%, rgba(6, 11, 12, 0) 100%)'
        }}
      />

      {/* SideNavBar Component (ESTRUCTURA ORIGINAL CONSERVADA) */}
      <nav className="bg-[#091011] h-screen w-72 flex-col fixed left-0 top-0 border-r border-[#223437] backdrop-blur-xl flex py-10 z-40">
        <div className="px-6 mb-8 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#00f2ff] flex items-center justify-center text-[#00363a] font-serif text-2xl font-medium">T</div>
            <div>
              <h1 className="font-serif text-2xl text-[#00f2ff] tracking-tighter leading-none">TITAN</h1>
              <p className="text-[11px] tracking-widest font-semibold uppercase text-[#8fa3a6]">PERFORMANCE</p>
            </div>
          </div>
          <button className="w-full mt-6 py-3 px-4 bg-transparent border border-[#223437] rounded hover:bg-[#142224]/50 hover:text-[#e2eded] transition-colors text-[11px] font-semibold tracking-wider text-[#00f2ff]" style={{ boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.06)' }}>
            + NEW PATIENT
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto mt-4">
          <div className="flex flex-col gap-1">
            <a className="text-[#8fa3a6] px-6 py-4 flex items-center gap-4 transition-colors duration-200 hover:bg-[#142224]/50 hover:text-[#e2eded] text-sm" href="#">
              <span className="material-symbols-outlined">dashboard</span>
              Dashboard
            </a>
            <a className="text-[#8fa3a6] px-6 py-4 flex items-center gap-4 transition-colors duration-200 hover:bg-[#142224]/50 hover:text-[#e2eded] text-sm" href="#">
              <span className="material-symbols-outlined">person_search</span>
              Patient Search
            </a>
            <a className="text-[#00f2ff] bg-[#e1fdff]/10 border-l-2 border-[#00f2ff] px-6 py-4 flex items-center gap-4 text-sm font-medium" href="#">
              <span className="material-symbols-outlined">group</span>
              Active Roster
            </a>
            <a className="text-[#8fa3a6] px-6 py-4 flex items-center gap-4 transition-colors duration-200 hover:bg-[#142224]/50 hover:text-[#e2eded] text-sm" href="#">
              <span className="material-symbols-outlined">analytics</span>
              Clinical Insights
            </a>
            <a className="text-[#8fa3a6] px-6 py-4 flex items-center gap-4 transition-colors duration-200 hover:bg-[#142224]/50 hover:text-[#e2eded] text-sm" href="#">
              <span className="material-symbols-outlined">settings</span>
              Settings
            </a>
          </div>
        </div>

        <div className="mt-auto px-6 pt-6 border-t border-[#223437]/30 flex flex-col gap-1">
          <a className="text-[#8fa3a6] px-2 py-3 flex items-center gap-4 transition-colors duration-200 hover:bg-[#142224]/50 hover:text-[#e2eded] text-sm rounded" href="#">
            <span className="material-symbols-outlined">help</span>
            Support
          </a>
          <a className="text-[#8fa3a6] px-2 py-3 flex items-center gap-4 transition-colors duration-200 hover:bg-[#142224]/50 hover:text-[#e2eded] text-sm rounded" href="#">
            <span className="material-symbols-outlined">account_circle</span>
            Account
          </a>
        </div>
      </nav>

      {/* Main Content Area (ESTRUCTURA ORIGINAL CONSERVADA) */}
      <div className="flex-1 ml-72 flex flex-col h-screen overflow-hidden z-10">
        
        {/* TopAppBar Component */}
        <header className="bg-[#091011]/40 top-0 sticky z-50 border-b border-[#223437] backdrop-blur-xl flex justify-between items-center h-20 px-8">
          <div className="flex items-center gap-6">
            <div className="relative w-64">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#8fa3a6] text-sm">search</span>
              <input className="w-full bg-[#142224]/30 border border-[#223437] rounded-md py-2 pl-9 pr-3 text-sm text-[#e2eded] focus:outline-none focus:border-[#00f2ff] focus:ring-1 focus:ring-[#00f2ff] transition-all" placeholder="Search..." type="text"/>
            </div>
            <div className="flex gap-6 h-full items-center">
              <a className="text-[#00f2ff] border-b-2 border-[#00f2ff] pb-1 text-sm h-full flex items-center" href="#">Ana M.</a>
              <a className="text-[#8fa3a6] text-sm hover:text-[#00f2ff] transition-colors h-full flex items-center" href="#">Carlos R.</a>
              <a className="text-[#8fa3a6] text-sm hover:text-[#00f2ff] transition-colors h-full flex items-center" href="#">Laura M.</a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-[#8fa3a6] hover:text-[#00f2ff] transition-colors">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button class="text-[#8fa3a6] hover:text-[#00f2ff] transition-colors">
              <span className="material-symbols-outlined">history</span>
            </button>
           <button 
              onClick={() => navigate('/actualizar-plan')} // <- Agrega esto (ajusta la ruta según tus Routes)
              className="bg-[#00f2ff] text-[#002022] font-bold tracking-wider shadow-[0_0_15px_rgba(0,242,255,0.3)] hover:brightness-110 px-6 py-2 rounded text-[11px] transition-all" 
              style={{ boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.06)' }}
            >
              ACTUALIZAR PLAN
           </button>
          </div>
        </header>

        {/* Canvas */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-[1600px] mx-auto grid grid-cols-12 gap-4">
            
            {/* Patient Profile Header */}
            <div className="col-span-12 rounded-xl p-6 mb-2 flex flex-col md:flex-row items-start md:items-center gap-8 relative overflow-hidden border border-white/5" style={{ background: 'rgba(13, 22, 24, 0.7)', backdropFilter: 'blur(20px)' }}>
              <div className="absolute -top-24 -left-24 w-64 h-64 bg-[#00f2ff]/5 rounded-full blur-3xl pointer-events-none"></div>
              <div className="flex items-center gap-6 z-10 relative">
                <img alt="Ana Martinez" className="w-24 h-24 rounded-full object-cover border-2 border-[#00f2ff] shadow-[0_0_20px_rgba(0,242,255,0.2)]" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBIKjH9JTxdyFaYTHPVXZ3IRvEi2YOPxRL9I44xhW9afbCGFHRr_k1UHGK_V0spFy3P0Z0uoVFcHNVwLWQAY_G4vwpYm5zEEF2tlGWNxuNlTJDepbhU8o8EqDKHygWq3zDU8d8eps5y7zR1h81cnSTODuonbnwDdIaj5fvIFqCmN1dPYSucwZP5p6RGxLuhuEE6fCigDpYr_r0ZTVNOhTiy7fhcxungUnKSM0DkRCe6y6v6kCe0DhEMwFCMBxnUlMinAUeLVm89Ir9o"/>
                <div>
                  <h2 className="font-serif text-3xl text-white mb-1 tracking-wide font-semibold">Ana Martínez</h2>
                  <div className="flex gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded bg-[#142224] border border-[#223437] text-[11px] font-semibold text-[#8fa3a6] flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#34d399]"></span> ACTIVE</span>
                    <span className="px-2 py-0.5 rounded bg-[#142224] border border-[#223437] text-[11px] font-semibold text-[#00f2ff]">ELITE TRIATHLETE</span>
                  </div>
                </div>
              </div>
              <div className="flex-1 flex flex-wrap gap-x-8 gap-y-4 justify-end z-10 relative">
                <div className="flex flex-col">
                  <span className="text-[11px] font-semibold text-[#8fa3a6]">AGE</span>
                  <span className="text-lg text-[#e2eded] font-medium">28</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-semibold text-[#8fa3a6]">WEIGHT</span>
                  <span className="text-lg text-[#e2eded] font-medium">62.4 <span className="text-xs text-[#8fa3a6]">kg</span></span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-semibold text-[#8fa3a6]">HEIGHT</span>
                  <span className="text-lg text-[#e2eded] font-medium">172 <span className="text-xs text-[#8fa3a6]">cm</span></span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-semibold text-[#8fa3a6]">START DATE</span>
                  <span className="text-lg text-[#e2eded] font-medium">Oct 12, 2023</span>
                </div>
                <div className="flex flex-col border-l border-[#223437]/50 pl-6">
                  <span className="text-[11px] font-semibold text-[#8fa3a6]">PRIMARY GOAL</span>
                  <span className="text-sm text-[#00f2ff] font-medium">Ironman Prep Phase 2</span>
                </div>
              </div>
            </div>

            {/* Executive Summary */}
            <div className="col-span-12 rounded-xl p-6 mb-4 border border-white/5 border-l-4 border-l-[#00f2ff]" style={{ background: 'rgba(13, 22, 24, 0.7)', backdropFilter: 'blur(20px)', boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.06)' }}>
              <div className="flex gap-4 items-start">
                <span className="material-symbols-outlined text-[#00f2ff] mt-1" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                <div>
                  <h3 className="text-[11px] font-semibold text-[#8fa3a6] mb-2 tracking-wider">TITAN AI SUMMARY</h3>
                  <p className="font-serif text-2xl text-[#e2eded] leading-relaxed tracking-wide">
                    Paciente con <span className="text-[#00f2ff] font-bold">91% de adherencia</span>. Ha perdido <span class="text-[#00f2ff] font-bold">8.4 kg</span> en 12 semanas. Recuperación muscular óptima post-ciclo. Ligera fatiga en cadena posterior detectada.
                  </p>
                </div>
              </div>
            </div>

            {/* Three Column Layout (POSICIONAMIENTO ORIGINAL ASIGNADO POR TI) */}
            {/* Left Column: Body Comp & Metrics */}
            <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
              <div className="rounded-xl p-5 border border-white/5" style={{ background: 'rgba(13, 22, 24, 0.7)', backdropFilter: 'blur(20px)' }}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-[11px] font-semibold text-[#8fa3a6] tracking-widest">BODY COMPOSITION</h3>
                  <button className="text-[#00f2ff] hover:text-[#e1fdff] transition-colors"><span className="material-symbols-outlined text-sm">open_in_full</span></button>
                </div>
                <div className="space-y-4">
                  {/* Metric Item */}
                  <div className="group">
                    <div className="flex justify-between items-end mb-1">
                      <span className="text-sm text-[#e2eded]">Masa Grasa</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[#8fa3a6] line-through">18.5%</span>
                        <span className="text-lg text-[#00f2ff] font-medium">14.2%</span>
                      </div>
                    </div>
                    <div className="w-full bg-[#142224]/40 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-[#00f2ff] h-full" style={{ width: '76%' }}></div>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-[9px] font-semibold text-[#34d399] flex items-center gap-0.5"><span className="material-symbols-outlined" style={{ fontSize: '10px' }}>arrow_downward</span> 4.3%</span>
                      <span className="text-[9px] font-semibold text-[#8fa3a6]">Target: 12%</span>
                    </div>
                  </div>
                  {/* Metric Item */}
                  <div className="group">
                    <div className="flex justify-between items-end mb-1">
                      <span className="text-sm text-[#e2eded]">Masa Muscular</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[#8fa3a6] line-through">42.1kg</span>
                        <span className="text-lg text-[#00f2ff] font-medium">44.8kg</span>
                      </div>
                    </div>
                    <div className="w-full bg-[#142224]/40 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-[#00f2ff] h-full" style={{ width: '85%' }}></div>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-[9px] font-semibold text-[#34d399] flex items-center gap-0.5"><span className="material-symbols-outlined" style={{ fontSize: '10px' }}>arrow_upward</span> 2.7kg</span>
                      <span className="text-[9px] font-semibold text-[#8fa3a6]">Target: 46kg</span>
                    </div>
                  </div>
                  {/* Metric Item */}
                  <div className="group">
                    <div className="flex justify-between items-end mb-1">
                      <span className="text-sm text-[#e2eded]">Edad Metabolica</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[#8fa3a6] line-through">29</span>
                        <span className="text-lg text-[#00f2ff] font-medium">24</span>
                      </div>
                    </div>
                    <div className="w-full bg-[#142224]/40 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-[#34d399] h-full" style={{ width: '90%' }}></div>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-[9px] font-semibold text-[#34d399] flex items-center gap-0.5"><span className="material-symbols-outlined" style={{ fontSize: '10px' }}>arrow_downward</span> 5 yrs</span>
                      <span className="text-[9px] font-semibold text-[#8fa3a6]">Optimal</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="rounded-xl p-5 flex-1 border border-white/5" style={{ background: 'rgba(13, 22, 24, 0.7)', backdropFilter: 'blur(20px)' }}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-[11px] font-semibold text-[#8fa3a6] tracking-widest">ALERTS & RISKS</h3>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="bg-[#142224]/20 border border-[#f59e0b]/20 rounded p-3 flex gap-3 items-start">
                    <span className="material-symbols-outlined text-[#f59e0b]" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
                    <div>
                      <h4 className="text-sm text-[#e2eded] font-medium">Riesgo de Sobrentrenamiento</h4>
                      <p className="text-[11px] text-[#8fa3a6] mt-1 normal-case tracking-normal">HRV ha bajado un 15% en los últimos 3 días.</p>
                    </div>
                  </div>
                  <div className="bg-[#142224]/20 border border-[#34d399]/20 rounded p-3 flex gap-3 items-start">
                    <span className="material-symbols-outlined text-[#34d399]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    <div>
                      <h4 class="text-sm text-[#e2eded] font-medium">Adherencia Dietética</h4>
                      <p className="text-[11px] text-[#8fa3a6] mt-1 normal-case tracking-normal">Consumo de macronutrientes en rango óptimo.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Center Column: 3D Anatomy */}
            <div className="col-span-12 lg:col-span-4 relative flex items-center justify-center min-h-[500px] rounded-xl overflow-hidden group border border-white/5" style={{ background: 'rgba(13, 22, 24, 0.7)', backdropFilter: 'blur(20px)' }}>
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(0,242,255,0.04),_transparent_70%)] pointer-events-none z-0"></div>
              
              <div className="absolute top-4 left-4 z-10">
                <span className="text-[11px] font-semibold text-[#00f2ff] border border-[#00f2ff]/30 px-2 py-1 rounded bg-[#091011]/80 backdrop-blur">ANTERIOR VIEW</span>
              </div>
              
              <div className="absolute top-1/3 left-1/4 z-10 flex items-center gap-2 group-hover:translate-x-1 transition-transform">
                <div className="w-1.5 h-1.5 rounded-full bg-[#f59e0b] shadow-[0_0_8px_#f59e0b]"></div>
                <div className="h-[1px] w-8 bg-[#f59e0b]/50"></div>
                <div className="bg-[#091011]/90 border border-[#f59e0b]/20 px-2 py-1 rounded text-[10px] text-[#e2eded]">Deltoide Ant. (Fatiga)</div>
              </div>
              
              <div className="absolute bottom-1/3 right-1/4 z-10 flex items-center gap-2 flex-row-reverse group-hover:-translate-x-1 transition-transform">
                <div className="w-1.5 h-1.5 rounded-full bg-[#00f2ff] shadow-[0_0_8px_#00f2ff]"></div>
                <div className="h-[1px] w-8 bg-[#00f2ff]/50"></div>
                <div className="bg-[#091011]/90 border border-[#00f2ff]/20 px-2 py-1 rounded text-[10px] text-[#e2eded]">Cuádriceps (Óptimo)</div>
              </div>
              
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10 bg-[#142224]/80 backdrop-blur rounded-full p-1 border border-[#223437]/50">
                <button className="w-8 h-8 rounded-full flex items-center justify-center text-[#8fa3a6] hover:text-[#e1fdff] hover:bg-[#091011] transition-colors"><span className="material-symbols-outlined text-sm">360</span></button>
                <button className="w-8 h-8 rounded-full flex items-center justify-center text-[#00f2ff] bg-[#091011] transition-colors"><span className="material-symbols-outlined text-sm">front_hand</span></button>
                <button className="w-8 h-8 rounded-full flex items-center justify-center text-[#8fa3a6] hover:text-[#e1fdff] hover:bg-[#091011] transition-colors"><span className="material-symbols-outlined text-sm">accessibility_new</span></button>
              </div>
            </div>

            {/* Right Column: Heatmaps & Compliance */}
            <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
              
              {/* Diet Compliance Heatmap */}
              <div className="rounded-xl p-5 border border white/5" style={{ background: 'rgba(13, 22, 24, 0.7)', backdropFilter: 'blur(20px)' }}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-[11px] font-semibold text-[#8fa3a6] tracking-widest">DIET COMPLIANCE (LAST 30D)</h3>
                  <span className="text-sm font-medium text-[#00f2ff]">94%</span>
                </div>
                
                {/* Reemplazo de document.write por mapeo limpio de React */}
                <div className="grid grid-cols-7 gap-1.5">
                  {Array.from({ length: 28 }).map((_, i) => {
                    let colorClass = "bg-[#112422] border border-[#1b3d39]"; 
                    if(i === 12 || i === 18) colorClass = "bg-[#2d220f] border border-[#4a3819]"; 
                    if(i === 5) colorClass = "bg-[#2b1616] border border-[#4d2525]"; 
                    if(i >= 24) colorClass = "bg-[#00f2ff] border border-[#00f2ff] shadow-[0_0_8px_rgba(0,242,255,0.4)]"; 
                    
                    return (
                      <div 
                        key={i} 
                        className={`aspect-square rounded-[4px] ${colorClass} hover:border-white/50 transition-colors cursor-pointer`} 
                        title={`Day ${i+1}`}
                      />
                    );
                  })}
                </div>
                
                <div className="flex justify-between mt-3 px-1">
                  <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-[#2b1616] border border-[#4d2525]"></div><span className="text-[9px] font-semibold text-[#8fa3a6]">FAIL</span></div>
                  <div className="flex items-center gap-1"><div class="w-2 h-2 rounded-sm bg-[#2d220f] border border-[#4a3819]"></div><span className="text-[9px] font-semibold text-[#8fa3a6]">PARTIAL</span></div>
                  <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-[#112422] border border-[#1b3d39]"></div><span className="text-[9px] font-semibold text-[#8fa3a6]">OPTIMAL</span></div>
                </div>
              </div>
              
              {/* Cardio/Training Metrics */}
              <div className="rounded-xl p-5 flex-1 border border-white/5" style={{ background: 'rgba(13, 22, 24, 0.7)', backdropFilter: 'blur(20px)' }}>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-[11px] font-semibold text-[#8fa3a6] tracking-widest">TRAINING LOAD</h3>
                </div>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 flex-shrink-0">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="3"></path>
                        <path className="drop-shadow-[0_0_4px_rgba(0,242,255,0.4)]" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#00f2ff" strokeDasharray="85, 100" strokeWidth="3"></path>
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-xs text-[#e2eded] font-bold">85<span className="text-[8px]">%</span></span>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm text-[#e2eded]">Volumen Semanal</h4>
                      <p className="text-xs text-[#8fa3a6] mt-1">12.4h / 14.5h Target</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#142224]/20 rounded p-3 border border-[#223437]/20">
                      <span className="material-symbols-outlined text-[#00f2ff] text-sm mb-1">directions_run</span>
                      <div className="text-lg text-[#e2eded] mb-0.5 font-medium">42.5 <span className="text-xs text-[#8fa3a6]">km</span></div>
                      <div className="text-[9px] font-semibold text-[#8fa3a6]">DISTANCE (WEEK)</div>
                    </div>
                    <div className="bg-[#142224]/20 rounded p-3 border border-[#223437]/20">
                      <span className="material-symbols-outlined text-[#00f2ff] text-sm mb-1">local_fire_department</span>
                      <div className="text-lg text-[#e2eded] mb-0.5 font-medium">8,450 <span className="text-xs text-[#8fa3a6]">kcal</span></div>
                      <div className="text-[9px] font-semibold text-[#8fa3a6]">BURNED (WEEK)</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>

    </div>
  );
}
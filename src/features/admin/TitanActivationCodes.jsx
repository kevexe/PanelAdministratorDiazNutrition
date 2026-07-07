import React, { useState } from "react";

export default function TitanActivationCodes() {
  const [isInspectorOpen, setIsInspectorOpen] = useState(true);
  const [selectedCode, setSelectedCode] = useState({
    code: "PRM-8F3K9P",
    type: "Premium",
    status: "Disponible",
    created: "24 Oct, 09:30",
    expires: "24 Nov, 09:30",
    history: [
      { action: "Generado por Admin", time: "24 Oct, 09:30 AM", current: true },
      { action: "Esperando Activación", time: "-", current: false }
    ]
  });

  const codesData = [
    { id: 1, code: "PRM-8F3K9P", type: "Premium", status: "Disponible", created: "24 Oct, 09:30", patient: "-" },
    { id: 2, code: "ONL-X2M4B1", type: "Online", status: "Usado", created: "20 Oct, 14:15", patient: "David Miller" },
    { id: 3, code: "PRE-99Z1LQ", type: "Presencial", status: "Expirado", created: "01 Sep, 10:00", patient: "-" },
    { id: 4, code: "PRM-7T2W8N", type: "Premium", status: "Disponible", created: "24 Oct, 09:30", patient: "-" },
  ];

  return (
    <main className="p-6 md:p-10 space-y-8 relative max-w-[1600px] mx-auto">
      {/* Abstract Background Light Bloom */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#00daf3]/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-white/5 pb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            Gestión de Códigos de Activación
          </h2>
          <p className="text-xs text-[#bac9cc] mt-1">
            Administra aprovisionamientos, realiza seguimiento de uso y monitorea accesos de manera segura.
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#201f20] border border-white/10 rounded-lg text-xs font-semibold text-[#bac9cc] hover:text-[#00daf3] hover:border-[#00daf3]/30 transition-all">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16v1a3 3 0 003 3h12a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Exportar Lista
        </button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: "Total Generados", value: "12,408", color: "text-[#00daf3]" },
          { label: "Activos", value: "3,842", color: "text-emerald-400" },
          { label: "Usados", value: "8,105", color: "text-[#bac9cc]" },
          { label: "Expirados", value: "461", color: "text-red-400" },
          { label: "Vinculados Mes", value: "428", color: "text-[#00daf3]", extra: "+12%" },
          { label: "Act. Semanales", value: "112", color: "text-[#00daf3]" },
        ].map((kpi, idx) => (
          <div key={idx} className="bg-[#201f20]/60 backdrop-blur-md p-4 rounded-xl border border-white/5 relative overflow-hidden group">
            <span className="text-[10px] uppercase tracking-wider text-[#bac9cc] block mb-2">{kpi.label}</span>
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-black ${kpi.color}`}>{kpi.value}</span>
              {kpi.extra && <span className="text-[10px] font-mono text-emerald-400">{kpi.extra}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Code Generation Panel */}
        <div className="lg:col-span-5 bg-[#201f20]/60 backdrop-blur-md p-6 rounded-xl border border-white/5 space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white border-b border-white/5 pb-3 flex items-center gap-2">
            <span className="text-[#00daf3]">✨</span> Nuevo Lote de Códigos
          </h3>
          
          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-[#bac9cc] block mb-2">Tipo de Código</label>
              <div className="grid grid-cols-2 gap-2">
                {["Premium", "Presencial", "Online", "Seguimiento"].map((type, idx) => (
                  <label key={type} className="cursor-pointer">
                    <input defaultChecked={idx === 0} type="radio" name="code_type" className="peer sr-only" />
                    <div className="p-3 text-center text-xs rounded-lg border border-white/5 bg-[#131314]/50 text-[#bac9cc] peer-checked:border-[#00daf3] peer-checked:bg-[#00daf3]/5 peer-checked:text-[#00daf3] font-semibold transition-all hover:border-white/10">
                      {type}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-[#bac9cc] block mb-1">Cantidad</label>
                <input type="number" defaultValue="50" className="w-full bg-[#131314] border border-white/10 rounded-lg text-white px-3 py-2 text-sm focus:border-[#00daf3] focus:ring-0 outline-none" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-[#bac9cc] block mb-1">Validez</label>
                <select className="w-full bg-[#131314] border border-white/10 rounded-lg text-white px-3 py-2 text-sm focus:border-[#00daf3] focus:ring-0 outline-none">
                  <option>30 Días</option>
                  <option>90 Días</option>
                  <option>180 Días</option>
                  <option>Sin Expiración</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-wider text-[#bac9cc] block mb-1">Notas Internas / Tag</label>
              <input type="text" placeholder="Ej: Campaña Atletas Verano" className="w-full bg-[#131314] border border-white/10 rounded-lg text-white px-3 py-2 text-sm focus:border-[#00daf3] focus:ring-0 outline-none" />
            </div>

            <div className="p-4 bg-[#131314] rounded-lg border border-white/5 text-center">
              <span className="text-[10px] uppercase tracking-wider text-[#bac9cc] block mb-1">Vista Previa de Salida</span>
              <span className="text-lg font-mono font-bold text-[#00daf3] tracking-widest">PRM-8F3K9P</span>
            </div>

            <button type="button" className="w-full py-3 bg-[#00daf3] text-[#131314] rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-[#c3f5ff] transition-all shadow-[0_0_15px_rgba(0,218,243,0.2)]">
              Generar 50 Códigos
            </button>
          </form>
        </div>

        {/* Right: Activation Flowchart Visualizer */}
        <div className="lg:col-span-7 bg-[#201f20]/60 backdrop-blur-md p-6 rounded-xl border border-white/5 flex flex-col justify-between relative overflow-hidden">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-6 flex items-center gap-2">
            <span>🔄</span> Flujo de Activación Técnico
          </h3>
          
          <div className="space-y-6 relative pl-6 before:absolute before:left-9 before:top-2 before:bottom-2 before:w-px before:bg-gradient-to-b before:from-[#00daf3] before:to-transparent">
            {[
              { title: "Generación de Lote", desc: "El administrador configura los parámetros, tags y restricciones de uso." },
              { title: "Distribución de Canales", desc: "Los tokens encriptados se exportan o envían directamente al ecosistema." },
              { title: "Ingreso en la App / Web", desc: "El atleta ingresa el serial de registro al dar de alta su perfil." },
              { title: "Validación de Sistema", desc: "Filtros internos comprueban la vigencia, geolocalización y límites." }
            ].map((step, idx) => (
              <div key={idx} className="flex gap-4 items-start relative">
                <div className="w-6 h-6 rounded-full bg-[#131314] border border-[#00daf3] flex items-center justify-center text-[10px] text-[#00daf3] z-10 font-mono font-bold shadow-[0_0_10px_rgba(0,218,243,0.2)]">
                  {idx + 1}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">{step.title}</h4>
                  <p className="text-xs text-[#bac9cc] mt-0.5">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Advanced Management Table */}
      <div className="bg-[#201f20]/60 backdrop-blur-md rounded-xl border border-white/5 overflow-hidden">
        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#131314]/30">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">Registro Histórico de Códigos</h3>
          <div className="flex gap-2">
            <select className="bg-[#131314] border border-white/10 rounded px-3 py-1 text-xs text-[#bac9cc] outline-none focus:border-[#00daf3]">
              <option>Todos los Estados</option>
              <option>Disponibles</option>
              <option>Usados</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-[10px] uppercase tracking-wider text-[#bac9cc] bg-[#131314]/10">
                <th className="p-4">Código</th>
                <th className="p-4">Tipo</th>
                <th className="p-4">Estado</th>
                <th className="p-4">Creación</th>
                <th className="p-4">Paciente Vinculado</th>
                <th className="p-4 text-right">Detalle</th>
              </tr>
            </thead>
            <tbody className="text-xs font-mono">
              {codesData.map((row) => (
                <tr key={row.id} onClick={() => { setSelectedCode(row); setIsInspectorOpen(true); }} className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer group">
                  <td className="p-4 text-[#00daf3] font-bold">{row.code}</td>
                  <td className="p-4 text-white">{row.type}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-sans font-bold border ${
                      row.status === "Disponible" ? "border-[#00daf3]/40 text-[#00daf3] bg-[#00daf3]/5" :
                      row.status === "Usado" ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/5" :
                      "border-red-500/40 text-red-400 bg-red-500/5"
                    }`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="p-4 text-[#bac9cc]">{row.created}</td>
                  <td className="p-4 text-white">{row.patient}</td>
                  <td className="p-4 text-right">
                    <span className="text-[#00daf3] opacity-0 group-hover:opacity-100 transition-opacity">Ver →</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-out Code Inspector Side Panel */}
      {isInspectorOpen && (
        <div className="fixed right-0 top-0 bottom-0 w-80 md:w-96 bg-[#201f20] border-l border-white/10 shadow-2xl z-[100] flex flex-col animate-in slide-in-from-right duration-200">
          <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#131314]/50">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">Inspector de Ficha</h3>
              <p className="text-[10px] text-[#bac9cc]">Metadata interna en tiempo real</p>
            </div>
            <button onClick={() => setIsInspectorOpen(false)} className="text-[#bac9cc] hover:text-white text-sm p-1">
              ✕
            </button>
          </div>

          <div className="p-6 flex-1 space-y-6 overflow-y-auto">
            <div className="text-center p-4 bg-[#131314] border border-white/5 rounded-xl relative overflow-hidden">
              <span className="text-[10px] uppercase tracking-wider text-[#bac9cc] block mb-1">Identificador de Token</span>
              <div className="text-2xl font-mono font-black text-[#00daf3] tracking-widest">{selectedCode.code}</div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-[#131314]/40 rounded-lg border border-white/5">
                <span className="text-[9px] uppercase text-[#bac9cc] block mb-0.5">Estado</span>
                <span className="text-xs font-bold text-[#00daf3]">{selectedCode.status}</span>
              </div>
              <div className="p-3 bg-[#131314]/40 rounded-lg border border-white/5">
                <span className="text-[9px] uppercase text-[#bac9cc] block mb-0.5">Tipo</span>
                <span className="text-xs font-bold text-white">{selectedCode.type}</span>
              </div>
              <div className="p-3 bg-[#131314]/40 rounded-lg border border-white/5">
                <span className="text-[9px] uppercase text-[#bac9cc] block mb-0.5">Creado</span>
                <span className="text-xs font-mono text-white">{selectedCode.created}</span>
              </div>
              <div className="p-3 bg-[#131314]/40 rounded-lg border border-white/5">
                <span className="text-[9px] uppercase text-[#bac9cc] block mb-0.5">Expira</span>
                <span className="text-xs font-mono text-white">{selectedCode.expires || "N/A"}</span>
              </div>
            </div>

            <div>
              <h4 className="text-[10px] uppercase tracking-wider text-[#bac9cc] mb-3 border-b border-white/5 pb-1">Historial de Activación</h4>
              <div className="relative pl-4 space-y-4 before:absolute before:left-1 before:top-2 before:bottom-2 before:w-px before:bg-white/10">
                <div className="relative">
                  <div className="absolute -left-[15px] top-1.5 w-2 h-2 rounded-full bg-[#00daf3]" />
                  <p className="text-xs font-semibold text-white">Generado por Admin</p>
                  <span className="text-[10px] text-[#bac9cc] font-mono">{selectedCode.created}</span>
                </div>
                <div className="relative opacity-40">
                  <div className="absolute -left-[15px] top-1.5 w-2 h-2 rounded-full bg-white/40" />
                  <p className="text-xs font-semibold text-white">Esperando Vinculación</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-[#131314]/50 border-t border-white/5 grid grid-cols-2 gap-2">
            <button className="py-2 rounded-lg border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-wider hover:bg-red-500/10 transition-colors">
              Suspender
            </button>
            <button className="py-2 rounded-lg bg-[#2a2a2b] text-white text-xs font-bold uppercase tracking-wider hover:bg-white/5 transition-colors">
              Limitar Uso
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
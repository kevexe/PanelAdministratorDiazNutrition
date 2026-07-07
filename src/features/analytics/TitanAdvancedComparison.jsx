import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Chart from 'chart.js/auto';

export default function TitanAdvancedComparison() {
  const navigate = useNavigate();
  
  // Referencias para el Slider Antes/Después
  const containerRef = useRef(null);
  const sliderRef = useRef(null);
  const overlayRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  // Referencias para los Gráficos Chart.js
  const radarChartRef = useRef(null);
  const lineChartRef = useRef(null);
  const radarCanvasRef = useRef(null);
  const lineCanvasRef = useRef(null);

  // ==========================================
  // ESTADO Y FUNCIONES DE LA MATRIZ DE DATOS
  // ==========================================
  const [datosClinicos, setDatosClinicos] = useState([
    { id: 'peso', metrica: 'Peso', inicial: 80.0, final: '', unidad: 'kg', auto: false },
    { id: 'imc', metrica: 'IMC', inicial: 25.5, final: '', unidad: '', auto: true },
    { id: 'grasa', metrica: 'Masa Grasa', inicial: 18.5, final: '', unidad: '%', auto: false },
    { id: 'musculo', metrica: 'Masa Muscular', inicial: 38.2, final: '', unidad: 'kg', auto: false },
    { id: 'visceral', metrica: 'Grasa Visceral', inicial: 6.0, final: '', unidad: 'Nvl', auto: false },
    { id: 'hidra', metrica: 'Hidratación', inicial: 58.1, final: '', unidad: '%', auto: false },
    { id: 'abd', metrica: 'Abdomen', inicial: 90.0, final: '', unidad: 'cm', auto: false },
    { id: 'cintura', metrica: 'Cintura', inicial: 85.0, final: '', unidad: 'cm', auto: false },
    { id: 'cadera', metrica: 'Cadera', inicial: 95.0, final: '', unidad: 'cm', auto: false },
    { id: 'icc', metrica: 'ICC', inicial: 0.88, final: '', unidad: '', auto: true },
    { id: 'tricipital', metrica: 'Tricipital', inicial: 12.0, final: '', unidad: 'mm', auto: false },
    { id: 'subescapular', metrica: 'Subescapular', inicial: 14.0, final: '', unidad: 'mm', auto: false },
    { id: 'bicipital', metrica: 'Bicipital', inicial: 8.0, final: '', unidad: 'mm', auto: false },
    { id: 'iliaca', metrica: 'Cresta Ilíaca', inicial: 16.0, final: '', unidad: 'mm', auto: false },
    { id: 'supraespinal', metrica: 'Supraespinal', inicial: 18.5, final: '', unidad: 'mm', auto: false },
    { id: 'abdominal', metrica: 'Abdominal', inicial: 22.0, final: '', unidad: 'mm', auto: false },
    { id: 'muslo', metrica: 'Muslo', inicial: 15.0, final: '', unidad: 'mm', auto: false },
  ]);

  const getDato = (id) => {
    return datosClinicos.find(d => d.id === id) || { inicial: 0, final: '', metrica: '', unidad: '', auto: false };
  };

  const handleFinalValueChange = (index, value) => {
    if (index === -1) return;
    const newDatos = [...datosClinicos];
    newDatos[index].final = value;
    setDatosClinicos(newDatos);
  };
  // ==========================================

  // Lógica del Slider
  const updateSlider = (clientX) => {
    if (!containerRef.current || !sliderRef.current || !overlayRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    let x = clientX - rect.left;
    if (x < 0) x = 0;
    if (x > rect.width) x = rect.width;
    const percentage = (x / rect.width) * 100;
    overlayRef.current.style.width = `${100 - percentage}%`;
    sliderRef.current.style.left = `${percentage}%`;
  };

  useEffect(() => {
    const handleMouseUp = () => setIsDragging(false);
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      updateSlider(e.clientX);
    };
    const handleTouchEnd = () => setIsDragging(false);
    const handleTouchMove = (e) => {
      if (!isDragging) return;
      updateSlider(e.touches[0].clientX);
    };

    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('touchmove', handleTouchMove);

    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isDragging]);

  // Inicialización de Gráficos
  useEffect(() => {
    Chart.defaults.color = '#849495';
    Chart.defaults.font.family = 'Inter';

    if (radarChartRef.current) radarChartRef.current.destroy();
    if (lineChartRef.current) lineChartRef.current.destroy();

    // Gráfico Radar
    if (radarCanvasRef.current) {
      radarChartRef.current = new Chart(radarCanvasRef.current, {
        type: 'radar',
        data: {
          labels: ['Tricipital', 'Subescapular', 'Bicipital', 'Cresta Iliaca', 'Supraespinal', 'Abdominal', 'Muslo'],
          datasets: [
            {
              label: 'Inicial (A)',
              data: [12, 14, 8, 16, 18.5, 22, 15],
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderColor: '#849495',
              borderWidth: 1,
              pointRadius: 3
            },
            {
              label: 'Final (B)',
              data: [8.5, 10, 6, 11, 12, 14, 12],
              backgroundColor: 'rgba(0, 242, 255, 0.2)',
              borderColor: '#00f2ff',
              borderWidth: 2,
              pointRadius: 4,
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: { r: { ticks: { display: false }, grid: { color: 'rgba(255,255,255,0.1)' }, angleLines: { color: 'rgba(255,255,255,0.1)' } } },
          plugins: { legend: { display: false } }
        }
      });
    }

    // Gráfico de Líneas
    if (lineCanvasRef.current) {
      lineChartRef.current = new Chart(lineCanvasRef.current, {
        type: 'line',
        data: {
          labels: ['Oct', 'Nov', 'Dic', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
          datasets: [{
            label: 'Peso Corporal (kg)',
            data: [82, 81.5, 80.8, 80.0, 78.5, 77.2, 76.0, 75.1, 74.5],
            borderColor: '#00f2ff',
            backgroundColor: 'rgba(0, 242, 255, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: { grid: { color: 'rgba(255,255,255,0.05)' } },
            y: { grid: { color: 'rgba(255,255,255,0.05)' } }
          },
          plugins: { legend: { display: false } }
        }
      });
    }

    return () => {
      if (radarChartRef.current) radarChartRef.current.destroy();
      if (lineChartRef.current) lineChartRef.current.destroy();
    };
  }, []);

  return (
    <div className="w-full bg-[#080f10] text-white font-['Inter',_sans-serif] relative p-6 md:p-10 flex flex-col gap-8">
      
      {/* ESTILOS INTERNOS */}
      <style>{`
        .glass-panel { background-color: rgba(25, 33, 34, 0.6); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.05); }
        .slider-container { position: relative; width: 100%; height: 380px; overflow: hidden; border-radius: 0.75rem; cursor: ew-resize; }
        .slider-image { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; }
        .slider-overlay { position: absolute; top: 0; right: 0; width: 50%; height: 100%; overflow: hidden; pointer-events: none; }
        .slider-overlay img { position: absolute; top: 0; right: 0; width: 200%; max-width: 200%; height: 100%; object-fit: cover; }
        .slider-handle { position: absolute; top: 0; left: 50%; bottom: 0; width: 2px; background-color: #00f2ff; z-index: 10; transform: translateX(-50%); box-shadow: 0 0 10px rgba(0, 242, 255, 0.5); pointer-events: none; }
        .slider-handle::after { content: ''; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 28px; height: 28px; background-color: #0d1515; border: 2px solid #00f2ff; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 15px rgba(0, 242, 255, 0.3); }
        .cyan-text-glow { text-shadow: 0 0 10px rgba(0, 242, 255, 0.4); }
      `}</style>

      {/* HEADER DE LA SECCIÓN */}
      <div>
        <h2 className="font-['Bodoni_Moda'] text-3xl font-semibold text-white cyan-text-glow">Comparación Avanzada de Evaluaciones</h2>
        <p className="text-[#849495] mt-1 text-sm">Command Center - Análisis Evolutivo Multidimensional</p>
      </div>

      {/* 1. PERFIL & SELECTOR */}
      <div className="flex flex-col xl:flex-row gap-6">
        <div className="glass-panel rounded-xl p-6 flex-1 flex flex-col md:flex-row items-center gap-6 border-l-4 border-l-[#00f2ff] relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <span className="material-symbols-outlined text-[100px] text-[#00f2ff]">analytics</span>
          </div>
          <div className="w-28 h-28 rounded-lg overflow-hidden border border-white/20 flex-shrink-0 z-10 shadow-[0_0_20px_rgba(0,242,255,0.15)]">
            <img alt="Kevin Calderón" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB06nP74RJpyF3daP8aTUWNPRNeZqtCy4hUj7Admq1_wjRHwN3TnbK-cFSMgNsMk4WtFhtKcxb0Vdo0Ysugxl5-J4KhSvkL3pQeHPV3yfSGVY4gOu0vW3pD8sYAA-Lce-Up0z2N7-I30Lnh7x2EbmjMuKUqXvIC4AGoLcGydzKfUzCCXw-gWv3yEqE4oD2Jr5KNh1wtegWJYse2NogvRJH1NJFDoTRsQCxBQLBawpoywA70elYE8YuYIygAOwjCmrLlsWWrK8yiOA0D" />
          </div>
          <div className="flex flex-col flex-1 z-10 w-full">
            <h2 className="font-['Bodoni_Moda'] text-3xl font-semibold text-white">Kevin Calderón</h2>
            <div className="flex flex-wrap items-center gap-4 mt-2 mb-4">
              <span className="text-[12px] font-mono text-[#00f2ff] bg-[#00f2ff]/10 px-3 py-1 rounded border border-[#00f2ff]/20">ID: TTP-8492</span>
              <span className="text-[12px] font-mono text-white flex items-center gap-1"><span className="material-symbols-outlined text-[16px] text-[#849495]">calendar_today</span> 28 Años</span>
              <span className="text-[12px] font-mono text-white flex items-center gap-1"><span className="material-symbols-outlined text-[16px] text-[#849495]">male</span> Masculino</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-[#151d1e]/50 p-3 rounded-lg border border-white/5 w-full">
              <div className="flex flex-col"><span className="text-[10px] text-[#849495] uppercase tracking-widest mb-1">Objetivo</span><span className="text-white text-sm font-medium">Hipertrofia</span></div>
              <div className="flex flex-col"><span className="text-[10px] text-[#849495] uppercase tracking-widest mb-1">Estado</span><span className="text-[#00f2ff] text-sm font-medium flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#00f2ff]"></span> Activo</span></div>
              <div className="flex flex-col"><span className="text-[10px] text-[#849495] uppercase tracking-widest mb-1">Seguimiento</span><span className="text-white text-sm font-medium">5 Meses</span></div>
              <div className="flex flex-col"><span className="text-[10px] text-[#849495] uppercase tracking-widest mb-1">Evals.</span><span className="text-white text-sm font-medium">04 Realizadas</span></div>
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-xl p-6 w-full xl:w-[400px] flex flex-col gap-4 border border-white/10 shadow-lg">
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#849495] flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">history_toggle_off</span> CONFIGURACIÓN DE COMPARATIVA
          </h3>
          <div className="flex flex-col gap-2 relative mt-2">
            <label className="text-[10px] text-[#849495] uppercase tracking-widest">Evaluación Inicial (A)</label>
            <select className="w-full bg-[#192122] border border-white/10 text-white font-mono text-[12px] rounded p-3 outline-none cursor-pointer">
              <option>15 Enero 2025 - Evaluación Base</option>
            </select>
            
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 bg-[#192122] border border-white/10 rounded-full p-1 mt-1">
              <span className="material-symbols-outlined text-[#849495] text-sm">compare_arrows</span>
            </div>

            <label className="text-[10px] text-[#00f2ff] uppercase tracking-widest mt-2">Evaluación Final (B)</label>
            <select className="w-full bg-[#192122] border border-[#00f2ff]/30 text-[#00f2ff] font-mono text-[12px] rounded p-3 outline-none cursor-pointer shadow-[inset_0_0_10px_rgba(0,242,255,0.05)]">
              <option>15 Junio 2025 - Actual</option>
            </select>
          </div>
          <button className="w-full mt-auto bg-[#00f2ff] text-black font-bold text-[12px] tracking-widest py-3 rounded hover:bg-[#00dbe7] transition-colors shadow-[0_0_15px_rgba(0,242,255,0.2)] flex justify-center items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">sync</span> COMPARAR RESULTADOS
          </button>
        </div>
      </div>

      {/* 2. ÍNDICE DE ÉXITO & KPIS */}
      <div className="glass-panel rounded-xl p-6 border border-[#00f2ff]/20 bg-gradient-to-r from-[#00f2ff]/5 to-transparent flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="relative w-24 h-24 flex items-center justify-center flex-shrink-0">
            <svg className="w-full h-full transform -rotate-90 absolute" viewBox="0 0 100 100">
              <circle cx="50" cy="50" fill="none" r="45" stroke="rgba(255,255,255,0.1)" strokeWidth="8"></circle>
              <circle className="drop-shadow-[0_0_8px_#00f2ff]" cx="50" cy="50" fill="none" r="45" stroke="#00f2ff" strokeDasharray="283" strokeDashoffset="22.64" strokeWidth="8"></circle>
            </svg>
            <div className="flex flex-col items-center z-10 text-center">
              <span className="font-['Bodoni_Moda'] text-2xl text-white font-bold">92</span>
            </div>
          </div>
          <div>
            <h3 className="text-[11px] font-bold tracking-widest uppercase text-[#849495] mb-1">Índice de Éxito</h3>
            <div className="flex items-center gap-3">
              <span className="font-['Bodoni_Moda'] text-2xl text-white">Progreso Global</span>
              <span className="bg-[#00f2ff]/20 text-[#00f2ff] border border-[#00f2ff]/30 px-2 py-1 rounded text-[10px] font-bold tracking-widest">MEJORÍA</span>
            </div>
          </div>
        </div>
        <div className="flex-1 w-full md:max-w-md">
          <div className="flex justify-between text-[10px] text-[#849495] mb-2 font-mono uppercase">
            <span>Base (0)</span><span>Objetivo Cumplido (100)</span>
          </div>
          <div className="h-3 w-full bg-[#192122] rounded-full overflow-hidden border border-white/10">
            <div className="bg-gradient-to-r from-[#2e3637] to-[#00f2ff] w-[92%] h-full"></div>
          </div>
        </div>
      </div>

      {/* 3. FILA DE KPIS CIENTÍFICOS */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {[
          { label: "Peso", val: "74.5", unit: "kg", from: "80.0 kg", diff: "-5.5", status: "down", color: "text-[#00f2ff]" },
          { label: "IMC", val: "23.8", unit: "", from: "25.5", diff: "-1.7", status: "down", color: "text-[#00f2ff]" },
          { label: "ICC", val: "0.82", unit: "", from: "0.88", diff: "-0.06", status: "down", color: "text-[#00f2ff]" },
          { label: "M. Grasa", val: "14.2", unit: "%", from: "18.5%", diff: "-4.3%", status: "FAVORABLE", color: "text-[#00f2ff]", highlight: true },
          { label: "M. Muscular", val: "38.6", unit: "kg", from: "38.2 kg", diff: "+0.4 kg", status: "ESTABLE", color: "text-white", highlight: true },
          { label: "G. Visceral", val: "4", unit: "Nvl", from: "6 Nvl", diff: "-2", status: "down", color: "text-[#00f2ff]" },
          { label: "Hidratación", val: "62.4", unit: "%", from: "58.1%", diff: "+4.3%", status: "up", color: "text-[#00f2ff]" }
        ].map((kpi, i) => (
          <div key={i} className={`glass-panel rounded-lg p-4 flex flex-col relative overflow-hidden ${kpi.highlight ? (i === 3 ? 'border-t-2 border-t-[#00f2ff]' : 'border-t-2 border-t-white') : ''}`}>
            <span className="text-[10px] text-[#849495] uppercase tracking-widest mb-2">{kpi.label}</span>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="font-['Bodoni_Moda'] text-2xl text-white font-medium">{kpi.val}</span>
              <span className="text-[10px] text-[#849495]">{kpi.unit}</span>
            </div>
            <div className="text-[10px] text-[#849495] font-mono mb-3">De: {kpi.from}</div>
            <div className={`mt-auto flex items-center justify-between font-mono font-bold text-[11px] ${kpi.color} ${kpi.highlight ? 'bg-white/5 p-1 -mx-1 rounded' : ''}`}>
              <span>{kpi.diff}</span>
              {kpi.status === "down" && <span className="material-symbols-outlined text-[14px]">trending_down</span>}
              {kpi.status === "up" && <span className="material-symbols-outlined text-[14px]">trending_up</span>}
              {kpi.highlight && <span className="text-[9px] tracking-widest">{kpi.status}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* 4. HUB DE TRANSFORMACIÓN: FOTOS Y GRÁFICOS */}
      <h3 className="font-['Bodoni_Moda'] text-2xl font-semibold text-white border-b border-white/10 pb-2 mt-4 flex items-center gap-2">
        <span className="material-symbols-outlined text-[#00f2ff]">view_in_ar</span> Hub de Transformación Visual
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-panel rounded-xl p-5 lg:col-span-1 border border-white/5">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-bold text-[11px] tracking-widest text-white uppercase">Documentación Fotográfica</h4>
          </div>
          <div className="slider-container bg-black border border-white/10" ref={containerRef} onMouseDown={(e) => { setIsDragging(true); updateSlider(e.clientX); }} onTouchStart={(e) => { setIsDragging(true); updateSlider(e.touches[0].clientX); }}>
            <img alt="Before" className="slider-image opacity-80 mix-blend-luminosity" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAEfacZub7-_K16hU6SnAa7EjvuzLoi9mOKJpbVTIGpD6kL4Poi_vVd1xsz1l7OUNI1zcJU8_85e50cNTqoW4OESZkkt7XneZqtnCSjdYMxxDZ2N3yd8oHww1D5IfViRkGrV1niP6L-X9OgGNFHxwids_QTFV3afl84f_iS3hQroQbfTy1xllAve92fKmHZGf2qOiDHLebp1Ftf7Y5fNT7cVxHrHiGQhnnY6f0eT15ON3OTgTJZEHTAzUl7XKxJoQEKo-y6mP9RVGyf"/>
            <div className="slider-overlay" ref={overlayRef}><img alt="After" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBSoCpSE8o5xtGwaTNQ2T89sG6msE2_ea3ye-V-Jh_2j6k9oqt3cq_hw1_mgoODkWnfJiprA5AoH5OqqpEwsSAShhUgQqqEl0dnFgNOKDCM_1fR4l4p0rU7iOHUoIGeCi8VvT-COpdoe6XYe96skFB-fgi8nHpPhhp8IhjxPBwew_BoS6yrQ357tihIsdL3RAu4bUTdXeWeSXU8bE2IH8tkO18RY_3dmg2pFN5WRp2nAO8tYenZTLzMinHGxSgTY78nSSUV433eImjK"/></div>
            <div className="slider-handle" ref={sliderRef}></div>
            <div className="absolute bottom-3 left-3 bg-black/80 px-2 py-1 rounded text-[10px] text-white z-20">15 Ene</div>
            <div className="absolute bottom-3 right-3 bg-[#00f2ff]/20 px-2 py-1 rounded text-[10px] text-[#00f2ff] z-20">15 Jun</div>
          </div>
        </div>

        <div className="glass-panel rounded-xl p-5 lg:col-span-1 border border-white/5 flex flex-col">
          <h4 className="font-bold text-[11px] tracking-widest text-white uppercase mb-4 text-center">Evolución de Pliegues (Radar)</h4>
          <div className="flex-1 w-full relative min-h-[250px] flex justify-center items-center">
            <canvas ref={radarCanvasRef}></canvas>
          </div>
        </div>

        <div className="glass-panel rounded-xl p-5 lg:col-span-1 border border-white/5 flex flex-col">
          <h4 className="font-bold text-[11px] tracking-widest text-white uppercase mb-4 text-center">Curva Histórica de Peso Corporal</h4>
          <div className="flex-1 w-full relative min-h-[250px]">
            <canvas ref={lineCanvasRef}></canvas>
          </div>
        </div>
      </div>

      {/* 5. MATRIZ DE DATOS (NUEVO DISEÑO AGRUPADO EN GRID) */}
      <div className="space-y-6">
        
        {/* Categoría: Medidas Básicas */}
        <div className="glass-panel p-6 rounded-xl border border-white/5 bg-[#0d1515]">
          <div className="flex items-center gap-2 mb-6 border-b border-[#3a494b]/50 pb-2">
            <span className="material-symbols-outlined text-[#00dbe7]">height</span>
            <h3 className="font-['Inter'] text-[11px] font-semibold uppercase tracking-widest text-[#00dbe7]">Medidas Básicas</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {['peso', 'imc'].map((key) => {
              const dato = getDato(key);
              const index = datosClinicos.findIndex(d => d.id === key);
              return (
                <div key={key} className="space-y-2">
                  <label className="font-['Inter'] text-[11px] font-semibold text-[#b9cacb] uppercase flex items-center gap-2">
                    {dato.metrica}
                    {dato.auto && <span className="text-[8px] bg-[#00dbe7]/10 text-[#00dbe7] px-1.5 py-0.5 rounded border border-[#00dbe7]/20 tracking-wider">AUTO</span>}
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 relative">
                      {dato.auto && key === 'imc' ? (
                        <div className="w-full bg-[#151d1e] border border-[#3a494b]/50 p-4 font-mono text-[24px] text-[#849495] rounded">
                          {dato.final !== '' ? dato.final : '--.-'}
                        </div>
                      ) : (
                        <input
                          type="number"
                          step="0.1"
                          value={dato.final}
                          onChange={(e) => handleFinalValueChange(index, e.target.value)}
                          className="w-full bg-[#2e3637] border-none border-b border-[#3a494b] p-4 font-mono text-[24px] text-[#00dbe7] focus:border-[#00dbe7] focus:shadow-[0_0_10px_rgba(0,219,231,0.2)] outline-none rounded-t transition-all"
                          placeholder="00.0"
                        />
                      )}
                      {dato.unidad && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#b9cacb]/50 text-xs uppercase">{dato.unidad}</span>}
                    </div>
                    <div className="w-20 text-center">
                      <div className="text-[10px] text-[#b9cacb] uppercase mb-1">Inicial</div>
                      <div className="font-mono text-[16px] text-[#dce4e4]/60">{dato.inicial.toFixed(1)}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Categoría: Composición Corporal */}
        <div className="glass-panel p-6 rounded-xl border border-white/5 bg-[#0d1515]">
          <div className="flex items-center gap-2 mb-6 border-b border-[#3a494b]/50 pb-2">
            <span className="material-symbols-outlined text-[#00dbe7]">body_system</span>
            <h3 className="font-['Inter'] text-[11px] font-semibold uppercase tracking-widest text-[#00dbe7]">Composición Corporal</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {['grasa', 'musculo', 'visceral', 'hidra'].map((key) => {
              const dato = getDato(key);
              const index = datosClinicos.findIndex(d => d.id === key);
              return (
                <div key={key} className="space-y-2">
                  <label className="font-['Inter'] text-[11px] font-semibold text-[#b9cacb] uppercase flex items-center justify-between">
                    <span>{dato.metrica} ({dato.unidad})</span>
                    {dato.auto && <span className="text-[8px] bg-[#00dbe7]/10 text-[#00dbe7] px-1.5 py-0.5 rounded border border-[#00dbe7]/20 tracking-wider">AUTO</span>}
                  </label>
                  <div className="flex flex-col gap-1">
                    <input
                      type="number"
                      step="0.1"
                      disabled={dato.auto}
                      value={dato.final}
                      onChange={(e) => handleFinalValueChange(index, e.target.value)}
                      className={`w-full bg-[#2e3637] border-none border-b border-[#3a494b] p-3 font-mono text-[16px] outline-none rounded-t transition-all ${dato.auto ? 'text-[#00dbe7] opacity-80 cursor-not-allowed border-dashed' : 'text-[#00dbe7] focus:border-[#00dbe7] focus:shadow-[0_0_10px_rgba(0,219,231,0.2)]'}`}
                    />
                    <div className="flex justify-between px-1">
                      <span className="text-[10px] text-[#b9cacb] uppercase tracking-wider">INICIAL: {dato.inicial.toFixed(1)}{dato.unidad}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Categoría: Perímetros */}
        <div className="glass-panel p-6 rounded-xl border border-white/5 bg-[#0d1515]">
          <div className="flex items-center gap-2 mb-6 border-b border-[#3a494b]/50 pb-2">
            <span className="material-symbols-outlined text-[#00dbe7]">straighten</span>
            <h3 className="font-['Inter'] text-[11px] font-semibold uppercase tracking-widest text-[#00dbe7]">Perímetros (cm)</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {['abd', 'cintura', 'cadera', 'icc'].map((key) => {
              const dato = getDato(key);
              const index = datosClinicos.findIndex(d => d.id === key);
              return (
                <div key={key} className="space-y-2">
                  <label className="font-['Inter'] text-[11px] font-semibold text-[#b9cacb] uppercase flex items-center justify-between">
                    {dato.metrica}
                    {dato.auto && <span className="text-[8px] bg-[#00dbe7]/10 text-[#00dbe7] px-1.5 py-0.5 rounded border border-[#00dbe7]/20 tracking-wider">AUTO</span>}
                  </label>
                  <div className="flex flex-col gap-1">
                    <input
                      type="number"
                      step={key === 'icc' ? "0.01" : "0.1"}
                      disabled={dato.auto}
                      value={dato.final}
                      onChange={(e) => handleFinalValueChange(index, e.target.value)}
                      className={`w-full bg-[#2e3637] border-none border-b border-[#3a494b] p-3 font-mono text-[16px] outline-none rounded-t transition-all ${dato.auto ? 'text-[#00dbe7] opacity-80 cursor-not-allowed border-dashed' : 'text-[#00dbe7] focus:border-[#00dbe7] focus:shadow-[0_0_10px_rgba(0,219,231,0.2)]'}`}
                    />
                    <div className="flex justify-between px-1">
                      <span className="text-[10px] text-[#b9cacb] uppercase tracking-wider">INICIAL: {dato.inicial.toFixed(key === 'icc' ? 2 : 1)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Categoría: Pliegues ISAK */}
        <div className="glass-panel p-6 rounded-xl border border-white/5 bg-[#0d1515]">
          <div className="flex items-center gap-2 mb-6 border-b border-[#3a494b]/50 pb-2">
            <span className="material-symbols-outlined text-[#00dbe7]">layers</span>
            <h3 className="font-['Inter'] text-[11px] font-semibold uppercase tracking-widest text-[#00dbe7]">Pliegues ISAK (mm)</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-8">
            {['tricipital', 'subescapular', 'bicipital', 'iliaca', 'supraespinal', 'abdominal', 'muslo'].map((key) => {
              const dato = getDato(key);
              const index = datosClinicos.findIndex(d => d.id === key);
              return (
                <div key={key} className="space-y-1">
                  <label className="text-[10px] text-[#b9cacb] tracking-tighter uppercase font-semibold">{dato.metrica}</label>
                  <div className="relative mt-1">
                    <input
                      type="number"
                      step="0.1"
                      value={dato.final}
                      onChange={(e) => handleFinalValueChange(index, e.target.value)}
                      className="w-full bg-[#192122] border-none border-b border-[#3a494b] p-2 font-mono text-[14px] text-[#00dbe7] focus:border-[#00dbe7] outline-none rounded-t transition-all"
                    />
                    <div className="absolute -bottom-4 left-0 text-[9px] text-[#b9cacb]/60 font-mono uppercase tracking-widest">
                      A: {dato.inicial.toFixed(1)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
      {/* CONTROLES INFERIORES */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-white/10 mt-4">
        <button onClick={() => navigate(-1)} className="text-[11px] font-bold tracking-widest uppercase text-[#849495] hover:text-white transition-colors flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px]">arrow_back</span> VOLVER AL EXPEDIENTE
        </button>
        <button className="px-6 py-3 bg-[#00f2ff] text-black text-[11px] font-bold tracking-widest uppercase rounded shadow-[0_0_15px_rgba(0,242,255,0.2)] hover:bg-[#00dbe7] transition-all">
          GUARDAR REPORTE EVOLUTIVO
        </button>
      </div>

    </div>
  );
}
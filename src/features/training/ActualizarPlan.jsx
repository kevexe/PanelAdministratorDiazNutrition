import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from './firebase/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { planService } from './services/planService';

// ─── UNIDADES DISPONIBLES PARA MEDIR ─────────────────────────────────────────
const UNIDADES = ['g', 'ml', 'oz', 'kg', 'lb', 'taza', 'cucharada', 'pieza'];

export default function ActualizarPlan() {
  const navigate = useNavigate();

  // ─── 1. ATLETA DESDE FIREBASE ────────────────────────────────────────────────
  const [atleta, setAtleta] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const atletaId = sessionStorage.getItem('atleta_seleccionado_id');
    if (!atletaId) { setLoading(false); return; }

    const docRef = doc(db, 'usuarios', atletaId);
    const unsub = onSnapshot(docRef, (snap) => {
      if (snap.exists()) setAtleta({ id: snap.id, ...snap.data() });
      setLoading(false);
    }, (err) => { console.error(err); setLoading(false); });

    return () => unsub();
  }, []);

  // ─── 2. PLAN NUTRICIONAL ──────────────────────────────────────────────────────
  // Cada opción ahora tiene: titulo, imagen (base64), alimentos[]
  const [plan, setPlan] = useState({
    Desayuno:   { activa: 1, opciones: { 1: { titulo: '', imagen: null, alimentos: [] }, 2: { titulo: '', imagen: null, alimentos: [] }, 3: { titulo: '', imagen: null, alimentos: [] } } },
    Almuerzo:   { activa: 1, opciones: { 1: { titulo: '', imagen: null, alimentos: [] }, 2: { titulo: '', imagen: null, alimentos: [] }, 3: { titulo: '', imagen: null, alimentos: [] } } },
    Cena:       { activa: 1, opciones: { 1: { titulo: '', imagen: null, alimentos: [] }, 2: { titulo: '', imagen: null, alimentos: [] }, 3: { titulo: '', imagen: null, alimentos: [] } } },
    Refrigerio: { activa: 1, opciones: { 1: { titulo: '', imagen: null, alimentos: [] }, 2: { titulo: '', imagen: null, alimentos: [] }, 3: { titulo: '', imagen: null, alimentos: [] } } },
  });

  // ─── 3. MODAL BUSCADOR ────────────────────────────────────────────────────────
  const [modalAbierto, setModalAbierto]           = useState(false);
  const [destinoSeleccion, setDestinoSeleccion]   = useState({ comida: null, opcion: null });
  const [busqueda, setBusqueda]                   = useState('');
  const [resultadosAPI, setResultadosAPI]         = useState([]);
  const [buscandoAPI, setBuscandoAPI]             = useState(false);
  const [errorAPI, setErrorAPI]                   = useState(null);
  const [alimentoSeleccionado, setAlimentoSeleccionado] = useState(null); // preview derecha
  const [gramosPreview, setGramosPreview]         = useState(100);
  const [unidadPreview, setUnidadPreview]         = useState('g');
  const debounceRef = useRef(null);

  // ─── BÚSQUEDA EN TIEMPO REAL ─────────────────────────────────────────────────
  useEffect(() => {
    if (busqueda.length < 3) { setResultadosAPI([]); setErrorAPI(null); return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      setBuscandoAPI(true); setErrorAPI(null);
      try {
        const API_KEY = import.meta.env?.VITE_USDA_API_KEY || '';
        const res = await fetch(
          `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(busqueda)}&api_key=${API_KEY}&pageSize=20`
        );
        if (!res.ok) throw new Error('Error conectando con USDA.');
        const data = await res.json();
        const getNutrient = (food, id) => food.foodNutrients?.find(n => n.nutrientId === id)?.value || 0;
        setResultadosAPI(
          (data.foods || []).map(food => ({
            idAPI:    food.fdcId,
            nombre:   food.description.toLowerCase().replace(/\b\w/g, l => l.toUpperCase()),
            kcalBase: getNutrient(food, 1008),
            proBase:  getNutrient(food, 1003),
            carBase:  getNutrient(food, 1005),
            fatBase:  getNutrient(food, 1004),
            fibBase:  getNutrient(food, 1079),
            sodBase:  getNutrient(food, 1093),
          }))
        );
      } catch (e) {
        setErrorAPI(e.message);
      } finally {
        setBuscandoAPI(false);
      }
    }, 600);

    return () => clearTimeout(debounceRef.current);
  }, [busqueda]);

  // ─── FUNCIONES DEL EDITOR ─────────────────────────────────────────────────────
  const cambiarOpcionActiva = (comida, num) =>
    setPlan(prev => ({ ...prev, [comida]: { ...prev[comida], activa: num } }));

  const actualizarTituloOpcion = (comida, opcion, titulo) =>
    setPlan(prev => ({
      ...prev,
      [comida]: {
        ...prev[comida],
        opciones: {
          ...prev[comida].opciones,
          [opcion]: { ...prev[comida].opciones[opcion], titulo }
        }
      }
    }));

  const actualizarImagenOpcion = (comida, opcion, base64) =>
    setPlan(prev => ({
      ...prev,
      [comida]: {
        ...prev[comida],
        opciones: {
          ...prev[comida].opciones,
          [opcion]: { ...prev[comida].opciones[opcion], imagen: base64 }
        }
      }
    }));

  const handleImagenFile = (comida, opcion, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => actualizarImagenOpcion(comida, opcion, e.target.result);
    reader.readAsDataURL(file);
  };

  const abrirBuscador = (comida) => {
    const opcionActual = plan[comida].activa;
    setDestinoSeleccion({ comida, opcion: opcionActual });
    setBusqueda(''); setResultadosAPI([]); setAlimentoSeleccionado(null);
    setGramosPreview(100); setUnidadPreview('g');
    setModalAbierto(true);
  };

  const seleccionarAlimentoPreview = (al) => {
    setAlimentoSeleccionado(al);
    setGramosPreview(100);
    setUnidadPreview('g');
  };

  const confirmarAgregarAlimento = () => {
    if (!alimentoSeleccionado) return;
    const { comida, opcion } = destinoSeleccion;
    const nuevoAlimento = {
      ...alimentoSeleccionado,
      idUnico: crypto.randomUUID(),
      gramos: gramosPreview,
      unidad: unidadPreview,
    };
    setPlan(prev => ({
      ...prev,
      [comida]: {
        ...prev[comida],
        opciones: {
          ...prev[comida].opciones,
          [opcion]: {
            ...prev[comida].opciones[opcion],
            alimentos: [...prev[comida].opciones[opcion].alimentos, nuevoAlimento]
          }
        }
      }
    }));
    setModalAbierto(false);
  };

  const actualizarGramos = (comida, opcion, idUnico, val) => {
    const v = Number(val) >= 0 ? Number(val) : 0;
    setPlan(prev => ({
      ...prev,
      [comida]: {
        ...prev[comida],
        opciones: {
          ...prev[comida].opciones,
          [opcion]: {
            ...prev[comida].opcirrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrones[opcion],
            alimentos: prev[comida].opciones[opcion].alimentos.map(a =>
              a.idUnico === idUnico ? { ...a, gramos: v } : a
            )
          }
        }
      }
    }));
  };

  const actualizarUnidad = (comida, opcion, idUnico, unidad) => {
    setPlan(prev => ({
      ...prev,
      [comida]: {
        ...prev[comida],
        opciones: {
          ...prev[comida].opciones,
          [opcion]: {
            ...prev[comida].opciones[opcion],
            alimentos: prev[comida].opciones[opcion].alimentos.map(a =>
              a.idUnico === idUnico ? { ...a, unidad } : a
            )
          }
        }
      }
    }));
  };

  const eliminarAlimento = (comida, opcion, idUnico) => {
    setPlan(prev => ({
      ...prev,
      [comida]: {
        ...prev[comida],
        opciones: {
          ...prev[comida].opciones,
          [opcion]: {
            ...prev[comida].opciones[opcion],
            alimentos: prev[comida].opciones[opcion].alimentos.filter(a => a.idUnico !== idUnico)
          }
        }
      }
    }));
  };

  const calcReal = (base100, gramos) => (base100 / 100) * gramos;

  const calcularTotalesDia = () => {
    let t = { kcal: 0, pro: 0, car: 0, fat: 0 };
    Object.values(plan).forEach(tiempo => {
      const { alimentos } = tiempo.opciones[tiempo.activa];
      alimentos.forEach(al => {
        t.kcal += calcReal(al.kcalBase, al.gramos);
        t.pro  += calcReal(al.proBase,  al.gramos);
        t.car  += calcReal(al.carBase,  al.gramos);
        t.fat  += calcReal(al.fatBase,  al.gramos);
      });
    });
    return t;
  };
  const totalesDia = calcularTotalesDia();

  const handlePublishPlan = async () => {
    if (!atleta) return;
    const macros = { kcal: Math.round(totalesDia.kcal), proteina: Math.round(totalesDia.pro) };
    try {
      await planService.publicarPlanNutricional(atleta.id, plan, macros);
      alert(`¡Plan actualizado para ${atleta.nombre}!`);
    } catch (e) {
      alert('Error al guardar. Revisa la consola.');
    }
  };

  // ─── VISTAS DE ESTADO ────────────────────────────────────────────────────────
  if (loading) return (
    <div className="w-full min-h-screen bg-[#0f0f10] flex items-center justify-center">
      <div className="text-center space-y-2">
        <div className="w-8 h-8 border-2 border-[#00f2ff] border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs font-mono text-[#00f2ff] tracking-widest uppercase animate-pulse">Sincronizando Editor de Plan...</p>
      </div>
    </div>
  );

  if (!atleta) return (
    <div className="w-full min-h-screen bg-[#0f0f10] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-[#171719] border border-white/5 rounded-xl p-8 text-center space-y-4">
        <span className="text-4xl">🗄️</span>
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Ningún Atleta Seleccionado</h3>
        <p className="text-xs text-[#a3a3a3] leading-relaxed">Para crear o editar un plan nutricional, primero debes seleccionar un perfil activo.</p>
        <button onClick={() => navigate('/base-datos')} className="w-full py-2.5 bg-[#00f2ff] text-black text-xs font-black uppercase tracking-widest rounded-lg hover:bg-cyan-300 transition-colors">
          Ir a Base de Datos
        </button>
      </div>
    </div>
  );

  const nombreAtleta = `${atleta.nombre || ''} ${atleta.apellido || ''}`.trim();

  // ─── RENDER PRINCIPAL ────────────────────────────────────────────────────────
  return (
    <div className="bg-[#0d1515] text-[#dce4e4] min-h-screen overflow-hidden flex selection:bg-[#00f2ff] selection:text-[#00363a] font-['Inter'] relative">

      {/* ══════════════════════════════════════════════════════════
          MODAL BUSCADOR — DISEÑO DIVIDIDO (izquierda lista / derecha detalle)
      ══════════════════════════════════════════════════════════ */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end justify-center p-0 sm:items-center sm:p-4">
          <div className="bg-[#192122] border border-[#3a494b] w-full max-w-5xl rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden"
               style={{ height: '82vh' }}>

            {/* Header modal */}
            <div className="px-5 py-4 border-b border-[#3a494b] flex justify-between items-center bg-[#2e3637]/30 shrink-0">
              <div>
                <h3 className="text-lg font-bold text-[#00dbe7]">Base de Datos Nutricional — USDA</h3>
                <p className="text-[11px] text-[#b9cacb] mt-0.5">
                  Añadiendo a: <strong className="text-white">{destinoSeleccion.comida}</strong> ·
                  Opción <strong className="text-white">{destinoSeleccion.opcion}</strong>
                  {plan[destinoSeleccion.comida]?.opciones[destinoSeleccion.opcion]?.titulo &&
                    <span className="text-[#00dbe7]"> "{plan[destinoSeleccion.comida].opciones[destinoSeleccion.opcion].titulo}"</span>
                  }
                </p>
              </div>
              <button onClick={() => setModalAbierto(false)} className="text-[#b9cacb] hover:text-white">
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </div>

            {/* Buscador */}
            <div className="px-4 py-3 bg-[#192122] border-b border-[#3a494b]/50 shrink-0">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#3a494b] text-xl">search</span>
                <input
                  type="text" autoFocus
                  placeholder="Busca en inglés: Chicken breast, Oats, Salmon…"
                  value={busqueda} onChange={e => setBusqueda(e.target.value)}
                  className="w-full bg-[#0d1515] border border-[#3a494b] rounded-xl py-3 pl-10 pr-4 text-white outline-none focus:border-[#00dbe7] text-sm"
                />
              </div>
            </div>

            {/* Cuerpo dividido */}
            <div className="flex flex-1 overflow-hidden">

              {/* ── IZQUIERDA: Lista de alimentos ── */}
              <div className="w-1/2 border-r border-[#3a494b]/50 overflow-y-auto flex flex-col custom-scrollbar bg-[#0d1515]">
                {buscandoAPI ? (
                  <div className="flex-1 flex flex-col items-center justify-center gap-2 text-[#00dbe7]">
                    <span className="material-symbols-outlined animate-spin text-4xl">autorenew</span>
                    <span className="text-[11px] tracking-widest">CONSULTANDO USDA...</span>
                  </div>
                ) : errorAPI ? (
                  <div className="p-6 text-center text-red-400 text-sm">{errorAPI}</div>
                ) : resultadosAPI.length === 0 && busqueda.length > 2 ? (
                  <div className="p-6 text-center text-[#b9cacb] text-sm">Sin resultados. Intenta en inglés.</div>
                ) : resultadosAPI.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center gap-3 text-[#3a494b] p-8 text-center">
                    <span className="material-symbols-outlined text-5xl">grocery</span>
                    <p className="text-xs">Escribe al menos 3 caracteres para buscar en la base de datos USDA</p>
                  </div>
                ) : (
                  <div className="p-3 flex flex-col gap-1.5">
                    {resultadosAPI.map(al => (
                      <button
                        key={al.idAPI}
                        onClick={() => seleccionarAlimentoPreview(al)}
                        className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                          alimentoSeleccionado?.idAPI === al.idAPI
                            ? 'bg-[#00dbe7]/10 border-[#00dbe7]/60 text-[#00dbe7]'
                            : 'bg-[#192122] border-[#3a494b]/40 text-[#dce4e4] hover:border-[#00dbe7]/30 hover:bg-[#2e3637]/30'
                        }`}
                      >
                        <p className="text-sm font-semibold truncate">{al.nombre}</p>
                        <div className="flex gap-3 mt-1 text-[10px] font-bold tracking-wider">
                          <span className="text-[#b9cacb]">{Math.round(al.kcalBase)} kcal</span>
                          <span className="text-[#00dbe7]">P {Math.round(al.proBase)}g</span>
                          <span className="text-green-400">C {Math.round(al.carBase)}g</span>
                          <span className="text-yellow-400">F {Math.round(al.fatBase)}g</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* ── DERECHA: Detalle + ajuste de cantidad ── */}
              <div className="w-1/2 overflow-y-auto custom-scrollbar bg-[#192122] flex flex-col">
                {!alimentoSeleccionado ? (
                  <div className="flex-1 flex flex-col items-center justify-center gap-3 text-[#3a494b] p-8 text-center">
                    <span className="material-symbols-outlined text-5xl">touch_app</span>
                    <p className="text-xs text-[#b9cacb]">Selecciona un alimento de la lista para ver sus macros y ajustar la cantidad</p>
                  </div>
                ) : (
                  <div className="p-6 flex flex-col gap-5">

                    {/* Nombre alimento */}
                    <div>
                      <h4 className="text-lg font-bold text-white leading-tight">{alimentoSeleccionado.nombre}</h4>
                      <p className="text-[11px] text-[#b9cacb] mt-1">Valores por 100 g/ml de referencia</p>
                    </div>

                    {/* Macros tabla */}
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: 'Calorías', val: alimentoSeleccionado.kcalBase, unit: 'kcal', color: 'text-white' },
                        { label: 'Proteína', val: alimentoSeleccionado.proBase,  unit: 'g',    color: 'text-[#00dbe7]' },
                        { label: 'Carbos',   val: alimentoSeleccionado.carBase,  unit: 'g',    color: 'text-green-400' },
                        { label: 'Grasas',   val: alimentoSeleccionado.fatBase,  unit: 'g',    color: 'text-yellow-400' },
                        { label: 'Fibra',    val: alimentoSeleccionado.fibBase,  unit: 'g',    color: 'text-purple-400' },
                        { label: 'Sodio',    val: alimentoSeleccionado.sodBase,  unit: 'mg',   color: 'text-orange-400' },
                      ].map(m => (
                        <div key={m.label} className="bg-[#0d1515] rounded-lg px-3 py-2.5 border border-[#3a494b]/30">
                          <p className="text-[10px] font-bold tracking-wider text-[#b9cacb] mb-0.5">{m.label.toUpperCase()}</p>
                          <p className={`text-base font-bold ${m.color}`}>
                            {Math.round(m.val * (gramosPreview / 100) * 10) / 10}
                            <span className="text-[10px] font-normal text-[#b9cacb] ml-1">{m.unit}</span>
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* ── Ajuste de cantidad + unidad ── */}
                    <div>
                      <p className="text-[11px] font-bold tracking-wider text-[#b9cacb] mb-2">CANTIDAD A AGREGAR</p>
                      <div className="flex gap-2">
                        <div className="flex-1 bg-[#0d1515] border border-[#3a494b] rounded-lg flex items-center px-3 focus-within:border-[#00dbe7] transition-colors">
                          <input
                            type="number" min="0" value={gramosPreview}
                            onChange={e => setGramosPreview(Number(e.target.value) >= 0 ? Number(e.target.value) : 0)}
                            className="bg-transparent w-full py-3 text-xl font-bold text-white outline-none border-none text-right"
                          />
                        </div>
                        <select
                          value={unidadPreview}
                          onChange={e => setUnidadPreview(e.target.value)}
                          className="bg-[#0d1515] border border-[#3a494b] rounded-lg px-3 text-sm font-bold text-[#00dbe7] outline-none focus:border-[#00dbe7] cursor-pointer min-w-[80px]"
                        >
                          {UNIDADES.map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                      </div>
                      <p className="text-[10px] text-[#b9cacb] mt-1.5 text-right">
                        = {Math.round(calcReal(alimentoSeleccionado.kcalBase, gramosPreview))} kcal totales
                      </p>
                    </div>

                    {/* Botón confirmar */}
                    <button
                      onClick={confirmarAgregarAlimento}
                      className="w-full py-3 bg-[#00dbe7] text-[#00363a] font-black text-sm tracking-widest rounded-xl hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,219,231,0.3)]"
                    >
                      <span className="material-symbols-outlined text-lg">add_circle</span>
                      AGREGAR AL PLAN
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          SIDEBAR IZQUIERDO
      ══════════════════════════════════════════════════════════ */}
      <nav className="bg-[#192122] h-screen w-72 fixed left-0 top-0 border-r border-[#3a494b] backdrop-blur-xl hidden md:flex flex-col py-10 z-40">
        <div className="px-8 mb-12">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#2e3637] flex items-center justify-center border border-[#3a494b]">
              <span className="font-['Bodoni_Moda'] text-2xl font-medium text-[#00dbe7]">T</span>
            </div>
            <div className="flex flex-col">
              <span className="font-['Bodoni_Moda'] text-xl font-bold text-[#00dbe7] tracking-tighter leading-none">TITAN</span>
              <span className="text-[9px] tracking-[0.2em] font-semibold text-[#b9cacb]">PERFORMANCE</span>
            </div>
          </div>
        </div>
        <div className="flex-1 flex flex-col gap-1 overflow-y-auto">
          <button onClick={() => navigate('/')} className="text-[#b9cacb] px-6 py-4 flex items-center gap-4 hover:bg-[#2e3637]/50 transition-colors w-full text-left">
            <span className="material-symbols-outlined">dashboard</span>
            <span className="text-[11px] font-semibold tracking-wider">Dashboard</span>
          </button>
          <button className="text-[#00dbe7] bg-[#e1fdff]/10 border-l-2 border-[#00dbe7] px-6 py-4 flex items-center gap-4 w-full text-left">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>restaurant</span>
            <span className="text-[11px] font-semibold tracking-wider">Editor Nutricional</span>
          </button>
        </div>
      </nav>

      {/* ══════════════════════════════════════════════════════════
          ÁREA PRINCIPAL
      ══════════════════════════════════════════════════════════ */}
      <main className="flex-1 ml-0 md:ml-72 flex flex-col h-screen relative">
        <div className="absolute top-[-20%] left-1/2 w-[80%] h-[50%] bg-[#00dbe7]/5 rounded-full blur-[120px] pointer-events-none"></div>

        {/* HEADER — muestra nombre del atleta */}
        <header className="h-20 px-8 flex items-center justify-between border-b border-[#3a494b]/30 bg-[#252525]/04 backdrop-blur-md z-30 sticky top-0 shrink-0">
          <div className="flex items-center gap-2 text-[#b9cacb] text-[11px] font-semibold tracking-wider">
            <span>Pacientes</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            {/* ── NOMBRE DEL ATLETA desde Firebase ── */}
            <span className="text-white">{nombreAtleta}</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-[#00dbe7] font-bold">Actualizar Plan</span>
          </div>

          <button
            onClick={handlePublishPlan}
            className="px-6 py-2 rounded bg-[#00f2ff] text-[#00363a] text-[11px] font-bold tracking-wider shadow-[0_0_15px_rgba(0,219,231,0.3)] hover:brightness-110 transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[16px]">publish</span> PUBLISH PLAN
          </button>
        </header>

        {/* WORKSPACE — 3 columnas */}
        <div className="flex-1 flex overflow-hidden p-4 gap-4">

          {/* ── COLUMNA 1: INFO ATLETA + secciones estáticas ── */}
          <aside className="w-1/4 min-w-[280px] flex flex-col gap-4 overflow-y-auto pb-4 custom-scrollbar">

            {/* ── Tarjeta perfil estática (igual a la imagen 2) ── */}
            <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-xl p-6 flex flex-col items-center gap-3">
              {/* Foto circular — estática o del atleta si existe */}
              <div className="w-20 h-20 rounded-full border-2 border-[#00dbe7]/40 overflow-hidden bg-[#192122] flex items-center justify-center">
                {atleta.fotoUrl
                  ? <img src={atleta.fotoUrl} alt={nombreAtleta} className="w-full h-full object-cover" />
                  : <span className="text-3xl font-bold text-[#00dbe7]">
                      {(atleta.nombre?.[0] || '?').toUpperCase()}
                    </span>
                }
              </div>
              <div className="text-center">
                <h2 className="font-['Bodoni_Moda'] text-xl font-semibold text-[#dce4e4]">{nombreAtleta}</h2>
                <p className="text-[11px] text-[#00dbe7] font-semibold uppercase tracking-wider mt-0.5">
                  {atleta.categoria || 'ELITE ATHLETE'}
                </p>
              </div>
              <div className="w-full bg-[#0d1515] rounded-lg p-3 border border-[#3a494b]/30">
                <p className="text-[9px] font-bold tracking-widest text-[#b9cacb] mb-1">CURRENT GOAL</p>
                <p className="text-sm text-[#dce4e4]">{atleta.objetivo || 'No especificado'}</p>
              </div>
            </div>

            {/* ── FREQUENT FOODS — estático, igual a imagen 3 ── */}
            <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[11px] font-black tracking-[0.15em] text-[#00dbe7]">FREQUENT FOODS</h3>
                <span className="material-symbols-outlined text-[16px] text-[#3a494b]">bar_chart</span>
              </div>
              {[
                { label: 'DESAYUNO',  food: atleta.alimentosFrecuentes?.desayuno  || 'Avena con Proteína',      freq: '8x/wk' },
                { label: 'ALMUERZO', food: atleta.alimentosFrecuentes?.almuerzo || 'Pollo con Arroz Jazmín',  freq: '6x/wk' },
                { label: 'CENA',     food: atleta.alimentosFrecuentes?.cena     || 'Salmón con Espárragos',   freq: '5x/wk' },
              ].map(item => (
                <div key={item.label} className="mb-3 last:mb-0">
                  <p className="text-[9px] font-bold tracking-widest text-[#b9cacb] mb-0.5">{item.label}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-[#dce4e4]">{item.food}</p>
                    <span className="text-[10px] font-bold text-[#00dbe7]">{item.freq}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Macros Diarios ── */}
            <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-xl p-6">
              <h3 className="font-['Bodoni_Moda'] text-xl font-medium text-[#dce4e4] mb-4">Macros Diarios</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-end border-b border-[#3a494b]/30 pb-2">
                  <span className="text-[11px] font-semibold tracking-wider text-[#b9cacb]">TOTAL KCAL</span>
                  <span className="text-xl font-bold text-[#00dbe7]">{Math.round(totalesDia.kcal)}</span>
                </div>
                <div className="flex justify-between items-end pb-1">
                  <span className="text-[11px] font-semibold tracking-wider text-[#b9cacb]">PROTEÍNA</span>
                  <span className="text-sm font-bold text-white">{Math.round(totalesDia.pro)}g</span>
                </div>
                <div className="flex justify-between items-end pb-1">
                  <span className="text-[11px] font-semibold tracking-wider text-[#b9cacb]">CARBOS</span>
                  <span className="text-sm font-bold text-white">{Math.round(totalesDia.car)}g</span>
                </div>
                <div className="flex justify-between items-end pb-1">
                  <span className="text-[11px] font-semibold tracking-wider text-[#b9cacb]">GRASAS</span>
                  <span className="text-sm font-bold text-white">{Math.round(totalesDia.fat)}g</span>
                </div>
              </div>
            </div>

            {/* Stats rápidos */}
            <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-xl p-5 flex flex-col gap-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#b9cacb]">Peso:</span>
                <span className="text-white font-bold">{atleta.antropometria?.peso || '--'} kg</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#b9cacb]">Estatura:</span>
                <span className="text-white font-bold">{atleta.antropometria?.estatura || '--'} cm</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#b9cacb]">Modalidad:</span>
                <span className="text-white font-bold">{atleta.modalidad || '--'}</span>
              </div>
            </div>
          </aside>

          {/* ── COLUMNA 2: EDITOR NUTRICIONAL ── */}
          <section className="flex-1 min-w-[500px] flex flex-col bg-white/5 backdrop-blur-2xl border border-white/15 shadow-2xl rounded-xl overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 custom-scrollbar">

              {['Desayuno', 'Almuerzo', 'Cena', 'Refrigerio'].map(comida => {
                const opActiva   = plan[comida].activa;
                const opcionData = plan[comida].opciones[opActiva];
                const alimentos  = opcionData.alimentos;
                const kcalComida = alimentos.reduce((acc, al) => acc + calcReal(al.kcalBase, al.gramos), 0);
                const imageInputRef = React.createRef();

                return (
                  <div key={comida} className="border border-[#3a494b]/30 rounded-xl bg-[#0d1515]/50 overflow-hidden">

                    {/* Header comida + tabs */}
                    <div className="px-6 py-4 border-b border-[#3a494b]/30 bg-[#192122]/50 flex justify-between items-center">
                      <div className="flex flex-col gap-3">
                        <h3 className="font-['Bodoni_Moda'] text-xl font-medium text-[#dce4e4]">{comida}</h3>
                        <div className="flex gap-2">
                          {[1, 2, 3].map(num => (
                            <button
                              key={num}
                              onClick={() => cambiarOpcionActiva(comida, num)}
                              className={`px-4 py-1 text-[11px] font-bold rounded-full transition-all border ${
                                opActiva === num
                                  ? 'bg-[#00dbe7]/10 text-[#00dbe7] border-[#00dbe7]/30'
                                  : 'text-[#b9cacb] border-transparent hover:bg-[#2e3637]/50'
                              }`}
                            >
                              Opción {num}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-semibold tracking-wider text-[#b9cacb] block mb-1">KCAL OPCIÓN {opActiva}</span>
                        <span className="text-2xl font-bold text-white">{Math.round(kcalComida)}</span>
                      </div>
                    </div>

                    {/* ── TÍTULO DE LA OPCIÓN + imagen ── */}
                    <div className="px-6 pt-4 pb-2 flex items-center gap-3 border-b border-[#3a494b]/20">
                      {/* Imagen de la opción */}
                      <div
                        onClick={() => imageInputRef.current?.click()}
                        className="w-12 h-12 rounded-lg border border-dashed border-[#3a494b] cursor-pointer flex items-center justify-center overflow-hidden shrink-0 hover:border-[#00dbe7]/50 transition-colors group"
                        title="Haz clic para subir imagen"
                      >
                        {opcionData.imagen
                          ? <img src={opcionData.imagen} alt="opcion" className="w-full h-full object-cover" />
                          : <span className="material-symbols-outlined text-[#3a494b] text-lg group-hover:text-[#00dbe7] transition-colors">add_photo_alternate</span>
                        }
                      </div>
                      <input
                        ref={imageInputRef}
                        type="file" accept="image/*" className="hidden"
                        onChange={e => handleImagenFile(comida, opActiva, e.target.files[0])}
                      />
                      {/* Campo de título */}
                      <input
                        type="text"
                        placeholder={`Título para ${comida} Opción ${opActiva} (ej: Bowl de Avena)`}
                        value={opcionData.titulo}
                        onChange={e => actualizarTituloOpcion(comida, opActiva, e.target.value)}
                        className="flex-1 bg-transparent border-b border-[#3a494b] py-1.5 text-sm font-semibold text-[#dce4e4] placeholder-[#3a494b] outline-none focus:border-[#00dbe7] transition-colors"
                      />
                    </div>

                    {/* Lista alimentos */}
                    <div className="p-4 flex flex-col gap-3">
                      {alimentos.length === 0 ? (
                        <p className="text-center text-[12px] text-[#b9cacb] py-4 italic">No hay alimentos en esta opción.</p>
                      ) : (
                        alimentos.map(al => (
                          <div key={al.idUnico} className="flex items-center justify-between p-3 rounded-lg border border-[#3a494b]/20 bg-[#151d1e] hover:border-[#00dbe7]/30 transition-colors group">
                            <div className="flex-1 pr-4 min-w-0">
                              <span className="text-[14px] font-semibold text-[#dce4e4] block truncate">{al.nombre}</span>
                              <div className="flex gap-3 text-[10px] font-bold tracking-wider text-[#b9cacb] mt-1">
                                <span className="text-[#00dbe7]">PRO {calcReal(al.proBase, al.gramos).toFixed(1)}g</span>
                                <span className="text-green-400">CAR {calcReal(al.carBase, al.gramos).toFixed(1)}g</span>
                                <span className="text-yellow-400">FAT {calcReal(al.fatBase, al.gramos).toFixed(1)}g</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 shrink-0">
                              {/* Cantidad */}
                              <div className="flex flex-col items-end">
                                <span className="text-[9px] font-bold tracking-wider text-[#b9cacb] mb-1">CANTIDAD</span>
                                <div className="flex items-center gap-1">
                                  <div className="flex items-center border-b border-[#3a494b] pb-1 w-14 focus-within:border-[#00dbe7]">
                                    <input
                                      className="bg-transparent w-full text-right text-[14px] font-bold text-white outline-none border-none p-0"
                                      type="number" min="0" value={al.gramos}
                                      onChange={e => actualizarGramos(comida, opActiva, al.idUnico, e.target.value)}
                                    />
                                  </div>
                                  {/* Selector unidad por alimento */}
                                  <select
                                    value={al.unidad || 'g'}
                                    onChange={e => actualizarUnidad(comida, opActiva, al.idUnico, e.target.value)}
                                    className="bg-transparent border-b border-[#3a494b] text-[11px] font-bold text-[#00dbe7] outline-none cursor-pointer pb-1 focus:border-[#00dbe7]"
                                  >
                                    {UNIDADES.map(u => <option key={u} value={u} className="bg-[#192122]">{u}</option>)}
                                  </select>
                                </div>
                              </div>
                              {/* Kcal */}
                              <div className="w-14 text-right">
                                <span className="text-[9px] font-bold tracking-wider text-[#b9cacb] mb-1 block">KCAL</span>
                                <span className="text-[14px] font-bold text-white">{Math.round(calcReal(al.kcalBase, al.gramos))}</span>
                              </div>
                              {/* Eliminar */}
                              <button onClick={() => eliminarAlimento(comida, opActiva, al.idUnico)} className="text-[#b9cacb] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-colors">
                                <span className="material-symbols-outlined text-[18px]">delete</span>
                              </button>
                            </div>
                          </div>
                        ))
                      )}

                      {/* Botón añadir */}
                      <button
                        onClick={() => abrirBuscador(comida)}
                        className="w-full py-3 mt-2 border border-dashed border-[#3a494b] rounded-lg text-[#b9cacb] text-[11px] font-bold tracking-wider hover:bg-[#2e3637]/30 hover:border-[#00dbe7]/50 hover:text-[#00dbe7] transition-all flex items-center justify-center gap-2"
                      >
                        <span className="material-symbols-outlined text-[16px]">add</span>
                        AÑADIR ALIMENTO A OPCIÓN {opActiva}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ── COLUMNA 3: VISTA PACIENTE (APP) ── */}
          <aside className="w-1/4 min-w-[300px] flex-col gap-4 hidden xl:flex">
            <div className="flex items-center justify-between px-2">
              <span className="text-[11px] font-semibold tracking-wider text-[#b9cacb]">VISTA DEL PACIENTE (APP)</span>
            </div>
            {/* Marco del teléfono — estático igual a imagen 4 */}
            <div className="flex-1 border border-[#3a494b]/50 rounded-[2rem] bg-black overflow-hidden relative shadow-2xl p-2 flex flex-col items-center">
              <div className="w-full h-full border border-[#3a494b]/20 rounded-[1.5rem] bg-[#0d1515] overflow-hidden relative flex flex-col">
                {/* Status bar */}
                <div className="h-6 w-full flex justify-between items-center px-4 pt-1 shrink-0">
                  <span className="text-[10px] text-[#dce4e4] font-medium">9:41</span>
                  <div className="w-3 h-3 rounded-full bg-[#3a494b]/50"></div>
                </div>
                {/* Titulo pantalla */}
                <div className="p-4 flex items-center justify-between border-b border-[#3a494b]/10 shrink-0">
                  <span className="font-['Bodoni_Moda'] text-lg text-[#dce4e4] font-medium">Hoy</span>
                </div>
                {/* Cards de comidas — con imagen y título de la opción */}
                <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3 custom-scrollbar">
                  {['Desayuno', 'Almuerzo', 'Cena', 'Refrigerio'].map(comida => {
                    const opActiva   = plan[comida].activa;
                    const opcionData = plan[comida].opciones[opActiva];
                    const alimentos  = opcionData.alimentos;
                    const kcalTotal  = alimentos.reduce((a, al) => a + calcReal(al.kcalBase, al.gramos), 0);

                    return (
                      <div key={comida} className="bg-[#192122] rounded-xl border border-[#3a494b]/10 overflow-hidden">
                        {/* Imagen de la opción si existe */}
                        {opcionData.imagen && (
                          <div className="w-full h-16 overflow-hidden">
                            <img src={opcionData.imagen} alt={opcionData.titulo || comida} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="p-3">
                          <div className="flex justify-between items-start mb-1.5">
                            {/* Título de la opción o nombre de la comida */}
                            <span className="text-sm font-semibold text-[#dce4e4]">
                              {opcionData.titulo || comida}
                            </span>
                            {kcalTotal > 0 && (
                              <span className="text-[11px] font-bold text-[#00dbe7] shrink-0 ml-2">
                                {Math.round(kcalTotal)} kcal
                              </span>
                            )}
                          </div>
                          {alimentos.length > 0 ? (
                            alimentos.map(al => (
                              <div key={al.idUnico} className="flex items-center gap-2 py-1 border-t border-[#3a494b]/10 first:border-0">
                                <div className="w-6 h-6 rounded bg-[#0d1515] flex items-center justify-center shrink-0">
                                  <span className="material-symbols-outlined text-[12px] text-[#3a494b]">nutrition</span>
                                </div>
                                <p className="text-[10px] text-[#b9cacb] leading-tight truncate">
                                  {al.gramos}{al.unidad || 'g'} · {al.nombre}
                                </p>
                              </div>
                            ))
                          ) : (
                            <p className="text-[10px] text-[#3a494b] italic">Pendiente de asignar…</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </aside>

        </div>
      </main>
    </div>
  );
}

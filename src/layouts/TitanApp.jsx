import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./../firebase/firebase"; 

export default function TitanApp() {
  const navigate = useNavigate();

  // --- 1. ESTADOS DEL PACIENTE ---
  const [pacienteInfo, setPacienteInfo] = useState({ nombre: "Kevin", apellido: "" });

  // --- 2. ESTRUCTURA DE DIETA MULTI-OPCIÓN (ACTUALIZADA PARA CÁLCULO MATEMÁTICO) ---
  const [planComidas, setPlanComidas] = useState({
    Desayuno: [
      {
        idOpcion: "opt-init-1",
        tituloOpcion: "Opción 1: Alta en Fibra",
        items: [
          { 
            id: 1, titulo: "Avena Integral", imagen: "https://images.unsplash.com/photo-1517686469429-8faf88b9f7af?q=80&w=200&auto=format&fit=crop", 
            cantidad: 60, unidad: "g", pesoPorUnidad: 1,
            baseKcal: 379, baseProtein: 13.2, baseFat: 6.5, baseCarbs: 67.7 
          }
        ]
      }
    ],
    Almuerzo: [
      { idOpcion: "opt-init-2", tituloOpcion: "Opción 1: Básica", items: [] }
    ],
    Refrigerio: [
      { idOpcion: "opt-init-3", tituloOpcion: "Opción 1: Snack Rápido", items: [] }
    ],
    Cena: [
      { idOpcion: "opt-init-4", tituloOpcion: "Opción 1: Ligera", items: [] }
    ]
  });

  // --- 3. ESTADOS DEL MODAL Y BÚSQUEDA ---
  const [showAddModal, setShowAddModal] = useState(false);
  const [targetComida, setTargetComida] = useState("");     
  const [targetOpcionId, setTargetOpcionId] = useState(""); 
  
  const [apiSearchTerm, setApiSearchTerm] = useState("");
  const [filtroPiramide, setFiltroPiramide] = useState("Todos"); 
  
  const [defaultApiFoods, setDefaultApiFoods] = useState([]); 
  const [apiFoods, setApiFoods] = useState([]);
  const [selectedApiFood, setSelectedApiFood] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  const [formCantidad, setFormCantidad] = useState(100);
  const [formUnidad, setFormUnidad] = useState("g");
  const [pesoPorUnidad, setPesoPorUnidad] = useState(100); 
  const [formTitulo, setFormTitulo] = useState("");
  const [formImagenUrl, setFormImagenUrl] = useState("");

  const traducirTerminoBusqueda = (termino) => {
    const t = termino.toLowerCase().trim();
    const diccionario = {
      "pollo": "chicken", "pechuga": "chicken breast", "arroz": "rice", "huevo": "egg",
      "huevos": "eggs", "avena": "oats", "avena integral": "oatmeal", "manzana": "apple",
      "platano": "banana", "plátano": "banana", "aguacate": "avocado", "salmon": "salmon",
      "salmón": "salmon", "leche": "milk", "carne": "beef", "pavo": "turkey", "atun": "tuna",
      "atún": "tuna", "pan": "bread", "queso": "cheese", "almendras": "almonds", "mani": "peanut",
      "maní": "peanut", "crema de mani": "peanut butter", "papas": "potato", "papa": "potato",
      "camote": "sweet potato", "espinaca": "spinach", "brocoli": "broccoli", "brócoli": "broccoli",
      "yogur": "yogurt", "yogurt": "yogurt"
    };
    return diccionario[t] || termino; 
  };

  useEffect(() => {
    const fetchPaciente = async () => {
      const idSeleccionado = sessionStorage.getItem("atleta_seleccionado_id");
      if (idSeleccionado) {
        try {
          const docRef = doc(db, "usuarios", idSeleccionado);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) setPacienteInfo(docSnap.data());
        } catch (error) { console.error("Error Firestore:", error); }
      }
    };
    fetchPaciente();
  }, []);

  // --- 4. PRE-CARGA DE DATOS 100% REALES DESDE LA API USDA ---
  useEffect(() => {
    const fetchInitialApiData = async () => {
      try {
        const apiKey = import.meta.env.VITE_USDA_API_KEY;
        if (!apiKey) return;
        
        const queries = ["chicken breast", "egg", "rice", "avocado", "oats"];
        const requests = queries.map(q => 
          fetch(`https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${apiKey}&query=${q}&pageSize=2`).then(r => r.json())
        );
        
        const results = await Promise.all(requests);
        let combinedFoods = [];
        
        results.forEach(data => {
          if (data.foods) {
            const mapped = data.foods.map(food => {
              const findNutrient = (id) => food.foodNutrients?.find(n => n.nutrientId === id)?.value || 0;
              let extractedServingSize = food.servingSize && typeof food.servingSize === 'number' ? food.servingSize : (food.foodMeasures?.[0]?.gramWeight || 100);
              
              let cat = "General";
              const catName = (food.foodCategory || "").toLowerCase();
              const desc = (food.description || "").toLowerCase();
              if (catName.includes("poultry") || catName.includes("meat") || desc.includes("egg") || desc.includes("chicken")) cat = "Proteínas";
              else if (catName.includes("fruit") || catName.includes("cereal") || catName.includes("grain") || desc.includes("rice") || desc.includes("oat")) cat = "Carbohidratos";
              else if (catName.includes("oil") || catName.includes("nut") || desc.includes("avocado")) cat = "Grasas";

              return {
                idAPI: food.fdcId.toString(),
                name: food.description,
                calories: Math.round(findNutrient(1008)), 
                protein: Math.round(findNutrient(1003) * 10) / 10,  
                fat: Math.round(findNutrient(1004) * 10) / 10,      
                carbs: Math.round(findNutrient(1005) * 10) / 10,    
                category: cat,
                servingSize: extractedServingSize
              };
            });
            combinedFoods = [...combinedFoods, ...mapped];
          }
        });
        
        setDefaultApiFoods(combinedFoods);
        setApiFoods(combinedFoods);
      } catch (error) {
        console.error("Error cargando base por defecto:", error);
      }
    };
    fetchInitialApiData();
  }, []);

  const handleBuscarEnApi = async (e) => {
    const term = e.target.value;
    setApiSearchTerm(term);
    
    if (term.length === 0) {
      setApiFoods(defaultApiFoods);
      setIsSearching(false);
      return;
    }

    if (term.length > 2) {
      setIsSearching(true);
      try {
        const queryTraducido = traducirTerminoBusqueda(term);
        const apiKey = import.meta.env.VITE_USDA_API_KEY;
        const response = await fetch(`https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${apiKey}&query=${encodeURIComponent(queryTraducido)}&pageSize=10`);
        const data = await response.json();
        
        if (data.foods) {
          const mappedFoods = data.foods.map(food => {
            const findNutrient = (id) => food.foodNutrients?.find(n => n.nutrientId === id)?.value || 0;
            let extractedServingSize = food.servingSize && typeof food.servingSize === 'number' ? food.servingSize : (food.foodMeasures?.[0]?.gramWeight || 100);
            
            return {
              idAPI: food.fdcId.toString(),
              name: food.description,
              calories: Math.round(findNutrient(1008)), 
              protein: Math.round(findNutrient(1003) * 10) / 10,  
              fat: Math.round(findNutrient(1004) * 10) / 10,      
              carbs: Math.round(findNutrient(1005) * 10) / 10,    
              category: food.foodCategory?.includes("Poultry") || food.foodCategory?.includes("Meat") ? "Proteínas" : "General",
              servingSize: extractedServingSize
            };
          });
          setApiFoods(mappedFoods);
        }
      } catch (error) {
        console.error("Error API:", error);
      } finally {
        setIsSearching(false);
      }
    }
  };

  const seleccionarComidaDeApi = (food) => {
    setSelectedApiFood(food);
    setFormTitulo(food.name);
    setFormCantidad(100);
    setFormUnidad("g");
    setFormImagenUrl("");
    setPesoPorUnidad(food.servingSize || 100); 
  };

  const obtenerGramosEquivalentes = () => {
    const cantidadNum = Number(formCantidad) || 0;
    if (formUnidad === "g" || formUnidad === "ml") return cantidadNum; 
    if (formUnidad === "ud") return cantidadNum * (Number(pesoPorUnidad) || 1); 
    return cantidadNum;
  };

  const gramosCalculados = obtenerGramosEquivalentes();
  const porcionFactor = gramosCalculados / 100 || 0;
  
  const dinamicoProtein = selectedApiFood ? Math.round((selectedApiFood.protein * porcionFactor) * 10) / 10 : 0;
  const dinamicoCarbs = selectedApiFood ? Math.round((selectedApiFood.carbs * porcionFactor) * 10) / 10 : 0;
  const dinamicoFat = selectedApiFood ? Math.round((selectedApiFood.fat * porcionFactor) * 10) / 10 : 0;
  const dinamicoKcal = selectedApiFood ? Math.round(selectedApiFood.calories * porcionFactor) : 0;

  const circunferenciaSVG = 97.4;
  const maxProteinaRef = 45; const maxCarbohidratosRef = 65; const maxGrasasRef = 35;
  const offsetProtein = circunferenciaSVG - (Math.min(dinamicoProtein / maxProteinaRef, 1) * circunferenciaSVG);
  const offsetCarbs = circunferenciaSVG - (Math.min(dinamicoCarbs / maxCarbohidratosRef, 1) * circunferenciaSVG);
  const offsetFat = circunferenciaSVG - (Math.min(dinamicoFat / maxGrasasRef, 1) * circunferenciaSVG);

  const agregarNuevaOpcion = (comidaKey) => {
    const nuevaOpcion = { idOpcion: `opt-${Date.now()}`, tituloOpcion: `Opción ${planComidas[comidaKey].length + 1}`, items: [] };
    setPlanComidas(prev => ({ ...prev, [comidaKey]: [...prev[comidaKey], nuevaOpcion] }));
  };

  const eliminarOpcion = (comidaKey, opcionId) => {
    setPlanComidas(prev => ({ ...prev, [comidaKey]: prev[comidaKey].filter(o => o.idOpcion !== opcionId) }));
  };

  const cambiarTituloOpcion = (comidaKey, opcionId, nuevoTitulo) => {
    setPlanComidas(prev => ({ ...prev, [comidaKey]: prev[comidaKey].map(o => o.idOpcion === opcionId ? { ...o, tituloOpcion: nuevoTitulo } : o) }));
  };

  const agregarAlimentoAlPlan = () => {
    if (!selectedApiFood) return;

    const nuevoAlimento = {
      id: Date.now(),
      titulo: formTitulo || selectedApiFood.name,
      imagen: formImagenUrl || "https://via.placeholder.com/150/2a2a2b/bac9cc?text=Alimento",
      cantidad: Number(formCantidad),
      unidad: formUnidad, 
      pesoPorUnidad: formUnidad === "ud" ? Number(pesoPorUnidad) : 1,
      baseKcal: selectedApiFood.calories,
      baseProtein: selectedApiFood.protein,
      baseFat: selectedApiFood.fat,
      baseCarbs: selectedApiFood.carbs
    };

    setPlanComidas(prev => ({
      ...prev,
      [targetComida]: prev[targetComida].map(opc => {
        if (opc.idOpcion === targetOpcionId) { return { ...opc, items: [...opc.items, nuevoAlimento] }; }
        return opc;
      })
    }));

    setShowAddModal(false); setSelectedApiFood(null); setApiSearchTerm("");
  };

  const modificarCantidadInline = (comidaKey, opcionId, alimentoId, nuevaCantidad) => {
    setPlanComidas(prev => ({
      ...prev,
      [comidaKey]: prev[comidaKey].map(opc => {
        if (opc.idOpcion === opcionId) {
          return { ...opc, items: opc.items.map(item => item.id === alimentoId ? { ...item, cantidad: Number(nuevaCantidad) } : item) };
        }
        return opc;
      })
    }));
  };

  // --- CÁLCULOS 100% REALES PARA EL MOBILE PREVIEW ---
  let totalKcalDiaMobile = 0;
  const previewMeals = Object.keys(planComidas).map(comidaKey => {
    const primeraOpcion = planComidas[comidaKey][0];
    let kcalOpcion = 0;
    let itemsPreview = [];
    
    if (primeraOpcion && primeraOpcion.items.length > 0) {
        primeraOpcion.items.forEach(item => {
            const gramos = item.unidad === "ud" ? item.cantidad * (item.pesoPorUnidad || 1) : item.cantidad;
            const factor = gramos / 100;
            kcalOpcion += (item.baseKcal || 0) * factor;
            
            itemsPreview.push({
                titulo: item.titulo,
                desc: `${item.cantidad}${item.unidad} • P: ${((item.baseProtein || 0) * factor).toFixed(1)}g C: ${((item.baseCarbs || 0) * factor).toFixed(1)}g`
            });
        });
    }
    
    totalKcalDiaMobile += kcalOpcion;
    
    return {
        comida: comidaKey,
        kcal: kcalOpcion,
        items: itemsPreview
    };
  });

  const handleActualizarPlan = () => { alert("¡Arquitectura de opciones sincronizada exitosamente!"); navigate('/'); };

  const nombreMostrar = `${pacienteInfo.nombre} ${pacienteInfo.apellido || ''}`.trim();
  const listaFiltradaModal = filtroPiramide === "Todos" ? apiFoods : apiFoods.filter(f => f.category === filtroPiramide);

  return (
    <div className="flex-1 bg-transparent min-h-full p-8 flex flex-col gap-6 z-10 font-sans relative overflow-y-auto">
        
        <style dangerouslySetInnerHTML={{__html: `
            ::-webkit-scrollbar { width: 6px; height: 6px; }
            ::-webkit-scrollbar-track { background: #131314; border-radius: 10px; }
            ::-webkit-scrollbar-thumb { background: rgba(0, 218, 243, 0.25); border-radius: 10px; border: 1px solid rgba(0, 218, 243, 0.05); transition: all 0.3s ease; }
            ::-webkit-scrollbar-thumb:hover { background: rgba(0, 218, 243, 0.6); box-shadow: 0 0 12px rgba(0, 218, 243, 0.6); }
            * { scrollbar-width: thin; scrollbar-color: rgba(0, 218, 243, 0.25) #131314; }
        `}} />

        <div className="absolute top-[0%] right-[-5%] w-[600px] h-[600px] bg-[#00daf3]/5 blur-[120px] rounded-full pointer-events-none"></div>

   {/* --- CABECERA --- */}
        <div className="flex justify-between items-end mb-2 relative z-10">
            <div>
                <div className="flex items-center gap-2 text-[#bac9cc] text-[11px] font-bold tracking-wider uppercase mb-2">
                    <span>Pacientes</span>
                    <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                    <span>{nombreMostrar}</span>
                    <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                    <span className="text-[#00daf3]">Calibración Multi-Opción</span>
                </div>
                <h2 className="text-3xl font-bold text-[#e5e2e3]">Plan Calibration</h2>
            </div>
            
            {/* --- CONTENEDOR DE BOTONES ACTUALIZADO --- */}
            <div className="flex items-center gap-4">
                <button onClick={() => navigate('/')} className="text-[#bac9cc] hover:text-[#e5e2e3] hover:bg-white/5 text-[11px] font-bold tracking-wider px-4 py-2 rounded transition-colors uppercase">
                    Cancelar
                </button>
                
                {/* NUEVO BOTÓN: CONFIGURAR ENTRENAMIENTO */}
                {/* Usa navigate('/ruta') para enviarlo a donde necesites */}
                <button onClick={() => navigate('/training')} className="bg-[#181819] border border-white/10 text-[#bac9cc] px-6 py-2 rounded text-[11px] font-bold tracking-wider hover:border-[#00daf3]/50 hover:text-[#00daf3] shadow-sm hover:shadow-[0_0_10px_rgba(0,218,243,0.1)] transition-all flex items-center gap-2 uppercase">
                    <span className="material-symbols-outlined text-[16px]">fitness_center</span> Configurar Entrenamiento
                </button>

                {/* BOTÓN PUBLISH ORIGINAL (Intacto) */}
                <button onClick={handleActualizarPlan} className="bg-[#00daf3]/10 border border-[#00daf3]/50 text-[#00daf3] px-6 py-2 rounded text-[11px] font-bold tracking-wider hover:bg-[#00daf3] hover:text-[#131314] shadow-[0_0_15px_rgba(0,218,243,0.15)] transition-all flex items-center gap-2 uppercase">
                    <span className="material-symbols-outlined text-[16px]">publish</span> Publish Plan
                </button>
            </div>
        </div>

        {/* --- BENTO GRID LAYOUT --- */}
        <div className="grid grid-cols-12 gap-6 items-start relative z-10">
            {/* LADO IZQUIERDO */}
            <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
                <div className="bg-[#181819] border border-white/5 shadow-sm rounded-xl p-6 flex flex-col items-center text-center relative overflow-hidden">
                    <div className="w-20 h-20 rounded-full border-2 border-[#00daf3]/30 p-1 mb-4 bg-[#131314]">
                        <img alt="Perfil" className="w-full h-full rounded-full object-cover filter contrast-125" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBjnSYpQza4lU-s5EsdKo7hW3QfVt7-TS7_YJaDQEvYj4IjPc3bOP_hyHbwTeaum2fq_pyVHLEEix9ePbu4VTW3eIEtSlFEvFRCb5EJieCctwgWiNp_XpbGiRvxCfrnPwu4Rig8swCluaVO0mChb8xxWHAPPtC6XcqJ6c8diWexaatyXAeHkUtUKgPKllbJKuIn_WCYERk82KMec06uEzjI965l4wFRCQ7x4ThTsDOBhqGtE-wG4xqjHwA0eQGg3d6nDBxUSqk8cDsd"/>
                    </div>
                    <h3 className="text-xl font-bold text-[#e5e2e3] mb-1">{nombreMostrar}</h3>
                    <p className="text-[10px] font-bold text-[#00daf3] tracking-widest uppercase">Elite Athlete</p>
                </div>

                <div className="bg-[#181819] border border-white/5 shadow-sm rounded-xl p-5 flex flex-col gap-4">
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <p className="text-[11px] font-bold text-[#bac9cc] tracking-wider uppercase opacity-80">FREQUENT FOODS</p>
                        <span className="material-symbols-outlined text-[#00daf3] text-[16px]">bar_chart</span>
                    </div>
                    <div className="space-y-3">
                        <div className="border-l-2 border-[#00daf3] pl-3 py-0.5">
                            <p className="text-[9px] font-bold text-[#00daf3] tracking-wider uppercase">DESAYUNO</p>
                            <p className="text-[13px] font-medium text-white/90">Avena con Proteína</p>
                        </div>
                        <div className="border-l-2 border-white/10 pl-3 py-0.5">
                            <p className="text-[9px] font-bold text-[#bac9cc] tracking-wider uppercase opacity-60">ALMUERZO</p>
                            <p className="text-[13px] font-medium text-white/90">Pollo con Arroz Jazmín</p>
                        </div>
                    </div>
                </div>

                {/* --- MOBILE PREVIEW (100% REAL) --- */}
                <div className="bg-[#181819] border border-white/5 shadow-sm rounded-xl p-5 flex flex-col items-center">
                    <div className="w-full flex justify-between items-center border-b border-white/5 pb-3 mb-4">
                        <p className="text-[11px] font-bold text-[#bac9cc] tracking-wider uppercase opacity-80">Mobile Preview</p>
                        <span className="text-[9px] font-bold text-emerald-400 uppercase bg-emerald-500/10 px-2 py-0.5 rounded flex items-center gap-1">
                           <span className="w-1 h-1 bg-emerald-400 rounded-full animate-pulse"></span> Live Sync
                        </span>
                    </div>

                    <div className="w-full max-w-[240px] bg-[#0b0b0c] border-[6px] border-[#252526] rounded-[32px] p-4 shadow-2xl relative overflow-hidden aspect-[9/18]">
                        <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-16 h-3.5 bg-[#252526] rounded-full z-20 flex items-center justify-center">
                            <div className="w-1.5 h-1.5 bg-black rounded-full ml-auto mr-2"></div>
                        </div>
                        <div className="h-full flex flex-col justify-between pt-4 text-left font-sans">
                            <div className="overflow-y-auto [&::-webkit-scrollbar]:hidden pb-2">
                                <p className="text-[9px] text-white/40 font-bold tracking-widest uppercase mb-1">TITAN CLIENT</p>
                                <h5 className="text-[14px] font-bold text-white mb-3">Tu Dieta de Hoy</h5>
                                
                                {previewMeals.map((meal, idx) => (
                                    <div key={idx} className={`bg-white/[0.03] border border-white/5 rounded-xl p-2.5 mb-2 ${meal.items.length === 0 ? 'opacity-60' : ''}`}>
                                        <div className="flex justify-between items-center mb-1.5">
                                            <p className="text-[10px] font-bold text-[#00daf3] uppercase">{meal.comida}</p>
                                            {meal.items.length > 0 && <p className="text-[9px] font-bold text-white/50">{Math.round(meal.kcal)} kcal</p>}
                                        </div>
                                        
                                        {meal.items.length > 0 ? (
                                            meal.items.slice(0, 2).map((item, i) => (
                                                <div key={i} className="mb-1 last:mb-0">
                                                    <p className="text-[11px] text-white/90 font-medium truncate">{item.titulo}</p>
                                                    <p className="text-[8px] text-white/40 mt-0.5">{item.desc}</p>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-[11px] text-white/30 italic">Pendiente de asignar...</p>
                                        )}
                                        {meal.items.length > 2 && <p className="text-[8px] text-[#00daf3] mt-1">+ {meal.items.length - 2} más</p>}
                                    </div>
                                ))}
                            </div>
                            
                            <div className="bg-[#00daf3]/5 border border-[#00daf3]/20 rounded-xl p-2 text-center shrink-0 mt-2">
                                <p className="text-[8px] font-bold text-[#00daf3] uppercase tracking-wider">Macros Totales</p>
                                <p className="text-[11px] font-black text-white mt-0.5">{Math.round(totalKcalDiaMobile)} kcal</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* COLUMNA CENTRAL: CONSTRUCTOR DIETÉTICO */}
            <div className="col-span-12 lg:col-span-8 flex flex-col">
                <div className="bg-[#201f20] border border-white/5 shadow-lg rounded-xl flex-1 flex flex-col overflow-hidden">
                    <div className="p-6 border-b border-white/5 bg-[#201f20]">
                        <h3 className="text-2xl font-bold text-[#e5e2e3]">Diet Architecture</h3>
                    </div>

                    <div className="p-6 flex-1 bg-[#131314]/50 flex flex-col gap-10">
                        {Object.keys(planComidas).map((comidaKey) => (
                            <div key={comidaKey} className="border-b border-white/5 pb-8 last:border-0">
                                <div className="flex justify-between items-center mb-6">
                                    <h4 className="text-2xl font-black text-[#e5e2e3] tracking-tight uppercase border-l-4 border-[#00daf3] pl-3">{comidaKey}</h4>
                                    <button onClick={() => agregarNuevaOpcion(comidaKey)} className="text-[11px] font-bold text-[#00daf3] hover:text-[#c3f5ff] bg-[#00daf3]/5 border border-[#00daf3]/20 px-3 py-1.5 rounded transition-all flex items-center gap-1">
                                        <span className="material-symbols-outlined text-sm">add</span> Añadir Opción
                                    </button>
                                </div>

                                <div className="flex flex-col gap-6">
                                    {planComidas[comidaKey].map((opcion) => {
                                        let totalKcalOpcion = 0; let totalPOpcion = 0; let totalCOpcion = 0; let totalFOpcion = 0;
                                        
                                        opcion.items.forEach(item => {
                                            const gramosItem = item.unidad === "ud" ? item.cantidad * (item.pesoPorUnidad || 1) : item.cantidad;
                                            const factor = gramosItem / 100;
                                            totalKcalOpcion += (item.baseKcal || 0) * factor;
                                            totalPOpcion += (item.baseProtein || 0) * factor;
                                            totalCOpcion += (item.baseCarbs || 0) * factor;
                                            totalFOpcion += (item.baseFat || 0) * factor;
                                        });

                                        return (
                                        <div key={opcion.idOpcion} className="bg-[#181819] border border-white/5 rounded-xl p-4 shadow-md relative group/opc">
                                            <div className="flex justify-between items-center mb-4 gap-4">
                                                <input type="text" value={opcion.tituloOpcion} onChange={(e) => cambiarTituloOpcion(comidaKey, opcion.idOpcion, e.target.value)} className="bg-transparent text-sm font-bold text-[#e5e2e3] border-b border-transparent hover:border-white/20 focus:border-[#00daf3] focus:outline-none pb-0.5 w-full transition-colors" placeholder="Título de la opción..."/>
                                                
                                                <div className="flex flex-col items-end shrink-0 bg-[#131314] px-3 py-1 rounded-lg border border-white/5 shadow-inner">
                                                    <span className="text-[14px] font-black text-[#00daf3]">{Math.round(totalKcalOpcion)} kcal</span>
                                                    <span className="text-[9px] font-bold text-[#bac9cc] tracking-widest uppercase">
                                                        P: {totalPOpcion.toFixed(1)}g • G: {totalFOpcion.toFixed(1)}g • C: {totalCOpcion.toFixed(1)}g
                                                    </span>
                                                </div>

                                                {planComidas[comidaKey].length > 1 && (
                                                    <button onClick={() => eliminarOpcion(comidaKey, opcion.idOpcion)} className="text-[#bac9cc] hover:text-red-400 opacity-0 group-hover/opc:opacity-100 transition-opacity ml-2">
                                                        <span className="material-symbols-outlined text-lg">delete</span>
                                                    </button>
                                                )}
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                {opcion.items.map((item) => {
                                                    const gramosItem = item.unidad === "ud" ? item.cantidad * (item.pesoPorUnidad || 1) : item.cantidad;
                                                    const factorItem = gramosItem / 100;
                                                    const itemKcal = Math.round((item.baseKcal || 0) * factorItem);
                                                    const itemP = ((item.baseProtein || 0) * factorItem).toFixed(1);
                                                    const itemC = ((item.baseCarbs || 0) * factorItem).toFixed(1);
                                                    const itemF = ((item.baseFat || 0) * factorItem).toFixed(1);

                                                    return (
                                                    <div key={item.id} className="bg-[#1c1c1d] border border-white/5 rounded-lg p-3 flex items-center justify-between group hover:border-[#00daf3]/30 transition-colors">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 rounded bg-[#2a2a2b] border border-white/5 overflow-hidden shrink-0">
                                                                <img alt={item.titulo} className="w-full h-full object-cover" src={item.imagen} onError={(e)=>{e.target.src="https://via.placeholder.com/150/2a2a2b/bac9cc?text=Food"}}/>
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <p className="text-[14px] text-[#e5e2e3] font-medium mb-0.5">{item.titulo}</p>
                                                                <p className="text-[9px] font-bold text-[#bac9cc] tracking-wider uppercase">P: {itemP}g • G: {itemF}g • C: {itemC}g</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-8">
                                                            <div className="flex items-center border-b border-[#00daf3]/50 pb-1 w-16">
                                                                <input className="bg-transparent w-full text-right text-[14px] font-medium text-[#e5e2e3] outline-none border-none p-0 focus:text-[#00daf3]" type="number" value={item.cantidad} onChange={(e) => modificarCantidadInline(comidaKey, opcion.idOpcion, item.id, e.target.value)}/>
                                                                <span className="text-[12px] font-medium text-[#e5e2e3] ml-1">{item.unidad}</span>
                                                            </div>
                                                            <span className="text-[13px] font-medium text-[#bac9cc] w-16 text-right">{itemKcal} kcal</span>
                                                        </div>
                                                    </div>
                                                )})}
                                            </div>

                                            <button onClick={() => { setTargetComida(comidaKey); setTargetOpcionId(opcion.idOpcion); setShowAddModal(true); }} className="w-full mt-3 py-2 border border-dashed border-white/5 text-[#bac9cc] text-[10px] font-bold tracking-wider rounded-lg hover:border-[#00daf3]/30 hover:text-[#00daf3] hover:bg-[#00daf3]/5 transition-all flex justify-center items-center gap-1 uppercase">
                                                <span className="material-symbols-outlined text-sm">add</span> Añadir Alimento
                                            </button>
                                        </div>
                                    )})}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>

        {/* ================= MODAL DE AJUSTE DINÁMICO ================= */}
        {showAddModal && (
            <div className="fixed inset-y-0 right-0 left-[280px] z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-[#131314] border border-white/10 w-full max-w-5xl h-[75vh] rounded-xl flex overflow-hidden shadow-2xl relative">
                    <button onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 text-[#bac9cc] hover:text-white z-10 text-xl">✕</button>

                    <div className="w-1/2 border-r border-white/10 bg-[#1c1c1d] flex flex-col">
                        <div className="p-6 border-b border-white/10 bg-[#201f20]">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-white">Añadir a {targetComida}</h3>
                                <span className="text-[10px] font-bold text-[#00daf3] uppercase tracking-wider bg-[#00daf3]/10 px-2 py-1 rounded">BASE DE DATOS USA (USDA)</span>
                            </div>
                            <div className="flex items-center bg-[#131314] border border-white/10 rounded px-3 py-2 mb-4 focus-within:border-[#00daf3]/50">
                                <span className="material-symbols-outlined text-[#bac9cc] text-[18px] mr-2">search</span>
                                <input type="text" placeholder="Buscar en español o inglés (ej. Pollo, Rice)..." value={apiSearchTerm} onChange={handleBuscarEnApi} className="bg-transparent w-full text-sm text-white outline-none"/>
                            </div>
                            <div className="flex gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
                                {["Todos", "Proteínas", "Carbohidratos", "Grasas"].map(cat => (
                                    <button key={cat} onClick={() => setFiltroPiramide(cat)} className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${filtroPiramide === cat ? 'bg-[#00daf3]/20 text-[#00daf3] border border-[#00daf3]/50' : 'bg-[#131314] text-[#bac9cc] border border-white/5'}`}>{cat}</button>
                                ))}
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-2">
                            {isSearching ? (
                                <p className="text-xs text-[#00daf3] text-center mt-4">Consultando USDA Food Data Central...</p>
                            ) : listaFiltradaModal.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full opacity-50 mt-10">
                                    <span className="material-symbols-outlined text-4xl mb-2 text-[#bac9cc]">database</span>
                                    <p className="text-sm text-[#bac9cc] text-center">No se encontraron resultados de la API.</p>
                                </div>
                            ) : (
                                listaFiltradaModal.map((food) => (
                                    <div key={food.idAPI} onClick={() => seleccionarComidaDeApi(food)} className={`p-3 rounded-lg border cursor-pointer transition-all flex justify-between items-center ${selectedApiFood?.idAPI === food.idAPI ? 'border-[#00daf3] bg-[#00daf3]/10' : 'border-white/5 bg-[#201f20] hover:border-[#00daf3]/40'}`}>
                                        <div>
                                            <p className="text-sm font-medium text-white">{food.name}</p>
                                            <p className="text-[10px] text-[#bac9cc] mt-1 font-bold uppercase tracking-wider">{food.category} • {food.calories} kcal/100g</p>
                                        </div>
                                        <span className="material-symbols-outlined text-[#bac9cc]">chevron_right</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="w-1/2 bg-[#201f20] p-8 flex flex-col justify-between">
                        {selectedApiFood ? (
                            <div className="flex-1 flex flex-col h-full">
                                <h3 className="text-xl font-bold text-[#e5e2e3] mb-2">Ajustar Porción</h3>
                                <p className="text-[10px] text-[#bac9cc] mb-4 uppercase font-bold tracking-wider">
                                    Equivalencia para cálculo: <span className="text-[#00daf3]">{Math.round(gramosCalculados)} gramos totales</span>
                                </p>
                                
                                <div className="bg-[#141415] border border-white/5 rounded-2xl p-6 mb-6 relative overflow-hidden shadow-inner flex justify-around items-center">
                                    <div className="absolute inset-0 bg-gradient-to-tr from-[#00daf3]/5 via-transparent to-purple-500/5 opacity-40 pointer-events-none"></div>
                                    
                                    <div className="flex flex-col items-center gap-2 relative z-10">
                                        <div className="relative w-20 h-20 flex items-center justify-center">
                                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                                <circle cx="18" cy="18" r="15.5" fill="none" className="stroke-white/5" strokeWidth="2.5" />
                                                <circle cx="18" cy="18" r="15.5" fill="none" className="stroke-[#00daf3] transition-all duration-300 ease-out" strokeWidth="2.5" strokeDasharray={circunferenciaSVG} strokeDashoffset={offsetProtein} strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 5px rgba(0, 218, 243, 0.5))' }} />
                                            </svg>
                                            <div className="absolute flex flex-col items-center">
                                                <span className="text-[16px] font-black text-white tracking-tight">{dinamicoProtein}</span>
                                                <span className="text-[9px] text-[#bac9cc] -mt-1 font-bold">gramo</span>
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-black text-[#00daf3] uppercase tracking-widest text-center">Proteínas</span>
                                    </div>

                                    <div className="flex flex-col items-center gap-2 relative z-10">
                                        <div className="relative w-20 h-20 flex items-center justify-center">
                                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                                <circle cx="18" cy="18" r="15.5" fill="none" className="stroke-white/5" strokeWidth="2.5" />
                                                <circle cx="18" cy="18" r="15.5" fill="none" className="stroke-[#a855f7] transition-all duration-300 ease-out" strokeWidth="2.5" strokeDasharray={circunferenciaSVG} strokeDashoffset={offsetCarbs} strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 5px rgba(168, 85, 247, 0.5))' }} />
                                            </svg>
                                            <div className="absolute flex flex-col items-center">
                                                <span className="text-[16px] font-black text-white tracking-tight">{dinamicoCarbs}</span>
                                                <span className="text-[9px] text-[#bac9cc] -mt-1 font-bold">gramo</span>
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-black text-[#a855f7] uppercase tracking-widest text-center">Carbohidratos</span>
                                    </div>

                                    <div className="flex flex-col items-center gap-2 relative z-10">
                                        <div className="relative w-20 h-20 flex items-center justify-center">
                                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                                <circle cx="18" cy="18" r="15.5" fill="none" className="stroke-white/5" strokeWidth="2.5" />
                                                <circle cx="18" cy="18" r="15.5" fill="none" className="stroke-[#f43f5e] transition-all duration-300 ease-out" strokeWidth="2.5" strokeDasharray={circunferenciaSVG} strokeDashoffset={offsetFat} strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 5px rgba(244, 63, 94, 0.5))' }} />
                                            </svg>
                                            <div className="absolute flex flex-col items-center">
                                                <span className="text-[16px] font-black text-white tracking-tight">{dinamicoFat}</span>
                                                <span className="text-[9px] text-[#bac9cc] -mt-1 font-bold">gramo</span>
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-black text-[#f43f5e] uppercase tracking-widest text-center">Grasas</span>
                                    </div>
                                </div>

                                <div className="space-y-4 flex-1">
                                    <div className="flex gap-4 items-end">
                                        <div className={formUnidad === "ud" ? "w-1/3" : "w-1/2"}>
                                            <label className="text-[10px] text-[#bac9cc] font-bold uppercase tracking-wider mb-1 block">CANTIDAD</label>
                                            <input type="number" value={formCantidad} onChange={(e)=>setFormCantidad(e.target.value)} min="0" className="w-full bg-[#131314] border border-white/10 rounded px-3 py-2 text-white font-bold outline-none focus:border-[#00daf3]" />
                                        </div>
                                        <div className={formUnidad === "ud" ? "w-1/3" : "w-1/2"}>
                                            <label className="text-[10px] text-[#bac9cc] font-bold uppercase tracking-wider mb-1 block">MEDIDA</label>
                                            <select value={formUnidad} onChange={(e)=>setFormUnidad(e.target.value)} className="w-full bg-[#131314] border border-white/10 rounded px-3 py-2 text-white outline-none focus:border-[#00daf3] h-[38px]">
                                                <option value="g">Gramos (g)</option>
                                                <option value="ml">Mililitros (ml)</option>
                                                <option value="ud">Unidades (ud)</option>
                                            </select>
                                        </div>

                                        {formUnidad === "ud" && (
                                            <div className="w-1/3 transition-all duration-300">
                                                <label className="text-[10px] text-[#00daf3] font-black uppercase tracking-wider mb-1 block">PESO X UNIDAD (g)</label>
                                                <input type="number" value={pesoPorUnidad} onChange={(e)=>setPesoPorUnidad(e.target.value)} min="1" className="w-full bg-[#00daf3]/5 border border-[#00daf3]/50 rounded px-3 py-2 text-[#00daf3] font-bold outline-none shadow-[0_0_10px_rgba(0,218,243,0.1)]" />
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="text-[10px] text-[#bac9cc] font-bold uppercase tracking-wider mb-1 block">TÍTULO EN DIETA (ESPAÑOL)</label>
                                        <input type="text" value={formTitulo} onChange={(e)=>setFormTitulo(e.target.value)} className="w-full bg-[#131314] border border-white/10 rounded px-3 py-2 text-white outline-none focus:border-[#00daf3]" />
                                    </div>

                                    <div>
                                        <label className="text-[10px] text-[#bac9cc] font-bold uppercase tracking-wider mb-1 block">URL DE IMAGEN (OPCIONAL)</label>
                                        <input type="text" value={formImagenUrl} onChange={(e)=>setFormImagenUrl(e.target.value)} placeholder="https://..." className="w-full bg-[#131314] border border-white/10 rounded px-3 py-2 text-white outline-none focus:border-[#00daf3]" />
                                    </div>
                                    
                                    <div className="p-3 bg-[#131314]/50 border border-white/5 rounded-lg text-center">
                                        <span className="text-[10px] text-[#bac9cc] uppercase tracking-widest block font-bold">Energía Resultante</span>
                                        <span className="text-xl font-black text-white">{dinamicoKcal} kcal</span>
                                    </div>
                                </div>

                                <button onClick={agregarAlimentoAlPlan} className="w-full mt-6 bg-transparent border border-[#00daf3] text-[#00daf3] py-3 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-[#00daf3] hover:text-[#131314] transition-all flex justify-center items-center gap-2 shadow-[0_0_15px_rgba(0,218,243,0.05)]">
                                    <span className="material-symbols-outlined text-sm">add_circle</span> AÑADIR A {targetComida.toUpperCase()} ({formCantidad} {formUnidad})
                                </button>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                                <span className="material-symbols-outlined text-4xl mb-2">restaurant</span>
                                <p className="text-sm text-[#bac9cc]">Selecciona un elemento de la API para dosificar porciones.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}
    </div>
  );
}
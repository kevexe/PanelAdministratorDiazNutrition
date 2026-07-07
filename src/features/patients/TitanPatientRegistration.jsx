import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebase/firebase'; 
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { PAISES_DATA } from '../../constants/paisesData';

function TitanPatientRegistration() {
  const navigate = useNavigate();

  // ==========================================
  // 1. ESTADOS DE CONTROL GENERAL Y SISTEMA
  // ==========================================
  const [sysTime, setSysTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [codigoAcceso, setCodigoAcceso] = useState('');
  const [listaPaises, setListaPaises] = useState([]);
  
  // ==========================================
  // 2. ESTADOS DEL FORMULARIO: DATOS GENERALES
  // ==========================================
  const [nombre, setNombre] = useState('');
  const [identificacion, setIdentificacion] = useState('');
  const [sinDocumento, setSinDocumento] = useState(false);
  const [nacionalidad, setNacionalidad] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [edad, setEdad] = useState('--');
  const [sexo, setSexo] = useState('');
  const [direccion, setDireccion] = useState('');
  const [codigoPaisTel, setCodigoPaisTel] = useState('+503');
  const [telefono, setTelefono] = useState('');
  const [correo, setCorreo] = useState('');
  const [userExiste, setUserExiste] = useState(false);

  // ==========================================
  // 3. ESTADOS: HISTORIAL Y ESPECIFICACIONES
  // ==========================================
  const [especialista, setEspecialista] = useState('');
  const [cie10, setCie10] = useState('');
  const [condiciones, setCondiciones] = useState({
    Hipertensión: false,
    Diabetes: false,
    Cardiopatías: false,
    'Asma/Respiratorio': false,
    Hipotiroidismo: false,
    Hipertiroidismo: false,
    InsuficienciaRenal: false
  });
  const [alimentosNoDeseados, setAlimentosNoDeseados] = useState('');
  const [observacionesMedicas, setObservacionesMedicas] = useState('');
  const [modalidad, setModalidad] = useState('PRESENCIAL'); // 'PRESENCIAL' o 'ONLINE'

  // ==========================================
  // 4. ESTADOS: LABORATORIO ANTROPOMÉTRICO
  // ==========================================
  // Medidas Primarias
  const [peso, setPeso] = useState('');
  const [estatura, setEstatura] = useState('');
  const [imc, setImc] = useState('--');

  // Perímetros (cm)
  const [cintura, setCintura] = useState('');
  const [cadera, setCadera] = useState('');
  const [icc, setIcc] = useState('--');
  const [brazoRelajado, setBrazoRelajado] = useState('');
  const [brazoContraido, setBrazoContraido] = useState('');
  const [musloMedio, setMusloMedio] = useState('');
  const [pierna, setPierna] = useState('');
  const [cuello, setCuello] = useState('');

  // Pliegues Cutáneos (mm)
  const [tricep, setTricep] = useState('');
  const [bicep, setBicep] = useState('');
  const [subescapular, setSubescapular] = useState('');
  const [supraespinal, setSupraespinal] = useState('');
  const [abdominal, setAbdominal] = useState('');
  const [musloFrontal, setMusloFrontal] = useState('');
  const [pantorrillaMedia, setPantorrillaMedia] = useState('');

  // Planificación y Estrategia
  const [enfoqueDietoterapeutico, setEnfoqueDietoterapeutico] = useState('');
  const [metaCalorica, setMetaCalorica] = useState('');
  const [distribucionMacros, setDistribucionMacros] = useState('');

  // ==========================================
  // 5. EFECTOS Y LÓGICA DE AUTOMATIZACIÓN
  // ==========================================

  // Reloj del Sistema en tiempo real (Formato Clínico UTC)
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setSysTime(now.toISOString().slice(11, 19) + ' UTC');
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setLoading(true);
    try {
      if (PAISES_DATA && PAISES_DATA.length > 0) {
        const ordenados = [...PAISES_DATA].sort((a, b) => a.nombre.localeCompare(b.nombre));
        setListaPaises(ordenados);
      }
    } catch (err) {
      console.error("Error al cargar la lista local de países:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cálculo Dinámico de Edad
  useEffect(() => {
    if (!fechaNacimiento) {
      setEdad('--');
      return;
    }
    const birthDate = new Date(fechaNacimiento);
    const today = new Date();
    let computedAge = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      computedAge--;
    }
    setEdad(computedAge >= 0 ? `${computedAge} años` : '--');
  }, [fechaNacimiento]);

  // Cálculo Automatizado de Masa Corporal (IMC)
  useEffect(() => {
    const numPeso = parseFloat(peso);
    const numEstatura = parseFloat(estatura) / 100; // conversión a metros
    if (numPeso > 0 && numEstatura > 0) {
      setImc((numPeso / (numEstatura * numEstatura)).toFixed(2));
    } else {
      setImc('--');
    }
  }, [peso, estatura]);

  // Cálculo Automatizado de Índice Cintura-Cadera (ICC)
  useEffect(() => {
    const numCintura = parseFloat(cintura);
    const numCadera = parseFloat(cadera);
    if (numCintura > 0 && numCadera > 0) {
      setIcc((numCintura / numCadera).toFixed(2));
    } else {
      setIcc('--');
    }
  }, [cintura, cadera]);

  // Auditoría en tiempo real de Duplicidad de Correos en Base de Datos
  useEffect(() => {
    const verificarCorreo = async () => {
      if (!correo || !correo.includes('@')) {
        setUserExiste(false);
        return;
      }
      try {
        // Ahora buscamos en la colección global "usuarios"
        const q = query(collection(db, "usuarios"), where("correo", "==", correo.trim().toLowerCase()));
        const querySnapshot = await getDocs(q);
        setUserExiste(!querySnapshot.empty);
      } catch (error) {
        console.error("Error en auditoría de credenciales:", error);
      }
    };
    const timeoutId = setTimeout(verificarCorreo, 600);
    return () => clearTimeout(timeoutId);
  }, [correo]);

  // Generador de Token de Acceso Único para la App Móvil del Paciente
  const generarCodigoRandom = () => {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let resultado = 'TT-';
    for (let i = 0; i < 5; i++) {
      resultado += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    setCodigoAcceso(resultado);
  };

  const getIniciales = () => {
    if (!nombre) return 'PT';
    return nombre.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
  };

  const handleCheckboxChange = (condicion) => {
    setCondiciones((prev) => ({ ...prev, [condicion]: !prev[condicion] }));
  };

  const toggleDocumento = () => {
    setSinDocumento(!sinDocumento);
    if (!sinDocumento) {
      setIdentificacion('N/A (No Posee)');
    } else {
      setIdentificacion('');
    }
  };

  // ==========================================
  // 6. CONTROLADOR DE ENVÍO E INSERCIÓN CLOUD
  // ==========================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre.trim()) {
      alert("Error: El nombre legal completo es de carácter obligatorio.");
      return;
    }

    setLoading(true);

    const expedienteCompleto = {
      nombre: nombre.trim(),
      identificacion: identificacion.trim(),
      nacionalidad: nacionalidad,
      fechaNacimiento,
      edad,
      sexo,
      direccion: direccion.trim(),
      telefono: `${codigoPaisTel} ${telefono.trim()}`,
      correo: correo.trim().toLowerCase(),
      codigoAcceso: codigoAcceso || "Sin Código",
      auditoriaDuplicado: userExiste,
      createdAt: new Date().toISOString(),

      // ====================================================
      // 🔥 MAGIA DE LA NUEVA ARQUITECTURA DE ROLES 🔥
      // ====================================================
      estadoDeCuenta: "afiliado", // Se afilia automáticamente porque lo creó el Coach
      isActive: true,             // La cuenta nace activa y visible
      modalidad, // ⬅️ AGREGAR ESTA LÍNEA AQUÍ
      createdAt: new Date().toISOString(),
      // ====================================================
      
      historialClinico: {
        especialistaDerivacion: especialista.trim(),
        codigoCie10: cie10.trim(),
        condicionesPreexistentes: Object.keys(condiciones).filter((key) => condiciones[key]),
        alimentosNoDeseados: alimentosNoDeseados.trim(),
        observacionesMedicas: observacionesMedicas.trim()
      },
      antropometria: {
        peso: parseFloat(peso) || 0,
        estatura: parseFloat(estatura) || 0,
        imc: imc !== '--' ? parseFloat(imc) : 0,
        icc: icc !== '--' ? parseFloat(icc) : 0,
        perimetros: {
          cintura: parseFloat(cintura) || 0,
          cadera: parseFloat(cadera) || 0,
          brazoRelajado: parseFloat(brazoRelajado) || 0,
          brazoContraido: parseFloat(brazoContraido) || 0,
          musloMedio: parseFloat(musloMedio) || 0,
          pierna: parseFloat(pierna) || 0,
          cuello: parseFloat(cuello) || 0
        },
        pliegues: {
          tricep: parseFloat(tricep) || 0,
          bicep: parseFloat(bicep) || 0,
          subescapular: parseFloat(subescapular) || 0,
          supraespinal: parseFloat(supraespinal) || 0,
          abdominal: parseFloat(abdominal) || 0,
          musloFrontal: parseFloat(musloFrontal) || 0,
          pantorrillaMedia: parseFloat(pantorrillaMedia) || 0
        }
      },
      estrategiaNutricional: {
        enfoqueDietoterapeutico: enfoqueDietoterapeutico.trim(),
        metaCalorica: metaCalorica.trim(),
        distribucionMacros: distribucionMacros.trim()
      }
    };

    try {
      // Ahora lo enviamos a la colección aplanada "usuarios"
      await addDoc(collection(db, "usuarios"), expedienteCompleto);
      alert("¡Expediente Clínico guardado con éxito! El usuario ya es un Afiliado Activo.");
      navigate('/');
    } catch (error) {
      console.error("Error crítico al escribir en la base de datos: ", error);
      alert("Error del servidor al guardar el expediente.");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // 7. INTERFAZ GRÁFICA (COMPONENTE RENDERIZADO)
  // ==========================================
  return (
    <div className="min-h-screen bg-[#131314] text-[#e5e2e3] pb-32 font-sans selection:bg-[#00daf3]/30 selection:text-white">
      
      {/* BARRA SUPERIOR DE COMANDO CLÍNICO */}
      <header className="h-24 px-6 md:px-10 flex items-center justify-between border-b border-white/10 bg-[#131314]/90 backdrop-blur-xl sticky top-0 z-40">
        
        
        <div>
          <h2 className="text-xl font-black text-white uppercase tracking-wider">Alta y Registro de Paciente</h2>
          <p className="text-xs text-[#00daf3] font-mono tracking-widest mt-0.5">TITAN METABOLIC DASHBOARD</p>
        </div>
{/* SECTOR DE MODALIDAD: PRESENCIAL / VIRTUAL */}
<div className="flex flex-col gap-2">
          <label className="text-[10px] uppercase tracking-wider text-[#bac9cc] font-bold">
             Modalidad de Asesoría
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setModalidad('PRESENCIAL')}
              className={`py-3 text-xs font-black uppercase tracking-wider rounded-lg transition-all border ${
                modalidad === 'PRESENCIAL'
                  ? 'bg-[#00daf3]/10 border-[#00daf3] text-[#00daf3] shadow-[0_0_15px_rgba(0,218,243,0.15)]'
                  : 'bg-[#131314] border-white/10 text-slate-400 hover:text-white hover:border-white/20'
              }`}
            >
               Presencial
            </button>
            <button
              type="button"
              onClick={() => setModalidad('ONLINE')}
              className={`py-3 text-xs font-black uppercase tracking-wider rounded-lg transition-all border ${
                modalidad === 'ONLINE'
                  ? 'bg-purple-500/10 border-purple-500 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.15)]'
                  : 'bg-[#131314] border-white/10 text-slate-400 hover:text-white hover:border-white/20'
              }`}
            >
               Virtual (Online)
            </button>
          </div>
        </div>

        <button 
          onClick={() => navigate('/')} 
          className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider border border-white/20 rounded-lg hover:bg-white/5 transition-all text-[#bac9cc] hover:text-white"
        >
          Cancelar Transacción
        </button>
        
      </header>

      <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
        
        {/* PANEL DE MONITOREO EN TIEMPO REAL */}
        <section className="bg-[#201f20] border border-white/10 rounded-xl p-6 flex flex-col md:flex-row items-center gap-8 shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
          <div className="w-24 h-24 rounded-full bg-[#131314] border-2 border-[#00daf3] flex items-center justify-center text-[#00daf3] text-2xl font-black shadow-[0_0_20px_rgba(0,218,243,0.2)]">
            {getIniciales()}
          </div>
          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-6 w-full text-left">
            <div>
              <p className="text-[10px] font-bold text-[#bac9cc] uppercase tracking-widest mb-1">Estado del Proceso</p>
              <span className="px-2.5 py-1 bg-[#00daf3]/10 text-[#00daf3] font-mono text-[11px] rounded border border-[#00daf3]/30 inline-block font-bold">
                Escribiendo Registro...
              </span>
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#bac9cc] uppercase tracking-widest mb-1">Código de Acceso App</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-mono text-sm font-bold text-white tracking-wider">
                  {codigoAcceso || 'Sin Generar'}
                </span>
                <button 
                  onClick={generarCodigoRandom} 
                  type="button" 
                  className="px-2 py-0.5 text-[9px] bg-white/10 hover:bg-[#00daf3]/20 border border-white/10 text-white rounded font-mono uppercase transition-all"
                >
                  Generar
                </button>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#bac9cc] uppercase tracking-widest mb-1">Asignación Prof.</p>
              <p className="text-xs font-bold text-white">Staff Interdisciplinario</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#bac9cc] uppercase tracking-widest mb-1">Reloj de Sincronía</p>
              <p className="font-mono text-xs text-[#00daf3] font-bold">{sysTime || 'Calculando...'}</p>
            </div>
          </div>


          
        </section>

        {/* MODULO I: FILIACIÓN GENERAL Y DEMOGRAFÍA */}
        <section className="bg-[#201f20] border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-white flex items-center gap-2">
              <span className="text-[#00daf3]">👤</span> Filiación y Datos Demográficos
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="text-[10px] font-bold tracking-widest text-[#bac9cc] uppercase block mb-2">
                Nombre Legal Completo del Paciente
              </label>
              <input 
                type="text" 
                value={nombre} 
                onChange={(e) => setNombre(e.target.value)} 
                placeholder="Ej. Constanza María Rossi" 
                className="w-full bg-[#131314] border border-white/10 rounded-lg text-sm text-white px-4 py-3 focus:outline-none focus:border-[#00daf3] focus:ring-1 transition-all placeholder:text-white/20" 
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-[10px] font-bold tracking-widest text-[#bac9cc] uppercase block">
                  Documento Unico de Identidad
                </label>
                <button 
                  onClick={toggleDocumento} 
                  type="button" 
                  className={`text-[9px] px-2.5 py-0.5 rounded uppercase font-bold transition-all ${sinDocumento ? 'bg-amber-500/20 text-amber-500 border border-amber-500/50' : 'bg-white/5 text-[#bac9cc] border border-white/10 hover:bg-white/10'}`}
                >
                  {sinDocumento ? 'Habilitar Entrada' : 'No tiene'}
                </button>
              </div>
              <input 
                type="text" 
                disabled={sinDocumento} 
                value={identificacion} 
                onChange={(e) => setIdentificacion(e.target.value)} 
                placeholder="Ingrese Número identificador o RUT/DNI" 
                className={`w-full bg-[#131314] border rounded-lg text-sm text-white px-4 py-3 focus:outline-none transition-all placeholder:text-white/20 ${sinDocumento ? 'border-amber-500/30 opacity-40 select-none' : 'border-white/10 focus:border-[#00daf3]'}`} 
              />
            </div>

           {/* SELECTOR NACIONALIDAD */}
            <div className="mb-6">
              <label className="text-[10px] font-bold text-[#bac9cc] uppercase block mb-2">Nacionalidad</label>
              <select 
                value={nacionalidad} 
                onChange={(e) => setNacionalidad(e.target.value)} 
                className="w-full bg-[#201f20] border border-white/10 rounded-lg text-sm text-white px-4 py-3 focus:border-[#00daf3] outline-none"
                style={{ colorScheme: 'dark' }} // Esto ayuda a que el dropdown sea oscuro
              >
                <option value="" className="bg-[#131314]">Seleccione un país...</option>
                {listaPaises.map((p, i) => (
                  <option key={i} value={p.nombre} className="bg-[#131314]">{p.nombre}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold tracking-widest text-[#bac9cc] uppercase block mb-2">
                Fecha de Nacimiento
              </label>
              <input 
                type="date" 
                value={fechaNacimiento} 
                onChange={(e) => setFechaNacimiento(e.target.value)} 
                className="w-full bg-[#131314] border border-white/10 rounded-lg text-sm text-white px-4 py-3 focus:outline-none focus:border-[#00daf3] transition-all" 
                style={{ colorScheme: 'dark' }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold tracking-widest text-[#bac9cc] uppercase block mb-2">
                  Edad Calculada
                </label>
                <div className="w-full bg-[#131314]/50 border border-white/5 rounded-lg text-sm text-[#00daf3] font-bold font-mono px-4 py-3 text-center">
                  {edad}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold tracking-widest text-[#bac9cc] uppercase block mb-2">
                  Sexo Biológico
                </label>
                <select 
                  value={sexo} 
                  onChange={(e) => setSexo(e.target.value)} 
                  className="w-full bg-[#131314] border border-white/10 rounded-lg text-sm text-white px-4 py-3 focus:outline-none focus:border-[#00daf3] transition-all"
                  style={{ colorScheme: 'dark' }}
                >
                  <option value="">Seleccionar</option>
                  <option value="Masculino" className="bg-[#201f20]">Masculino</option>
                  <option value="Femenino" className="bg-[#201f20]">Femenino</option>
                </select>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="text-[10px] font-bold tracking-widest text-[#bac9cc] uppercase block mb-2">
                Dirección Residencial Completa
              </label>
              <input 
                type="text" 
                value={direccion} 
                onChange={(e) => setDireccion(e.target.value)} 
                placeholder="Calle, avenida, zona, número de residencia..." 
                className="w-full bg-[#131314] border border-white/10 rounded-lg text-sm text-white px-4 py-3 focus:outline-none focus:border-[#00daf3] transition-all" 
              />
            </div>

            {/* SELECTOR CÓDIGO TELEFONO */}
            <div>
              <label className="text-[10px] font-bold text-[#bac9cc] uppercase block mb-2">Código Teléfono</label>
              <div className="flex gap-2">
                <select 
                  value={codigoPaisTel} 
                  onChange={(e) => setCodigoPaisTel(e.target.value)} 
                  className="w-[120px] bg-[#201f20] border border-white/10 rounded-lg text-sm text-white px-2 py-3 focus:border-[#00daf3] outline-none"
                  style={{ colorScheme: 'dark' }}
                >
                  {listaPaises.map((p, i) => (
                    <option key={i} value={p.codigoTel} className="bg-[#131314]">{p.codigoTel} ({p.nombre.slice(0,3)})</option>
                  ))}
                </select>
                <input 
                  type="tel"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  className="flex-1 bg-[#131314] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00daf3]" 
                  placeholder="Número..." 
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-[10px] font-bold tracking-widest text-[#bac9cc] uppercase block">
                  Correo Electrónico de Contacto
                </label>
                {userExiste && (
                  <span className="text-[9px] font-mono text-amber-400 font-bold tracking-wider animate-pulse">
                    [EXPEDIENTE EXISTENTE]
                  </span>
                )}
              </div>
              <input 
                type="email" 
                value={correo} 
                onChange={(e) => setCorreo(e.target.value)} 
                placeholder="paciente@dominio.com" 
                className={`w-full bg-[#131314] border rounded-lg text-sm text-white px-4 py-3 focus:outline-none transition-all placeholder:text-white/20 ${userExiste ? 'border-amber-500/50 focus:border-amber-500' : 'border-white/10 focus:border-[#00daf3]'}`} 
              />
            </div>
          </div>
        </section>

        {/* MODULO II: FILTRO METABÓLICO, ESPECIALISTA Y PREFERENCIAS ALIMENTARIAS */}
        <section className="bg-[#201f20] border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-white flex items-center gap-2">
              <span className="text-[#00daf3]">⚕️</span> Historial Interdisciplinario y Filtro Dietético
            </h3>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#131314] p-4 rounded-xl border border-white/5">
                <label className="text-[10px] font-bold tracking-widest text-[#bac9cc] uppercase block mb-2">
                  Especialista de Derivación / Tratante
                </label>
                <input 
                  type="text" 
                  value={especialista} 
                  onChange={(e) => setEspecialista(e.target.value)} 
                  placeholder="Ej. Dr. Alejandro Delgado (Endocrinólogo)" 
                  className="w-full bg-[#201f20] border border-white/10 rounded-lg text-sm text-white px-4 py-2.5 focus:outline-none focus:border-[#00daf3]" 
                />
              </div>
              <div className="bg-[#131314] p-4 rounded-xl border border-white/5">
                <label className="text-[10px] font-bold tracking-widest text-[#bac9cc] uppercase block mb-2">
                  Código de Diagnóstico Internacional CIE-10
                </label>
                <input 
                  type="text" 
                  value={cie10} 
                  onChange={(e) => setCie10(e.target.value)} 
                  placeholder="Ej. E66.0 (Obesidad por exceso calórico)" 
                  className="w-full bg-[#201f20] border border-white/10 rounded-lg text-sm text-white px-4 py-2.5 focus:outline-none focus:border-[#00daf3]" 
                />
              </div>
            </div>

            <div className="bg-[#131314] p-5 rounded-xl border border-white/5">
              <label className="text-[10px] font-bold tracking-widest text-white uppercase block mb-4">
                Condiciones Clínicas / Patologías Detectadas
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {Object.keys(condiciones).map((cond, i) => (
                  <label key={i} className="flex items-center gap-3 cursor-pointer group p-3 rounded-lg bg-[#201f20] hover:bg-[#00daf3]/5 border border-white/5 hover:border-[#00daf3]/20 transition-all">
                    <input 
                      type="checkbox" 
                      checked={condiciones[cond]} 
                      onChange={() => handleCheckboxChange(cond)} 
                      className="w-4 h-4 rounded bg-[#131314] border-white/20 text-[#00daf3] focus:ring-0 focus:ring-offset-0" 
                    />
                    <span className="text-xs text-[#e5e2e3] font-medium">{cond}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-amber-500/20 bg-amber-500/5 p-4 rounded-xl">
                <label className="text-[10px] font-bold tracking-widest text-amber-400 uppercase block mb-2">
                  Alimentos que no le gustan o no quiere en la dieta
                </label>
                <textarea 
                  value={alimentosNoDeseados} 
                  onChange={(e) => setAlimentosNoDeseados(e.target.value)} 
                  placeholder="Describa alimentos específicos, texturas o ingredientes que el paciente rechaza abiertamente para la estructuración de sus menús..." 
                  className="w-full bg-[#131314] border border-amber-500/20 focus:border-amber-500 rounded-lg text-xs text-white px-4 py-3 h-28 resize-none focus:outline-none transition-all placeholder:text-white/10" 
                />
              </div>
              <div>
                <label className="text-[10px] font-bold tracking-widest text-[#bac9cc] uppercase block mb-2">
                  Observaciones Clínicas / Historial de Lesiones
                </label>
                <textarea 
                  value={observacionesMedicas} 
                  onChange={(e) => setObservacionesMedicas(e.target.value)} 
                  placeholder="Historial de cirugías pasadas, dolores articulares recurrentes, contraindicaciones posturales o fármacos consumidos actualmente..." 
                  className="w-full bg-[#131314] border border-white/10 rounded-lg text-xs text-white px-4 py-3 h-28 resize-none focus:outline-none focus:border-[#00daf3] transition-all placeholder:text-white/10" 
                />
              </div>
            </div>
          </div>
        </section>

        {/* MODULO III: LABORATORIO ANTROPOMÉTRICO EXPANSIÓN COMPLETA */}
        <section className="bg-[#201f20] border-2 border-[#00daf3]/20 rounded-xl p-6 shadow-[0_4px_30px_rgba(0,218,243,0.05)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-4 mb-6 gap-2">
            <div>
              <h3 className="text-base font-black text-[#00daf3] uppercase tracking-wider">Módulo de Cineantropometría</h3>
              <p className="text-[10px] text-[#bac9cc]">Análisis morfológico del tejido adiposo y muscular</p>
            </div>
            <span className="px-3 py-1 bg-[#00daf3]/10 text-[#00daf3] text-[9px] font-mono tracking-widest font-black rounded border border-[#00daf3]/30 self-start sm:self-center">
              ISAK BIOMETRIC COMPLIANT
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* MEDIDAS BASE */}
            <div className="lg:col-span-4 bg-[#131314] p-5 rounded-xl border border-white/5 space-y-4">
              <h4 className="text-[10px] font-bold tracking-widest text-white border-b border-white/5 pb-2 mb-2 uppercase">
                Metodología Primaria
              </h4>
              <div>
                <label className="text-[10px] font-bold text-[#bac9cc] block mb-1">Masa Corporal Total / Peso (kg)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  value={peso} 
                  onChange={(e) => setPeso(e.target.value)} 
                  placeholder="0.00" 
                  className="w-full bg-[#201f20] border border-white/10 rounded-lg text-base font-mono font-bold text-[#00daf3] px-4 py-2.5 focus:outline-none" 
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#bac9cc] block mb-1">Talla Estructural / Estatura (cm)</label>
                <input 
                  type="number" 
                  step="0.1" 
                  value={estatura} 
                  onChange={(e) => setEstatura(e.target.value)} 
                  placeholder="0.0" 
                  className="w-full bg-[#201f20] border border-white/10 rounded-lg text-base font-mono font-bold text-[#00daf3] px-4 py-2.5 focus:outline-none" 
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-[#201f20] p-3 rounded-lg border border-white/5 text-center">
                  <p className="text-[9px] font-bold text-[#bac9cc] uppercase tracking-wider mb-0.5">IMC Index</p>
                  <p className="font-mono text-base font-black text-[#00daf3]">{imc}</p>
                </div>
                <div className="bg-[#201f20] p-3 rounded-lg border border-white/5 text-center">
                  <p className="text-[9px] font-bold text-[#bac9cc] uppercase tracking-wider mb-0.5">ICC Relación</p>
                  <p className="font-mono text-base font-black text-[#00daf3]">{icc}</p>
                </div>
              </div>
            </div>

            {/* SECCIÓN DETALLADA DE PERÍMETROS */}
            <div className="lg:col-span-4 bg-[#131314] p-5 rounded-xl border border-white/5">
              <h4 className="text-[10px] font-bold tracking-widest text-white border-b border-white/5 pb-2 mb-4 uppercase">
                Perímetros Seccionales (cm)
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs text-[#bac9cc]">Cintura Escapular</span>
                  <input type="number" step="0.1" value={cintura} onChange={(e) => setCintura(e.target.value)} placeholder="0.0" className="w-24 bg-[#201f20] border border-white/10 rounded px-2.5 py-1.5 text-right font-mono text-xs text-white" />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs text-[#bac9cc]">Cadera / Glúteo</span>
                  <input type="number" step="0.1" value={cadera} onChange={(e) => setCadera(e.target.value)} placeholder="0.0" className="w-24 bg-[#201f20] border border-white/10 rounded px-2.5 py-1.5 text-right font-mono text-xs text-white" />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs text-[#bac9cc]">Brazo Relajado</span>
                  <input type="number" step="0.1" value={brazoRelajado} onChange={(e) => setBrazoRelajado(e.target.value)} placeholder="0.0" className="w-24 bg-[#201f20] border border-white/10 rounded px-2.5 py-1.5 text-right font-mono text-xs text-white" />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs text-[#bac9cc]">Brazo Flex. Máx.</span>
                  <input type="number" step="0.1" value={brazoContraido} onChange={(e) => setBrazoContraido(e.target.value)} placeholder="0.0" className="w-24 bg-[#201f20] border border-white/10 rounded px-2.5 py-1.5 text-right font-mono text-xs text-white" />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs text-[#bac9cc]">Muslo Medial</span>
                  <input type="number" step="0.1" value={musloMedio} onChange={(e) => setMusloMedio(e.target.value)} placeholder="0.0" className="w-24 bg-[#201f20] border border-white/10 rounded px-2.5 py-1.5 text-right font-mono text-xs text-white" />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs text-[#bac9cc]">Pantorrilla Máx</span>
                  <input type="number" step="0.1" value={pierna} onChange={(e) => setPierna(e.target.value)} placeholder="0.0" className="w-24 bg-[#201f20] border border-white/10 rounded px-2.5 py-1.5 text-right font-mono text-xs text-white" />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs text-[#bac9cc]">Perímetro Cuello</span>
                  <input type="number" step="0.1" value={cuello} onChange={(e) => setCuello(e.target.value)} placeholder="0.0" className="w-24 bg-[#201f20] border border-white/10 rounded px-2.5 py-1.5 text-right font-mono text-xs text-white" />
                </div>
              </div>
            </div>

            {/* SECCIÓN DETALLADA DE PLIEGUES */}
            <div className="lg:col-span-4 bg-[#131314] p-5 rounded-xl border border-white/5">
              <h4 className="text-[10px] font-bold tracking-widest text-white border-b border-white/5 pb-2 mb-4 uppercase">
                Pliegues Adiposos (mm)
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs text-[#bac9cc]">Pliegue Tríceps</span>
                  <input type="number" step="0.1" value={tricep} onChange={(e) => setTricep(e.target.value)} placeholder="0.0" className="w-24 bg-[#201f20] border border-white/10 rounded px-2.5 py-1.5 text-right font-mono text-xs text-[#00daf3]" />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs text-[#bac9cc]">Pliegue Bíceps</span>
                  <input type="number" step="0.1" value={bicep} onChange={(e) => setBicep(e.target.value)} placeholder="0.0" className="w-24 bg-[#201f20] border border-white/10 rounded px-2.5 py-1.5 text-right font-mono text-xs text-[#00daf3]" />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs text-[#bac9cc]">Subescapular</span>
                  <input type="number" step="0.1" value={subescapular} onChange={(e) => setSubescapular(e.target.value)} placeholder="0.0" className="w-24 bg-[#201f20] border border-white/10 rounded px-2.5 py-1.5 text-right font-mono text-xs text-[#00daf3]" />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs text-[#bac9cc]">Supraespinal</span>
                  <input type="number" step="0.1" value={supraespinal} onChange={(e) => setSupraespinal(e.target.value)} placeholder="0.0" className="w-24 bg-[#201f20] border border-white/10 rounded px-2.5 py-1.5 text-right font-mono text-xs text-[#00daf3]" />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs text-[#bac9cc]">Abdominal</span>
                  <input type="number" step="0.1" value={abdominal} onChange={(e) => setAbdominal(e.target.value)} placeholder="0.0" className="w-24 bg-[#201f20] border border-white/10 rounded px-2.5 py-1.5 text-right font-mono text-xs text-[#00daf3]" />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs text-[#bac9cc]">Muslo Frontal</span>
                  <input type="number" step="0.1" value={musloFrontal} onChange={(e) => setMusloFrontal(e.target.value)} placeholder="0.0" className="w-24 bg-[#201f20] border border-white/10 rounded px-2.5 py-1.5 text-right font-mono text-xs text-[#00daf3]" />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs text-[#bac9cc]">Pantorrilla Med.</span>
                  <input type="number" step="0.1" value={pantorrillaMedia} onChange={(e) => setPantorrillaMedia(e.target.value)} placeholder="0.0" className="w-24 bg-[#201f20] border border-white/10 rounded px-2.5 py-1.5 text-right font-mono text-xs text-[#00daf3]" />
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* MODULO IV: TELEMETRÍA Y PROYECCIÓN METABÓLICA */}
        <section className="bg-[#201f20] border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-white flex items-center gap-2">
              <span className="text-[#00daf3]">📊</span> Proyección de Tejidos y Diagnóstico Gráfico
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-[#131314] rounded-xl p-8 border border-white/5 flex flex-col items-center justify-center min-h-[180px] relative overflow-hidden">
              <p className="text-xs font-mono text-[#bac9cc] z-10 uppercase tracking-widest">Gráfica de Transición Antropométrica</p>
              <p className="text-[11px] text-white/30 z-10 mt-1 text-center max-w-md">
                Requiere almacenar la primera consulta para trazar las curvas macro métricas comparativas del paciente.
              </p>
              <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:20px_20px]"></div>
            </div>
            <div className="bg-[#131314] rounded-xl p-6 border border-white/5 flex flex-col items-center justify-center text-center">
              <p className="text-xs font-mono text-[#bac9cc] uppercase tracking-widest mb-4">Composición Somatotipo</p>
              <div className="w-24 h-24 rounded-full border-4 border-white/5 relative flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-[#00daf3] border-t-transparent border-r-transparent opacity-30 rotate-45 animate-spin duration-1000"></div>
                <span className="font-mono text-[9px] text-[#00daf3] font-bold">MONITOR READY</span>
              </div>
            </div>
          </div>
        </section>

        {/* MODULO V: PLANIFICACIÓN DIETOTERAPÉUTICA ESTRATÉGICA */}
        <section className="bg-[#201f20] border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-white flex items-center gap-2">
              <span className="text-[#00daf3]">📝</span> Estrategia de Prescripción Nutricional
            </h3>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <label className="text-[10px] font-bold tracking-widest text-white uppercase block mb-2">
                Enfoque Dietoterapéutico y Justificación
              </label>
              <textarea 
                value={enfoqueDietoterapeutico} 
                onChange={(e) => setEnfoqueDietoterapeutico(e.target.value)} 
                placeholder="Prescripción del plan: Déficit energético controlado, dieta hiperproteica, balance hídrico, etc..." 
                className="w-full bg-[#131314] border border-white/10 rounded-lg text-xs text-white px-4 py-3 h-36 resize-none focus:outline-none focus:border-[#00daf3] placeholder:text-white/20" 
              />
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold tracking-widest text-[#bac9cc] uppercase block mb-1.5">
                  Meta Calórica Base (kcal)
                </label>
                <input 
                  type="text" 
                  value={metaCalorica} 
                  onChange={(e) => setMetaCalorica(e.target.value)} 
                  placeholder="Ej. 2100 kcal / día" 
                  className="w-full bg-[#131314] border border-white/10 rounded-lg text-xs text-white px-4 py-2.5 focus:outline-none focus:border-[#00daf3]" 
                />
              </div>
              <div>
                <label className="text-[10px] font-bold tracking-widest text-[#bac9cc] uppercase block mb-1.5">
                  Distribución Porcentual Macros
                </label>
                <input 
                  type="text" 
                  value={distribucionMacros} 
                  onChange={(e) => setDistribucionMacros(e.target.value)} 
                  placeholder="Ej. P: 30%, C: 40%, F: 30%" 
                  className="w-full bg-[#131314] border border-white/10 rounded-lg text-xs text-white px-4 py-2.5 focus:outline-none focus:border-[#00daf3]" 
                />
              </div>
            </div>
          </div>
        </section>

      </div>

      {/* FOOTER ANCLADO DE OPERACIONES CLOUD */}
      <footer className="fixed bottom-0 left-0 right-0 h-24 bg-[#201f20]/95 backdrop-blur-xl border-t border-white/10 z-50 px-6 md:px-10 flex items-center justify-between shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-3">
          <span className={`inline-block w-2 h-2 rounded-full ${loading ? 'bg-cyan-400 animate-spin' : 'bg-emerald-500 animate-pulse'}`}></span>
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#bac9cc]">
            {loading ? 'Transmitiendo datos encriptados...' : 'Ficha Sincronizada Localmente'}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            type="button" 
            className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-[#bac9cc] bg-[#131314] border border-white/10 rounded-lg hover:bg-white/5 transition-all hidden sm:block"
          >
            Imprimir Reporte
          </button>
          <button 
            onClick={handleSubmit} 
            disabled={loading} 
            className="px-6 py-3 bg-[#00daf3] text-[#131314] text-xs font-black uppercase tracking-widest rounded-lg font-sans shadow-[0_0_20px_rgba(0,218,243,0.3)] hover:bg-[#c3f5ff] transition-all disabled:opacity-40"
          >
            {loading ? 'Escribiendo...' : 'Guardar Expediente'}
          </button>
        </div>
      </footer>

    </div>
  );
}

export default TitanPatientRegistration;
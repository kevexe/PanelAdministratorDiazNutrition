import { useState, useEffect } from 'react'
import { db, auth } from './firebase' 
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore'
import { signInWithEmailAndPassword } from "firebase/auth";
import './App.css'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [cargando, setCargando] = useState(false);
  const [pacientes, setPacientes] = useState([])
  
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);
  const [vistaActual, setVistaActual] = useState("expediente"); 

  // ESTADOS PARA LA PORTADA (Arriba)
  const [nuevaPortada, setNuevaPortada] = useState({ titulo: "", descripcion: "", imagenUrl: "" });
  const [planCreado, setPlanCreado] = useState(null); 

  // ESTADOS PARA LAS COMIDAS (Abajo)
  const [tipoComida, setTipoComida] = useState("Desayuno"); 
  const [nuevaComida, setNuevaComida] = useState({ titulo: "", descripcion: "", imagenUrl: "" });

  const handleLogin = async () => {
    const emailInput = document.getElementById('user');
    const passInput = document.getElementById('pass');
    if (!emailInput || !passInput) return;
    
    try {
      await signInWithEmailAndPassword(auth, emailInput.value, passInput.value);
      setIsLoggedIn(true);
    } catch (error) {
      alert("Acceso denegado: Usuario o contraseña incorrectos");
    }
  };

  const obtenerPacientes = async () => {
    setCargando(true);
    try {
      const querySnapshot = await getDocs(collection(db, "Clientes"));
      const lista = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPacientes(lista);
    } catch (error) {
      console.error("Error al obtener clientes:", error);
    }
    setCargando(false);
  };

  // FUNCION PARA GUARDAR SECCION 1 (PORTADA)
  const guardarPortada = async () => {
    if (!pacienteSeleccionado) return alert("Selecciona un paciente primero");
    if (!nuevaPortada.titulo || !nuevaPortada.imagenUrl) return alert("Ponle título e imagen a la portada");

    try {
      const planesRef = collection(db, "Clientes", pacienteSeleccionado.id, "Planes");
      const docRef = await addDoc(planesRef, {
        titulo: nuevaPortada.titulo,
        descripcion: nuevaPortada.descripcion,
        imagenUrl: nuevaPortada.imagenUrl,
        fecha: serverTimestamp(),
        tipo: "portada_dieta"
      });

      alert("¡Portada creada! Todas las comidas que agregues abajo se guardarán dentro de esta portada.");
      setPlanCreado({ id: docRef.id, titulo: nuevaPortada.titulo }); 
    } catch (error) {
      console.error("Error al guardar portada:", error);
      alert("Hubo un error al crear la portada");
    }
  };

  // FUNCION PARA GUARDAR SECCION 2 (COMIDAS - INTELIGENTE)
  const guardarComida = async () => {
    if (!nuevaComida.titulo || !nuevaComida.imagenUrl) return alert("Faltan datos de la comida");

    try {
      if (planCreado) {
        // MODO 1: Hay portada creada, lo guardamos ADENTRO
        const comidasRef = collection(db, "Clientes", pacienteSeleccionado.id, "Planes", planCreado.id, "Comidas");
        await addDoc(comidasRef, {
          titulo: nuevaComida.titulo,
          descripcion: nuevaComida.descripcion,
          imagenUrl: nuevaComida.imagenUrl,
          tiempoComida: tipoComida,
          fecha: serverTimestamp(),
          tipo: "opcion_comida"
        });
        alert(`¡${tipoComida} agregado exitosamente a la portada "${planCreado.titulo}"!`);
      } else {
        // MODO 2: Se saltaron la portada, lo guardamos como TARJETA SUELTA (Directo en Planes)
        const planesRef = collection(db, "Clientes", pacienteSeleccionado.id, "Planes");
        await addDoc(planesRef, {
          titulo: nuevaComida.titulo,
          descripcion: nuevaComida.descripcion,
          imagenUrl: nuevaComida.imagenUrl,
          tiempoComida: tipoComida,
          fecha: serverTimestamp(),
          tipo: "opcion_comida_suelta"
        });
        alert(`¡${tipoComida} enviado como tarjeta individual a ${pacienteSeleccionado.Nombre}!`);
      }
      
      // Limpiamos el formulario para la siguiente comida
      setNuevaComida({ titulo: "", descripcion: "", imagenUrl: "" }); 
    } catch (error) {
      console.error("Error al guardar comida:", error);
      alert("Hubo un error al guardar la comida");
    }
  };

  useEffect(() => {
    if (isLoggedIn) obtenerPacientes();
  }, [isLoggedIn]);

  if (!isLoggedIn) {
    return (
      <div className="login-container">
        <img src="/Logo.png" alt="Logo" className="logo-teamdiaz" />
        <div className="glass-card">
          <h2>ACCESO NUTRICIONISTA</h2>
          <div className="input-group">
            <input type="email" id="user" placeholder="Usuario o Correo" />
            <input type="password" id="pass" placeholder="Contraseña" />
          </div>
          <button className="apple-btn" onClick={handleLogin}>ENTRAR</button>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-layout" style={{ display: 'flex', width: '100vw', minHeight: '100vh', overflowX: 'hidden' }}>
      
      {/* BARRA LATERAL IZQUIERDA */}
      <aside className="sidebar" style={{ width: '250px', flexShrink: 0 }}>
        <div className="search-box">
          <input type="text" placeholder="Buscar..." onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="patient-list">
          <h3>Clientes</h3>
          {cargando ? <p>Cargando lista...</p> : 
            pacientes.map(p => (
              <div 
                key={p.id} 
                className={`patient-item ${pacienteSeleccionado?.id === p.id ? 'active' : ''}`}
                onClick={() => {
                  setPacienteSeleccionado(p);
                  setVistaActual("expediente"); 
                  setPlanCreado(null); 
                  setNuevaPortada({ titulo: "", descripcion: "", imagenUrl: "" });
                  setNuevaComida({ titulo: "", descripcion: "", imagenUrl: "" });
                }}
              >
                {p.Nombre || "Cliente sin nombre"} 
              </div>
            ))
          }
        </div>
        <button className="logout-link" onClick={() => setIsLoggedIn(false)}>Cerrar Sesión</button>
      </aside>

      {/* PANEL CENTRAL DINÁMICO */}
      <main className="main-content" style={{ flex: 1, padding: '40px', boxSizing: 'border-box' }}>
        {pacienteSeleccionado ? (
          vistaActual === "expediente" ? (
            // VISTA 1: EXPEDIENTE
            <div className="view-container">
              <header className="main-header">
                <h1>Expediente: {pacienteSeleccionado.Nombre} {pacienteSeleccionado.Apellido}</h1>
                <button className="update-btn" onClick={() => {
                  setVistaActual("crear-tarjeta");
                  setPlanCreado(null);
                }}>
                  + Crear Nuevo Plan de Alimentación
                </button>
              </header>
              <section className="stats-grid">
                <div className="stat-card"><h4>Estatura</h4><p>{pacienteSeleccionado.Estatura || 0} cm</p></div>
                <div className="stat-card"><h4>Peso</h4><p>{pacienteSeleccionado.Peso || 0} kg</p></div>
                <div className="stat-card"><h4>Meta</h4><p>{pacienteSeleccionado.Meta_Objetivo || "No definida"}</p></div>
              </section>
            </div>
          ) : (
            // VISTA 2: CREADOR DIVIDIDO EN DOS SECCIONES
            <div className="view-container" style={{ width: '100%', paddingBottom: '100px' }}>
              <header className="main-header">
                <h1>Diseñando para {pacienteSeleccionado.Nombre}</h1>
                <button className="back-btn" onClick={() => setVistaActual("expediente")} style={{padding: '8px 16px', cursor:'pointer'}}>
                   Terminar y Volver al Expediente
                </button>
              </header>

              {/* =========================================
                  SECCIÓN 1: PORTADA PRINCIPAL (ARRIBA)
                  ========================================= */}
              <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#1a1a1a', borderRadius: '15px' }}>
                <h2 style={{ color: '#ff9800', borderBottom: '1px solid #333', paddingBottom: '10px', fontSize: '20px' }}>
                  Opción A: Crear Plan Completo (Carpeta)
                </h2>
                <div className="editor-grid" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%', marginTop: '20px' }}>
                  
                  {/* FORMULARIO PORTADA */}
                  <div className="form-inputs" style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '50%' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      <label style={{ fontWeight: 'bold' }}>Título del Plan</label>
                      <input type="text" placeholder="Ej: Dieta de Volumen Abril" value={nuevaPortada.titulo} onChange={(e) => setNuevaPortada({...nuevaPortada, titulo: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ccc', backgroundColor: '#222', color: 'white' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      <label style={{ fontWeight: 'bold' }}>Descripción o Mensaje</label>
                      <textarea placeholder="Escribe un resumen o palabras de ánimo..." value={nuevaPortada.descripcion} onChange={(e) => setNuevaPortada({...nuevaPortada, descripcion: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ccc', minHeight: '80px', backgroundColor: '#222', color: 'white' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      <label style={{ fontWeight: 'bold' }}>Link de la Imagen (URL)</label>
                      <input type="text" placeholder="https://ejemplo.com/foto.jpg" value={nuevaPortada.imagenUrl} onChange={(e) => setNuevaPortada({...nuevaPortada, imagenUrl: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ccc', backgroundColor: '#222', color: 'white' }} />
                    </div>
                  </div>

                  {/* PREVIEW PORTADA */}
                  <div className="mobile-preview-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '350px' }}>
                     <h3 style={{ marginBottom: '10px' }}>Preview Portada</h3>
                     <div className="mockup-phone" style={{ border: '10px solid #222', borderRadius: '35px', padding: '15px', width: '280px', height: '480px', backgroundColor: '#121212', color: 'white' }}>
                        <div className="app-card-preview" style={{ backgroundColor: '#1e1e1e', borderRadius: '20px', overflow: 'hidden' }}>
                          {nuevaPortada.imagenUrl ? 
                            <img src={nuevaPortada.imagenUrl} alt="Preview" style={{ width: '100%', height: '180px', objectFit: 'cover' }}/> 
                            : <div style={{ width: '100%', height: '180px', backgroundColor: '#2d2d2d', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>Sin Imagen</div>
                          }
                          <div className="card-info" style={{ padding: '15px' }}>
                             <h4 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#fff' }}>{nuevaPortada.titulo || "Título Portada"}</h4>
                             <p style={{ margin: '0', fontSize: '14px', color: '#aaa' }}>{nuevaPortada.descripcion || "Descripción..."}</p>
                          </div>
                        </div>
                     </div>
                     <button onClick={guardarPortada} style={{ marginTop: '20px', padding: '12px 24px', backgroundColor: planCreado ? '#4CAF50' : '#ff9800', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', width: '280px' }}>
                        {planCreado ? "✅ Portada Lista" : "🚀 Crear Portada"}
                     </button>
                  </div>
                </div>
              </div>


              {/* =========================================
                  SECCIÓN 2: COMIDAS (ABAJO)
                  ========================================= */}
              {/* ¡Magia! Ya no tiene el opacity 0.4 ni está bloqueado */}
              <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#1a1a1a', borderRadius: '15px' }}>
                <h2 style={{ color: '#4CAF50', borderBottom: '1px solid #333', paddingBottom: '10px', fontSize: '20px' }}>
                  Opción B: Agregar Comida 
                </h2>
                
                {/* Texto dinámico para que el nutri sepa qué va a pasar */}
                <p style={{color: '#aaa', fontStyle: 'italic', marginTop: '10px'}}>
                  {planCreado 
                    ? <span>Destino: Guardando dentro de la portada <strong>"{planCreado.titulo}"</strong></span> 
                    : <span>Destino: Se enviará como una <strong>Tarjeta Individual Suelta</strong> (Sin Portada)</span>
                  }
                </p>
                
                <div className="editor-grid" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%', marginTop: '20px' }}>
                  
                  {/* FORMULARIO COMIDAS */}
                  <div className="form-inputs" style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '50%' }}>
                    
                    {/* BOTONES DE TIEMPO */}
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
                      {['Desayuno', 'Almuerzo', 'Cena', 'Snack'].map((tipo) => (
                        <button key={tipo} onClick={() => setTipoComida(tipo)}
                          style={{
                            padding: '10px 15px', borderRadius: '8px', border: 'none',
                            backgroundColor: tipoComida === tipo ? '#4CAF50' : '#333', color: 'white',
                            cursor: 'pointer', fontWeight: 'bold', transition: '0.2s'
                          }}>
                          {tipo}
                        </button>
                      ))}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      <label style={{ fontWeight: 'bold' }}>Título de la Opción</label>
                      <input type="text" placeholder="Ej: Huevos con espinaca" value={nuevaComida.titulo} onChange={(e) => setNuevaComida({...nuevaComida, titulo: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ccc', backgroundColor: '#222', color: 'white' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      <label style={{ fontWeight: 'bold' }}>Ingredientes / Preparación</label>
                      <textarea placeholder="Describe los detalles de la receta..." value={nuevaComida.descripcion} onChange={(e) => setNuevaComida({...nuevaComida, descripcion: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ccc', minHeight: '100px', backgroundColor: '#222', color: 'white' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      <label style={{ fontWeight: 'bold' }}>Link de la Imagen (URL)</label>
                      <input type="text" placeholder="https://ejemplo.com/foto.jpg" value={nuevaComida.imagenUrl} onChange={(e) => setNuevaComida({...nuevaComida, imagenUrl: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ccc', backgroundColor: '#222', color: 'white' }} />
                    </div>
                  </div>

                  {/* PREVIEW COMIDAS */}
                  <div className="mobile-preview-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '350px' }}>
                     <h3 style={{ marginBottom: '10px' }}>Preview Comida</h3>
                     <div className="mockup-phone" style={{ border: '10px solid #222', borderRadius: '35px', padding: '15px', width: '280px', height: '480px', backgroundColor: '#121212', color: 'white', position: 'relative' }}>
                        <div className="app-card-preview" style={{ backgroundColor: '#1e1e1e', borderRadius: '20px', overflow: 'hidden', position: 'relative' }}>
                          
                          <div style={{ position: 'absolute', top: '10px', left: '10px', backgroundColor: 'rgba(0,0,0,0.7)', padding: '5px 10px', borderRadius: '15px', fontSize: '12px', fontWeight: 'bold', color: '#4CAF50', zIndex: 2 }}>
                            {tipoComida}
                          </div>

                          {nuevaComida.imagenUrl ? 
                            <img src={nuevaComida.imagenUrl} alt="Preview" style={{ width: '100%', height: '180px', objectFit: 'cover' }}/> 
                            : <div style={{ width: '100%', height: '180px', backgroundColor: '#2d2d2d', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>Sin Imagen</div>
                          }
                          <div className="card-info" style={{ padding: '15px' }}>
                             <h4 style={{ margin: '0 0 10px 0', fontSize: '18px', color: '#fff' }}>{nuevaComida.titulo || "Receta..."}</h4>
                             <p style={{ margin: '0', fontSize: '14px', color: '#aaa' }}>{nuevaComida.descripcion || "Ingredientes..."}</p>
                          </div>
                        </div>
                     </div>
                     
                     {/* EL BOTÓN CAMBIA DE TEXTO PARA SER MÁS CLARO */}
                     <button onClick={guardarComida} style={{ marginTop: '20px', padding: '12px 24px', backgroundColor: planCreado ? '#2196F3' : '#9c27b0', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', width: '280px' }}>
                        {planCreado ? "➕ Agregar a la Portada" : "🚀 Enviar Tarjeta Individual"}
                     </button>
                  </div>
                </div>
              </div>

            </div>
          )
        ) : (
          <div className="select-prompt" style={{textAlign: 'center', marginTop: '50px', fontSize: '20px', color: '#666'}}>
            Selecciona un cliente de la lista para comenzar
          </div>
        )}
      </main>
    </div>
  )
}

export default App
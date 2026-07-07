import React, { useState, useEffect } from "react";
import { db } from "../../firebase/firebase"; // Asegúrate de ajustar la ruta relativa a tu proyecto
import { collection, onSnapshot, query } from "firebase/firestore";

function TitanDatabase() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroTab, setFiltroTab] = useState("afiliado"); // "afiliado" o "invitado"
  const [busquedaInterna, setBusquedaInterna] = useState("");

  // Escuchamos la colección completa de 'usuarios' en tiempo real
  useEffect(() => {
    const q = query(collection(db, "usuarios"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const listaUsuarios = [];
      snapshot.forEach((doc) => {
        listaUsuarios.push({ id: doc.id, ...doc.data() });
      });
      setUsuarios(listaUsuarios);
      setLoading(false);
    }, (error) => {
      console.error("Error en Base de Datos:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Contadores rápidos para los KPIs de arriba
  const totalAfiliados = usuarios.filter(u => u.estadoDeCuenta === "afiliado").length;
  const totalInvitados = usuarios.filter(u => u.estadoDeCuenta === "invitado").length;

  // Filtrado combinado (Por Tab activa + Barra de búsqueda)
  const usuariosFiltrados = usuarios.filter((u) => {
    const coincideTab = u.estadoDeCuenta === filtroTab;
    
    const queryLower = busquedaInterna.toLowerCase();
    const nombreCompleto = `${u.nombre || ''} ${u.apellido || ''}`.toLowerCase();
    const coincideBusqueda = 
      nombreCompleto.includes(queryLower) || 
      u.id?.toLowerCase().includes(queryLower) ||
      u.identificacion?.toLowerCase().includes(queryLower);

    return coincideTab && coincideBusqueda;
  });

  const cargarAtletaEnSesion = (id) => {
    sessionStorage.setItem("atleta_seleccionado_id", id);
    alert(`Atleta seleccionado con éxito (ID: ${id}). Ya puedes navegar a Nutrición o Entrenamiento.`);
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-fade-in">
      
      {/* ENCABEZADO */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-6">
        <div>
          <h2 className="text-2xl font-black text-white tracking-wider uppercase flex items-center gap-3">
            <span className="text-[#00daf3]">🗄️</span> Centro de Control de Datos
          </h2>
          <p className="text-xs text-[#bac9cc] mt-1">
            Gestión segmentada de atletas élite y registros temporales de la plataforma.
          </p>
        </div>
        
        {/* BARRA DE BÚSQUEDA INTERNA */}
        <div className="w-full md:w-80">
          <input
            type="text"
            placeholder="Buscar por Nombre, ID o DNI..."
            value={busquedaInterna}
            onChange={(e) => setBusquedaInterna(e.target.value)}
            className="w-full bg-[#201f20] border border-white/10 rounded-lg px-4 py-2 text-xs text-white outline-none focus:border-[#00daf3] placeholder-slate-500 transition-all"
          />
        </div>
      </div>

      {/* METRICAS / DIVISIÓN DE CONTADORES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Card Afiliados */}
        <div 
          onClick={() => setFiltroTab("afiliado")}
          className={`p-5 rounded-xl border cursor-pointer transition-all ${
            filtroTab === "afiliado" 
              ? "bg-[#00daf3]/5 border-[#00daf3] shadow-[0_0_15px_rgba(0,218,243,0.1)]" 
              : "bg-[#201f20] border-white/5 hover:border-white/20"
          }`}
        >
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold uppercase tracking-widest text-[#bac9cc]">Atletas Afiliados</span>
            <span className="text-xl">🏋️‍♂️</span>
          </div>
          <p className="text-3xl font-black text-white mt-2">{totalAfiliados}</p>
          <p className="text-[10px] text-slate-400 mt-1">Con acceso completo a planes y monitoreo activo.</p>
        </div>

        {/* Card Invitados */}
        <div 
          onClick={() => setFiltroTab("invitado")}
          className={`p-5 rounded-xl border cursor-pointer transition-all ${
            filtroTab === "invitado" 
              ? "bg-[#00daf3]/5 border-[#00daf3] shadow-[0_0_15px_rgba(0,218,243,0.1)]" 
              : "bg-[#201f20] border-white/5 hover:border-white/20"
          }`}
        >
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold uppercase tracking-widest text-[#bac9cc]">Usuarios Invitados</span>
            <span className="text-xl">📩</span>
          </div>
          <p className="text-3xl font-black text-white mt-2">{totalInvitados}</p>
          <p className="text-[10px] text-slate-400 mt-1">Registros de migración masiva o códigos sin activar.</p>
        </div>
      </div>

      {/* SECCIÓN DE LA TABLA */}
      <div className="bg-[#201f20] border border-white/10 rounded-xl overflow-hidden">
        {/* Cabecera de la sección según el filtro */}
        <div className="px-6 py-4 bg-white/5 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#00daf3]">
            Listado de {filtroTab === "afiliado" ? "Atletas Afiliados" : "Usuarios Invitados"}
          </h3>
          <span className="text-[10px] bg-[#131314] px-2 py-0.5 rounded text-slate-400 font-mono">
            Registros mostrados: {usuariosFiltrados.length}
          </span>
        </div>

        {loading ? (
          <div className="p-10 text-center text-xs text-[#00daf3] animate-pulse font-mono">
            Sincronizando registros con Firestore...
          </div>
        ) : usuariosFiltrados.length === 0 ? (
          <div className="p-12 text-center text-slate-500 italic text-xs">
            No se encontraron usuarios en este segmento que coincidan con la búsqueda.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-[#1a191a] text-[10px] uppercase tracking-wider text-[#bac9cc]">
                  <th className="px-6 py-3">Atleta / Nombre</th>
                  <th className="px-6 py-3">Identificación (DNI)</th>
                  <th className="px-6 py-3">Contacto</th>
                  <th className="px-6 py-3">Modalidad</th>
                  <th className="px-6 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                {usuariosFiltrados.map((usuario) => (
                  <tr key={usuario.id} className="hover:bg-white/[0.02] transition-colors group">
                    {/* Nombre e ID */}
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#00daf3]/10 border border-[#00daf3]/20 flex items-center justify-center text-xs font-bold text-[#00daf3]">
                        {(usuario.nombre?.[0] || "U").toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-white group-hover:text-[#00daf3] transition-colors">
                          {usuario.nombre} {usuario.apellido || ""}
                        </p>
                        <p className="text-[9px] font-mono text-slate-500">ID: {usuario.id}</p>
                      </div>
                    </td>

                    {/* Identificación */}
                    <td className="px-6 py-4 font-mono text-slate-300">
                      {usuario.identificacion || "N/A"}
                    </td>

                    {/* Contacto */}
                    <td className="px-6 py-4">
                      <p className="text-white">{usuario.correo || "Sin correo"}</p>
                      <p className="text-[10px] text-slate-400">{usuario.telefono || "Sin teléfono"}</p>
                    </td>

                    {/* Modalidad */}
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded font-mono text-[9px] uppercase font-bold tracking-wider ${
                        usuario.modalidad === "ONLINE" 
                          ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" 
                          : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                      }`}>
                        {usuario.modalidad || "PRESENCIAL"}
                      </span>
                    </td>

                    {/* Botón de carga */}
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => cargarAtletaEnSesion(usuario.id)}
                        className="px-3 py-1 bg-white/5 border border-white/10 rounded text-[10px] uppercase font-bold text-[#bac9cc] hover:bg-[#00daf3] hover:text-[#131314] hover:border-[#00daf3] transition-all"
                      >
                        Seleccionar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}

export default TitanDatabase;
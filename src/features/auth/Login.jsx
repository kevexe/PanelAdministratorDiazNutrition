import { useState } from 'react';
import { auth } from './firebase';
import { signInWithEmailAndPassword } from "firebase/auth";

function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const [mostrarPassword, setMostrarPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return alert("Por favor, llena todos los campos");
    
    setCargando(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      onLoginSuccess();
    } catch (error) {
      console.error("Error de login:", error);
      alert("Acceso denegado: Usuario o contraseña incorrectos");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="bg-[#0a0a0a] text-white h-screen w-full overflow-hidden flex flex-col items-center justify-center font-body-md relative selection:bg-white/20 selection:text-white">
      
      {/* Cinematic Background */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-60" 
          style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBUW_Up7vrH_hpIHQh33LJOY71s-Uo-ijX6W-sQm565uJeKDMOHOvXtxG7Qx2RVQrnj56lUPppMewO8xJSH6e_yaiJfSTvkcxiLXafz-eCw_ZSlunNnC8b9PMbCJfHmM_yxW02qAuwG1kZJpp4TZaMV5fMIg-H4se19F8tp4Mogjln5jxeQC8_DQ8xAYiBDa5MlM-OY81fO8uLgOzDnVihp284KhQH-I65KRbhxUZZXHh6Zkpc0gcRDJz4pgoi1ojcvMIxHVTFg-H6L')" }}
        ></div>
        {/* Subtle Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80"></div>
      </div>

      {/* Login Card Container */}
    <main className="relative z-10 w-full max-w-[460px] px-6 md:px-0 flex-1 flex flex-col justify-center">
        
        {/* Ultra-Minimalist Glassmorphic Card */}
        <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/10 rounded-3xl p-10 md:p-14 shadow-2xl relative overflow-hidden">
          
          {/* Header / Brand */}
          <header className="flex flex-col items-center justify-center mb-12 text-center relative z-10">
            <h1 className="font-headline-md text-3xl md:text-4xl text-white mb-2 tracking-[0.2em] uppercase font-light">Titan Performance</h1>
            <p className="font-body-md text-sm text-white/50 tracking-widest uppercase font-light">Portal Elite de Entrenamiento</p>
          </header>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="flex flex-col gap-8 relative z-10">
            
            {/* Email Field */}
            <div className="flex flex-col gap-1">
              <label htmlFor="email" className="font-label-caps text-[10px] text-white/50 tracking-[0.2em] uppercase ml-1">
                CORREO ELECTRÓNICO
              </label>
              <div className="relative group mt-2">
                <input 
                  id="email" 
                  name="email" 
                  type="email" 
                  placeholder="entrenador@titan.com" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={cargando}
                  className="w-full bg-transparent border-0 border-b border-white/20 py-2 px-1 text-white font-body-md placeholder-white/20 focus:outline-none focus:border-white focus:ring-0 transition-all rounded-none" 
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1">
              <label htmlFor="password" className="font-label-caps text-[10px] text-white/50 tracking-[0.2em] uppercase ml-1">
                CONTRASEÑA
              </label>
              <div className="relative group mt-2">
                <input 
                  id="password" 
                  name="password" 
                  type={mostrarPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={cargando}
                  className="w-full bg-transparent border-0 border-b border-white/20 py-2 px-1 pr-10 text-white font-body-md placeholder-white/20 focus:outline-none focus:border-white focus:ring-0 transition-all rounded-none" 
                  autoComplete="current-password"
                />
                <button 
                  type="button"
                  onClick={() => setMostrarPassword(!mostrarPassword)}
                  aria-label="Toggle password visibility" 
                  className="absolute right-1 top-1/2 -translate-y-1/2 text-white/40 hover:text-white focus:outline-none transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {mostrarPassword ? "visibility" : "visibility_off"}
                  </span>
                </button>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="flex justify-end mt-[-12px]">
              <a href="#" className="font-label-sm text-[10px] text-white/50 hover:text-white transition-colors tracking-wider">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            {/* Primary Action Button */}
            <button 
              type="submit" 
              disabled={cargando}
              className="w-full bg-white text-black font-label-caps text-xs py-4 px-8 mt-6 flex items-center justify-center gap-3 hover:bg-white/90 transition-all duration-500 active:scale-[0.99] group rounded-sm"
            >
              <span className="tracking-[0.3em] font-medium">
                {cargando ? "AUTENTICANDO..." : "ENTRAR"}
              </span>
              {!cargando && (
                <span className="material-symbols-outlined text-[16px] group-hover:translate-x-2 transition-transform duration-500">
                  east
                </span>
              )}
            </button>
          </form>
        </div>
      </main>

      {/* Bottom Tech Text */}
      <div className="relative z-10 pb-8 mt-auto text-center flex flex-col items-center justify-center gap-3 opacity-50 hover:opacity-100 transition-opacity duration-700">
        <div className="w-1 h-1 rounded-full bg-white animate-pulse-dot"></div>
        <p className="font-mono text-[9px] text-white/70 uppercase tracking-[0.3em]">
          SECURE CONNECTION // SYS.V.2.4.1
        </p>
      </div>
    </div>
  );
}

export default Login;
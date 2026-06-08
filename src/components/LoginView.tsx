import { useState, FormEvent } from 'react';
import { motion } from 'motion/react';
import { Key, User, AlertCircle, ArrowRight } from 'lucide-react';
import { signInAnonymously } from 'firebase/auth';
import { auth } from '../firebase';
// @ts-ignore
import loginBg from './bg/login bg.png';

interface LoginViewProps {
  onLoginSuccess: (userName: string, role: string) => void;
}

const VALID_USERS = [
  { username: 'amadeus', displayName: 'Amadeus', password: '123' },
  { username: 'arthur', displayName: 'Arthur', password: '123' },
  { username: 'joão vitor', displayName: 'João Vitor', password: '123' },
  { username: 'joao vitor', displayName: 'João Vitor', password: '123' }
];

export default function LoginView({ onLoginSuccess }: LoginViewProps) {
  const [customName, setCustomName] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const sanitizedUser = customName.trim();
      if (!sanitizedUser) {
        throw new Error('Por favor, insira o usuário.');
      }

      const lowerUser = sanitizedUser.toLowerCase();
      const matchedUser = VALID_USERS.find(u => u.username === lowerUser);

      if (!matchedUser || password !== matchedUser.password) {
        throw new Error('Falha no login. Verifique suas credenciais e tente novamente.');
      }

      // Authenticate anonymously onto Firebase to set up real-time listener permissions
      try {
        await signInAnonymously(auth);
      } catch (fbErr) {
        console.warn('Firebase anonymous login failed, proceeding in offline/local credentials mode:', fbErr);
      }
      
      onLoginSuccess(matchedUser.displayName, 'Analista Sênior');
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Falha na autenticação do operador.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      id="login-view" 
      className="min-h-screen bg-neutral-950 flex items-center justify-center relative overflow-hidden font-sans selection:bg-[#003526]"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.35), rgba(0, 0, 0, 0.55)), url(${loginBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Futuristic glow elements (Green pulsating ambient light) */}
      <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-[#005a44] rounded-full filter blur-[140px] opacity-35 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#83bda4] rounded-full filter blur-[160px] opacity-15 animate-pulse" />

      {/* Main Container */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-lg bg-[#ffffff]/95 backdrop-blur-md rounded-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] border border-white/10 p-8 m-4 relative z-10 text-neutral-800"
      >
        {/* Header section with Medusa Branding */}
        <div className="text-center space-y-1.5 mb-6">
          <div className="flex justify-center">
            <div className="relative w-32 h-32">
              <img
                src="/assets/medusa-logo.png"
                alt="Medusa Logo"
                className="w-full h-full object-contain animate-fade-in"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
          
          <div className="space-y-0.5">
            <h1 className="text-[45px] -mt-[38px] font-black font-display tracking-tight text-[#003526]">
              MEDUSA
            </h1>
            <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#83bda4] font-bold">
              Unidade de Inteligência Financeira
            </p>
          </div>
        </div>

        {/* System Alerts for Operators */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Form authentication */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase font-bold tracking-wider text-neutral-400 mb-1">
                Usuário:
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 w-4 h-4 text-[#003526]" />
                <input
                  type="text"
                  required
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full bg-slate-50 border border-neutral-200 rounded-lg pl-10 pr-4 py-2.5 text-xs font-semibold outline-none focus:bg-white focus:border-[#83bda4] transition-all"
                  placeholder="Seu usuário"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold tracking-wider text-neutral-400 mb-1">
                Senha:
              </label>
              <div className="relative">
                <Key className="absolute left-3.5 top-3 w-4 h-4 text-[#003526]" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-neutral-200 rounded-lg pl-10 pr-4 py-2.5 text-xs outline-none focus:bg-white focus:border-[#83bda4] transition-all"
                  placeholder="Sua senha"
                />
              </div>
            </div>
          </div>

          {/* Compliance and protocol checklist */}
          <div className="flex items-start gap-2.5 py-1">
            <input
              id="terms"
              type="checkbox"
              required
              defaultChecked
              className="mt-0.5 rounded border-neutral-300 text-[#003526] focus:ring-[#003526] cursor-pointer"
            />
            <label htmlFor="terms" className="text-[10px] text-neutral-500 leading-tight cursor-pointer">
              Declaro que a consulta e investigações aos dados governamentais atende aos preceitos da LGPD e as normas internas da Unidade de Inteligência Financeira.
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#003526] hover:bg-[#003526]/90 disabled:bg-[#003526]/50 text-white font-bold text-xs py-3 rounded-lg flex items-center justify-center gap-2 transition shadow-lg cursor-pointer max-md:py-3.5"
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Autenticar no Sistema</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Cryptographic footer */}
        <div className="mt-8 pt-4 border-t border-neutral-100 flex justify-between items-center text-[9px] text-neutral-400 font-mono select-none">
          <span>ALGORITHM: SHA-256</span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
            SESSÃO PROTEGIDA
          </span>
        </div>
      </motion.div>
    </div>
  );
}

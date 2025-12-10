import React, { useState } from 'react';
import Avatar from './Avatar';
import { authService } from '../services/authService';
import { LogIn, UserPlus, AlertCircle, ArrowRight, User } from 'lucide-react';

interface AuthViewProps {
  onLogin: (username: string) => void;
  onGuest: () => void;
}

const AuthView: React.FC<AuthViewProps> = ({ onLogin, onGuest }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Simulate a tiny network delay for feel
    setTimeout(() => {
      if (mode === 'register') {
        const result = authService.register(username, password);
        if (result.success) {
          onLogin(username);
        } else {
          setError(result.message);
          setIsLoading(false);
        }
      } else {
        const result = authService.login(username, password);
        if (result.success) {
          onLogin(username);
        } else {
          setError(result.message);
          setIsLoading(false);
        }
      }
    }, 600);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-sky-50">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden flex flex-col md:flex-row-reverse border border-sky-100">
        
        {/* Main Form Area */}
        <div className="w-full p-8 flex flex-col">
          <div className="mb-6 text-center">
             <Avatar talking={false} mood="happy" />
             <h1 className="text-2xl font-black text-violet-700 mt-4">Professor Hoot's Academy</h1>
             <p className="text-slate-500">Log in to start learning!</p>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
            <button 
              onClick={() => { setMode('login'); setError(null); }}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${mode === 'login' ? 'bg-white text-violet-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Sign In
            </button>
            <button 
              onClick={() => { setMode('register'); setError(null); }}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${mode === 'register' ? 'bg-white text-violet-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              New Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-violet-400 focus:outline-none bg-slate-50 text-slate-800 font-bold"
                placeholder="Student Name"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-violet-400 focus:outline-none bg-slate-50 text-slate-800 font-bold"
                placeholder="••••••"
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-violet-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-violet-700 transition-colors shadow-lg shadow-violet-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="animate-pulse">Loading...</span>
              ) : (
                <>
                  {mode === 'login' ? <LogIn size={20} /> : <UserPlus size={20} />}
                  {mode === 'login' ? "Let's Go!" : "Create Account"}
                </>
              )}
            </button>
          </form>

          {/* Guest Option */}
          <div className="mt-8 text-center">
            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-400 font-bold text-xs uppercase tracking-widest">Or skip for now</span>
              </div>
            </div>
            <button
              type="button"
              onClick={onGuest}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-slate-200 text-slate-500 font-bold hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 transition-all"
            >
              <User size={18} />
              Continue as Guest
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthView;
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Added Link import here
import { useMutation } from '@tanstack/react-query';
import { Terminal, Lock, User, Loader2 } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import api from '../lib/api';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const loginAction = useAuthStore((state) => state.login);

  const loginMutation = useMutation({
    mutationFn: async (credentials) => {
      const res = await api.post('/auth/login', credentials);
      return res.data;
    },
    onSuccess: (data) => {
      loginAction(data);
      navigate('/');
    },
    onError: (error) => {
      console.error('Login failed:', error);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username && password) {
      loginMutation.mutate({ username, password });
    }
  };

  return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-panel border border-border rounded-xl shadow-2xl overflow-hidden relative">
        
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent-cyan via-accent-amber to-accent-cyan"></div>
        
        <div className="p-8">
          <div className="flex flex-col items-center mb-8 gap-2">
            <Terminal size={40} className="text-accent-cyan mb-2" />
            <h1 className="font-mono text-2xl font-bold tracking-widest text-text-main">
              SCHEMA<span className="text-accent-cyan">FORGE</span>
            </h1>
            <p className="text-xs font-mono text-text-muted">SECURE DEVELOPER WORKSPACE</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {loginMutation.isError && (
              <div className="p-3 bg-[#FF5252]/10 border border-[#FF5252]/20 text-[#FF5252] text-xs font-mono rounded text-center">
                Access Denied. Invalid credentials.
              </div>
            )}

            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input 
                type="text" 
                placeholder="Admin Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-background border border-border text-text-main text-sm font-mono rounded pl-10 pr-4 py-2.5 focus:outline-none focus:border-accent-cyan focus:shadow-glow transition-all"
                required
              />
            </div>

            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input 
                type="password" 
                placeholder="System Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-background border border-border text-text-main text-sm font-mono rounded pl-10 pr-4 py-2.5 focus:outline-none focus:border-accent-cyan focus:shadow-glow transition-all"
                required
              />
            </div>

            <button 
              type="submit" 
              disabled={loginMutation.isPending}
              className="w-full mt-2 bg-panel-hover border border-accent-cyan/50 text-accent-cyan hover:bg-accent-cyan hover:text-background font-mono font-bold py-2.5 rounded transition-all flex items-center justify-center gap-2"
            >
              {loginMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : 'INITIALIZE SESSION'}
            </button>
          </form>

          {/* Navigation link to Register page */}
          <div className="mt-6 text-center">
            <Link to="/register" className="text-xs font-mono text-text-muted hover:text-accent-cyan transition">
              No master account found? Initialize one here.
            </Link>
          </div>
          
        </div>
      </div>
    </div>
  );
}
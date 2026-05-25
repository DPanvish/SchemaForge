import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Terminal, Lock, User, Loader2, ShieldCheck } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import api from '../lib/api';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();
  const loginAction = useAuthStore((state) => state.login);

  const registerMutation = useMutation({
    mutationFn: async (credentials) => {
      const res = await api.post('/auth/register', credentials);
      return res.data;
    },
    onSuccess: (data) => {
      loginAction(data); // Immediately log the user in
      navigate('/'); // Redirect to the dashboard
    },
    onError: (err) => {
      setError(err.response?.data?.message || 'Registration failed');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      return setError('Passwords do not match.');
    }
    registerMutation.mutate({ username, password });
  };

  return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-panel border border-border rounded-xl shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent-amber via-accent-cyan to-accent-amber"></div>
        
        <div className="p-8">
          <div className="flex flex-col items-center mb-8 gap-2">
            <ShieldCheck size={40} className="text-accent-amber mb-2" />
            <h1 className="font-mono text-2xl font-bold tracking-widest text-text-main">
              INITIALIZE <span className="text-accent-amber">ADMIN</span>
            </h1>
            <p className="text-xs font-mono text-text-muted">CREATE YOUR MASTER ACCOUNT</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {error && (
              <div className="p-3 bg-[#FF5252]/10 border border-[#FF5252]/20 text-[#FF5252] text-xs font-mono rounded text-center">
                {error}
              </div>
            )}

            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input 
                type="text" 
                placeholder="Admin Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-background border border-border text-text-main text-sm font-mono rounded pl-10 pr-4 py-2.5 focus:outline-none focus:border-accent-amber focus:shadow-glow transition-all"
                required
              />
            </div>

            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input 
                type="password" 
                placeholder="Master Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-background border border-border text-text-main text-sm font-mono rounded pl-10 pr-4 py-2.5 focus:outline-none focus:border-accent-amber focus:shadow-glow transition-all"
                required
              />
            </div>
            
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input 
                type="password" 
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-background border border-border text-text-main text-sm font-mono rounded pl-10 pr-4 py-2.5 focus:outline-none focus:border-accent-amber focus:shadow-glow transition-all"
                required
              />
            </div>

            <button 
              type="submit" 
              disabled={registerMutation.isPending}
              className="w-full mt-2 bg-panel-hover border border-accent-amber/50 text-accent-amber hover:bg-accent-amber hover:text-background font-mono font-bold py-2.5 rounded transition-all flex items-center justify-center gap-2"
            >
              {registerMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : 'GENERATE CREDENTIALS'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/login" className="text-xs font-mono text-text-muted hover:text-accent-cyan transition">
              Already have an admin node? Authenticate here.
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
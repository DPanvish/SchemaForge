import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import SchemaCanvas from '../components/canvas/SchemaCanvas';
import ApiRegistry from '../components/registry/ApiRegistry';
import api from '../lib/api';
import { LogOut, Terminal, Trash2 } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';

export default function ProjectWorkspace() {
  const queryClient = useQueryClient();
  const { id } = useParams(); 
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('canvas');
  const logout = useAuthStore((state) => state.logout);

  const { data: project } = useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      const res = await api.get(`/projects/${id}`);
      return res.data;
    },
    enabled: !!id
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/projects/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['projects']);
      queryClient.invalidateQueries(['project', id]);
      navigate('/');
    },
    onError: (error) => {
      console.error("Failed to delete project:", error);
      alert("Failed to delete the workspace. Check console.");
    }
  });

  const handleDeleteWorkspace = () => {
    const isConfirmed = window.confirm(
      "CRITICAL WARNING:\n\nAre you sure you want to completely delete this microservice?\nThis will destroy all schemas, relations, and API endpoints forever."
    );

    if (isConfirmed) {
      deleteProjectMutation.mutate();
    }
  };

  let projectAccent = project?.themeColor || '#00E5FF';
  if (projectAccent === '#0A0A0A') {
    projectAccent = '#00E5FF'; 
  }

  return (
    <div 
      style={{ '--project-accent': projectAccent, '--project-glow': `${projectAccent}33` }} 
      className="flex flex-col h-screen w-full bg-background overflow-hidden animate-in fade-in duration-500"
    >
      <header className="h-16 border-b border-border bg-panel flex items-center justify-between px-6 shrink-0 z-10">
        <div onClick={() => navigate('/')} className="font-mono text-sm font-bold tracking-widest text-text-main cursor-pointer flex items-center gap-2 hover:text-text-muted transition">
          <Terminal size={16} style={{ color: 'var(--project-accent)' }} />
          SCHEMA<span style={{ color: 'var(--project-accent)' }}>FORGE</span> // WORKSPACE
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex gap-2 border border-border rounded p-0.5 bg-background">
            <button 
              onClick={() => setActiveTab('canvas')}
              className={`px-3 py-1 text-xs font-mono rounded transition-all duration-300 ${
                activeTab === 'canvas' 
                  ? 'bg-panel border text-text-main font-bold shadow-md' 
                  : 'text-text-muted hover:text-text-main'
              }`}
              style={activeTab === 'canvas' ? { borderColor: 'var(--project-accent)', boxShadow: '0 0 10px var(--project-glow)' } : {}}
            >
              Visual Canvas
            </button>
            <button 
              onClick={() => setActiveTab('api')}
              className={`px-3 py-1 text-xs font-mono rounded transition-all duration-300 ${
                activeTab === 'api' 
                  ? 'bg-panel border text-text-main font-bold shadow-md' 
                  : 'text-text-muted hover:text-text-main'
              }`}
              style={activeTab === 'api' ? { borderColor: 'var(--project-accent)', boxShadow: '0 0 10px var(--project-glow)' } : {}}
            >
              API Contract Registry
            </button>
          </div>
          <button 
            onClick={handleDeleteWorkspace} 
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-mono text-text-muted hover:text-background hover:bg-[#FF5252] border border-transparent hover:border-[#FF5252] rounded transition-all ml-4"
          >
            <Trash2 size={14} /> DELETE
          </button>

          <button onClick={logout} className="flex items-center gap-1.5 px-3 py-1 text-xs font-mono text-text-muted hover:text-[#FF5252] transition ml-4">
            <LogOut size={14} /> EXIT
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-hidden relative">
        {activeTab === 'canvas' ? <SchemaCanvas projectId={id} /> : <ApiRegistry projectId={id} />}
      </main>
    </div>
  );
}
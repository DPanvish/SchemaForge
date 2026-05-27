import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Terminal, Plus, FolderGit2, LogOut, Loader2, ArrowRight, Settings } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import DashboardSettingsModal from '../components/dashboard/DashboardSettingsModal';
import api from '../lib/api';

export default function Dashboard() {
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [dashboardTheme, setDashboardTheme] = useState(() => {
    return localStorage.getItem('schemaforge-theme') || '#00E5FF';
  });
  
  
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const logout = useAuthStore((state) => state.logout);

  // Fetch all projects
  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await api.get('/projects');
      return res.data;
    }
  });

  // Create new project
  const createMutation = useMutation({
    mutationFn: async (newProject) => {
      const res = await api.post('/projects', newProject);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['projects']); // Refresh the list
      setIsCreating(false);
      setNewProjectName('');
      setNewProjectDesc('');
      navigate(`/project/${data._id}`); // Instantly jump into the new workspace
    }
  });

  const handleCreate = (e) => {
    e.preventDefault();
    if (newProjectName) {

      createMutation.mutate({ 
        name: newProjectName, 
        description: newProjectDesc 
      });
    }
  };

  return (
    <div 
      style={{ '--project-accent': dashboardTheme, '--project-glow': `${dashboardTheme}33` }}
      className="min-h-screen w-full bg-background flex flex-col"
    >
      {/* Dashboard Header */}
      <header className="h-16 border-b border-border bg-panel flex items-center justify-between px-8">
        
        {/* Left Side */}
        <div className="flex items-center gap-3 font-mono text-sm font-bold tracking-widest text-text-main">
          <Terminal size={18} style={{ color: 'var(--project-accent)' }} />
          SCHEMA<span style={{ color: 'var(--project-accent)' }}>FORGE</span> // COMMAND CENTER
        </div>
        
        {/* Right Side Actions */}
        <div className="flex items-center gap-4">
          
          {/* THE NEW SETTINGS BUTTON */}
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="p-1.5 rounded text-text-muted hover:text-[var(--project-accent)] hover:bg-panel-hover transition-colors"
            title="Global Preferences"
          >
            <Settings size={18} />
          </button>

          <div className="w-px h-6 bg-border mx-1" />

          <button 
            onClick={logout}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-mono text-text-muted hover:text-[#FF5252] rounded transition"
          >
            <LogOut size={14} /> TERMINATE SESSION
          </button>
        </div>
      </header>

      <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-text-main tracking-tight">Active Workspaces</h2>
          <button 
            onClick={() => setIsCreating(!isCreating)}
            style={{ 
              backgroundColor: 'var(--project-glow)', 
              borderColor: 'var(--project-accent)', 
              color: 'var(--project-accent)' 
            }}
            className="flex items-center gap-2 border px-4 py-2 rounded font-mono text-xs font-bold hover:opacity-80 transition shadow-[0_0_15px_var(--project-glow)]"
          >
            <Plus size={16} /> NEW MICROSERVICE
          </button>
        </div>

        {/* Creation Form */}
        {isCreating && (
          <form onSubmit={handleCreate} className="mb-8 p-6 bg-panel border border-border rounded-xl shadow-lg flex gap-4 items-start animate-in slide-in-from-top-4 fade-in">
            <div className="flex-1 flex flex-col gap-4">
              <input 
                type="text" 
                placeholder="Project Name (e.g., E-Commerce Auth Node)"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                style={{ borderColor: newProjectName ? 'var(--project-accent)' : '' }}
                className="w-full bg-background border border-border text-text-main text-sm font-mono rounded px-4 py-2 focus:outline-none transition"
                required autoFocus
              />
              <input 
                type="text" 
                placeholder="Brief Description (Optional)"
                value={newProjectDesc}
                onChange={(e) => setNewProjectDesc(e.target.value)}
                className="w-full bg-background border border-border text-text-main text-sm font-mono rounded px-4 py-2 focus:outline-none transition"
              />
            </div>
            <button 
              type="submit"
              disabled={createMutation.isPending}
              style={{ 
                backgroundColor: 'var(--project-accent)', 
                color: 'var(--background)' 
              }}
              className="h-[86px] px-6 rounded font-mono font-bold flex items-center justify-center hover:opacity-90 transition min-w-[120px]"
            >
              {createMutation.isPending ? <Loader2 size={24} className="animate-spin" /> : 'INITIALIZE'}
            </button>
          </form>
        )}

        {/* Project Grid */}
        {isLoading ? (
          <div className="flex justify-center py-20" style={{ color: 'var(--project-accent)' }}>
            <Loader2 size={32} className="animate-spin" />
          </div>
        ) : projects?.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-border rounded-xl text-text-muted font-mono text-xs">
            No active nodes found. Initialize your first workspace to begin.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects?.map((project) => (
              <div 
                key={project._id}
                onClick={() => navigate(`/project/${project._id}`)}
                className="bg-panel border border-border rounded-xl p-6 cursor-pointer hover:border-[var(--project-accent)] hover:shadow-[0_0_15px_var(--project-glow)] transition-all group flex flex-col h-48"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-2 bg-background rounded border border-border group-hover:border-[var(--project-accent)] transition">
                    <FolderGit2 size={20} className="text-text-muted group-hover:text-[var(--project-accent)] transition" />
                  </div>
                  <ArrowRight size={18} className="text-text-muted opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-300" />
                </div>
                <h3 className="text-lg font-bold text-text-main mb-2 truncate">{project.name}</h3>
                <p className="text-sm text-text-muted line-clamp-2 flex-1">{project.description || 'No description provided.'}</p>
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-[10px] font-mono text-text-muted uppercase tracking-wider">
                    ID: {project._id.slice(-6)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Mount the Global Settings Modal */}
      <DashboardSettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentTheme={dashboardTheme}
        applyTheme={setDashboardTheme}
      />
    </div>
  );
}
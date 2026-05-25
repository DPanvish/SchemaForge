import { useState } from 'react';
import { useParams } from 'react-router-dom';
import SchemaCanvas from '../components/canvas/SchemaCanvas';
import ApiRegistry from '../components/registry/ApiRegistry';
import useAuthStore from '../store/useAuthStore';
import { LogOut } from 'lucide-react';

export default function ProjectWorkspace() {
  const { id } = useParams(); 
  const logout = useAuthStore((state) => state.logout);
  const [activeTab, setActiveTab] = useState('canvas'); // 'canvas' | 'api'

  return (
    <div className="flex flex-col h-screen w-full bg-background overflow-hidden">
      <header className="h-16 border-b border-border bg-panel flex items-center justify-between px-6 shrink-0">
        <div className="font-mono text-sm font-bold tracking-widest text-text-main">
          SCHEMA<span className="text-accent-cyan">FORGE</span> // WORKSPACE
        </div>
        
        <div className="flex gap-2 border border-border rounded p-0.5 bg-background">
          <button 
            onClick={() => setActiveTab('canvas')}
            className={`px-3 py-1 text-xs font-mono rounded transition ${activeTab === 'canvas' ? 'bg-panel border border-accent-cyan/50 text-accent-cyan shadow-glow' : 'text-text-muted hover:text-text-main'}`}
          >
            Visual Canvas
          </button>
          <button 
            onClick={() => setActiveTab('api')}
            className={`px-3 py-1 text-xs font-mono rounded transition ${activeTab === 'api' ? 'bg-panel border border-accent-cyan/50 text-accent-cyan shadow-glow' : 'text-text-muted hover:text-text-main'}`}
          >
            API Contract Registry
          </button>
          <button 
            onClick={logout}
            className="flex items-center gap-2 px-3 py-1 text-xs font-mono text-text-muted hover:text-[#FF5252] transition ml-4"
          >
            <LogOut size={14} /> EXIT
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative">
        {activeTab === 'canvas' ? (
          <SchemaCanvas projectId={id} />
        ) : (
          <ApiRegistry projectId={id} />
        )}
      </main>
    </div>
  );
}
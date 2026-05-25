import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react"
import { Terminal, ShieldAlert, Plus, Layers } from 'lucide-react';
import AddEndpointModal from './AddEndpointModal';
import api from "../../lib/api";


const ApiRegistry = ({projectId}) => {
  const [selectedEndpoint, setSelectedEndpoint] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    setSelectedEndpoint(null);
  }, [projectId]);

  const {data: endpoints, isLoading, isError, error} = useQuery({
    queryKey: ["endpoints", projectId],
    queryFn: async() => {
      const res = await api.get(`/endpoints/${projectId}`);
      return res.data;
    },
    enabled: !!projectId,
  });

  const getMethodStyle = (method) => {
    switch (method) {
      case 'GET': return 'text-[#4CAF50] bg-[#4CAF50]/10 border-[#4CAF50]/20';
      case 'POST': return 'text-accent-amber bg-accent-amber/10 border-accent-amber/20';
      case 'PUT': return 'text-accent-cyan bg-accent-cyan/10 border-accent-cyan/20';
      case 'DELETE': return 'text-[#FF5252] bg-[#FF5252]/10 border-[#FF5252]/20';
      default: return 'text-text-muted bg-panel-hover border-border';
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-[calc(100vh-64px)] bg-background flex items-center justify-center">
        <div 
          style={{ color: 'var(--project-accent)' }} 
          className="font-mono text-xs tracking-widest animate-pulse flex items-center gap-2"
        >
          <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: 'var(--project-accent)' }} />
          INITIALIZING API NODE FETCH...
        </div>
      </div>
    );
  }

  if(!projectId){
    return <div className="p-8 text-text-muted font-mono">Select a project to manage API routes.</div>;
  }
  
  if (isError) {
    return (
      <div className="p-8 text-[`#FF5252`] font-mono">
        Failed to load API routes: {error?.message || "Unknown error"}
      </div>
    );
  }

  return (
    <div className="w-full h-[calc(100vh-64px)] bg-background flex flex-col md:flex-row border-t border-border">
      
      {/* Left Panel: Route Explorer List */}
      <div className="w-full md:w-2/5 border-r border-border p-4 overflow-y-auto flex flex-col gap-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Terminal size={18} className="text-accent-cyan" />
            <h2 className="font-mono text-sm font-bold tracking-wider uppercase text-text-main">API Route Explorer</h2>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)} 
            style={{ color: 'var(--project-accent)', borderColor: 'var(--project-accent)' }}
            className="flex items-center gap-1 text-xs font-mono bg-panel-hover border px-2 py-1 rounded hover:bg-background transition shadow-[0_0_10px_var(--project-glow)]">
            <Plus size={14} /> New
          </button>
        </div>

        {endpoints?.length === 0 ? (
          <div className="text-center p-8 border border-dashed border-border rounded text-text-muted font-mono text-xs">
            No endpoints documented for this microservice.
          </div>
        ) : (
          endpoints?.map((ep) => (
            <button
              type="button" 
              key={ep._id} 
              onClick={() => setSelectedEndpoint(ep)}
              className={`w-full text-left p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                selectedEndpoint?._id === ep._id 
                  ? 'bg-panel-hover border-accent-cyan shadow-glow' 
                  : 'bg-panel border-border hover:border-panel-hover'
              }`}
            >
              <div className="flex items-center gap-3 font-mono text-xs">
                <span className={`px-2 py-0.5 rounded border text-[10px] font-bold tracking-wide ${getMethodStyle(ep.method)}`}>
                  {ep.method}
                </span>
                <span className="text-text-main font-semibold tracking-tight">{ep.path}</span>
              </div>
              <span className="text-[10px] text-text-muted max-w-[120px] truncate">{ep.description}</span>
            </button>
          ))
        )}
      </div>

      {/* Right Panel: Detailed Contract Inspector */}
      <div className="flex-1 p-6 overflow-y-auto bg-[#0E0E0E]">
        {selectedEndpoint ? (
          <div className="flex flex-col gap-6">
            <div>
              <div className="flex items-center gap-3 font-mono mb-2">
                <span className={`px-2.5 py-1 rounded border text-xs font-bold ${getMethodStyle(selectedEndpoint.method)}`}>
                  {selectedEndpoint.method}
                </span>
                <h1 style={{ color: 'var(--project-accent)' }} className="text-lg font-bold font-mono tracking-tight select-all drop-shadow-md">
                  {selectedEndpoint.path}
                </h1>
              </div>
              <p className="text-sm text-text-muted ml-1">{selectedEndpoint.description || 'No system description provided.'}</p>
            </div>

            {/* Request Schema Blueprint Block */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-xs font-mono text-text-muted">
                <Layers size={14} />
                <span>JSON Payload Blueprint (Request Body)</span>
              </div>
              <pre className="bg-panel border border-border rounded-lg p-4 font-mono text-xs text-[#A8FFB2] overflow-x-auto">
                {JSON.stringify(selectedEndpoint.requestBody, null, 2)}
              </pre>
            </div>

            {/* Expected Response Payload Block */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-xs font-mono text-text-muted">
                <ShieldAlert size={14} />
                <span>Default Response Schema Structure (200 OK)</span>
              </div>
              <pre className="bg-panel border border-border rounded-lg p-4 font-mono text-xs text-accent-cyan overflow-x-auto">
                {JSON.stringify(selectedEndpoint.responseSchema, null, 2)}
              </pre>
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-text-muted font-mono text-xs gap-2">
            <Terminal size={24} className="opacity-40 animate-pulse" />
            <span>Select an endpoint configuration node to view its structural payload contract.</span>
          </div>
        )}
      </div>
      
      <AddEndpointModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} projectId={projectId} />
    </div>
  )
}

export default ApiRegistry
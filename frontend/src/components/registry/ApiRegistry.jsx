import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useState, useEffect } from "react";
import { Terminal, ShieldAlert, Plus, Layers, Network, List, Trash2, Edit2, ArrowRight } from 'lucide-react';
import AddEndpointModal from './AddEndpointModal';
import EditEndpointModal from './EditEndpointModal'; 
import ApiCanvas from './ApiCanvas'; 
import api from "../../lib/api";

const ApiRegistry = ({projectId}) => {
  const [selectedEndpoint, setSelectedEndpoint] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState('list'); 
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); 

  const queryClient = useQueryClient();

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

  const deleteEndpointMutation = useMutation({
    mutationFn: async (id) => await api.delete(`/endpoints/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["endpoints", projectId] });
      setSelectedEndpoint(null); 
    }
  });

  const getMethodStyle = (method) => {
    switch (method) {
      case 'GET': return 'text-[#4CAF50] bg-[#4CAF50]/10 border-[#4CAF50]/20';
      case 'POST': return 'text-accent-amber bg-accent-amber/10 border-accent-amber/20';
      case 'PUT': return 'text-accent-cyan bg-accent-cyan/10 border-accent-cyan/20';
      case 'PATCH': return 'text-[#E040FB] bg-[#E040FB]/10 border-[#E040FB]/20';
      case 'DELETE': return 'text-[#FF5252] bg-[#FF5252]/10 border-[#FF5252]/20';
      default: return 'text-text-muted bg-panel-hover border-border';
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-[calc(100vh-64px)] bg-background flex items-center justify-center">
        <div style={{ color: 'var(--project-accent)' }} className="font-mono text-xs tracking-widest animate-pulse flex items-center gap-2">
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
      
      {/* Left Panel: Route Explorer List / Graph */}
      <div className="w-full md:w-[60%] border-r border-border p-4 flex flex-col gap-3 relative">
        <div className="flex items-center justify-between mb-2 z-10">
          <div className="flex items-center gap-2">
            <Terminal size={18} style={{ color: 'var(--project-accent)' }} />
            <h2 className="font-mono text-sm font-bold tracking-wider uppercase text-text-main">API Architecture</h2>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex bg-panel border border-border rounded p-0.5">
              <button onClick={() => setViewMode('list')} className={`p-1.5 rounded transition ${viewMode === 'list' ? 'bg-background text-text-main shadow' : 'text-text-muted hover:text-text-main'}`} title="List View">
                <List size={14} />
              </button>
              <button onClick={() => setViewMode('graph')} className={`p-1.5 rounded transition ${viewMode === 'graph' ? 'bg-background text-text-main shadow' : 'text-text-muted hover:text-text-main'}`} title="Graph View">
                <Network size={14} />
              </button>
            </div>

            <button
              onClick={() => setIsAddModalOpen(true)} 
              style={{ color: 'var(--project-accent)', borderColor: 'var(--project-accent)' }}
              className="flex items-center gap-1 text-xs font-mono bg-panel-hover border px-2 py-1 rounded hover:bg-background transition shadow-[0_0_10px_var(--project-glow)]">
              <Plus size={14} /> New
            </button>
          </div>
        </div>

        {/* Dynamic Content Container */}
        <div className="flex-1 overflow-hidden rounded-lg border border-border bg-[#0A0A0A] relative flex flex-col">
          {endpoints?.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center text-text-muted font-mono text-xs p-8 text-center border-dashed border-border border m-4 rounded">
              No endpoints documented. Click 'New' to create a contract.
            </div>
          ) : viewMode === 'graph' ? (
            <ApiCanvas endpoints={endpoints} selectedEndpoint={selectedEndpoint} setSelectedEndpoint={setSelectedEndpoint} />
          ) : (
            <div className="flex flex-col gap-2 p-2 overflow-y-auto w-full h-full">
              {endpoints?.map((ep) => (
                <button
                  type="button" key={ep._id} onClick={() => setSelectedEndpoint(ep)}
                  className={`w-full text-left p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                    selectedEndpoint?._id === ep._id ? 'bg-panel border-[var(--project-accent)] shadow-[0_0_15px_var(--project-glow)]' : 'bg-panel border-border hover:border-panel-hover'
                  }`}
                >
                  <div className="flex items-center gap-3 font-mono text-xs shrink-0">
                    <span className={`px-2 py-0.5 rounded border text-[10px] font-bold tracking-wide ${getMethodStyle(ep.method)}`}>
                      {ep.method}
                    </span>
                    <span className="text-text-main font-semibold tracking-tight">{ep.path}</span>
                  </div>
                  <span className="text-[10px] text-text-muted max-w-[120px] truncate ml-2">
                    {ep.middleware ? `🛡️ ${ep.middleware}` : ep.description}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Panel: Detailed Contract Inspector */}
      <div className="flex-1 p-6 overflow-y-auto bg-[#0E0E0E]">
        {selectedEndpoint ? (
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
            
            {/* Header Block with Actions */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 font-mono mb-2">
                  <span className={`px-2.5 py-1 rounded border text-xs font-bold ${getMethodStyle(selectedEndpoint.method)}`}>
                    {selectedEndpoint.method}
                  </span>
                  <h1 style={{ color: 'var(--project-accent)' }} className="text-lg font-bold font-mono tracking-tight select-all drop-shadow-md">
                    {selectedEndpoint.path}
                  </h1>
                </div>

                {/* PIPELINE BADGE */}
                {selectedEndpoint.middleware && (
                  <div className="flex flex-wrap items-center gap-1.5 mb-2 ml-1">
                    <span className="text-[10px] font-mono text-text-muted mr-1 tracking-widest">PIPELINE:</span>
                    
                    {selectedEndpoint.middleware.split(',').map((mw, index, arr) => (
                      <React.Fragment key={index}>
                        <div 
                          className="inline-flex items-center gap-2 px-2 py-0.5 border text-[10px] font-mono rounded shadow-[0_0_10px_var(--project-glow)] animate-in fade-in zoom-in"
                          style={{ 
                            backgroundColor: 'color-mix(in srgb, var(--project-accent) 10%, transparent)', 
                            borderColor: 'color-mix(in srgb, var(--project-accent) 30%, transparent)',
                            color: 'var(--project-accent)'
                          }}
                        >
                          <div className="w-1 h-1 rounded-full animate-pulse" style={{ backgroundColor: 'var(--project-accent)' }} /> 
                          {mw.trim()}
                        </div>
                        
                        {index < arr.length - 1 && (
                          <ArrowRight size={12} className="text-border" />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                )}
                
                <p className="text-sm text-text-muted ml-1">{selectedEndpoint.description || 'No system description provided.'}</p>
              </div>

              <div className="flex gap-2 shrink-0">
                <button 
                  onClick={() => setIsEditModalOpen(true)} 
                  className="p-2 text-text-muted hover:text-[var(--project-accent)] hover:border-[var(--project-accent)] bg-panel border border-border rounded transition"
                  title="Edit Contract"
                >
                  <Edit2 size={14} />
                </button>
                <button 
                  onClick={() => {
                    if(window.confirm("CRITICAL WARNING:\n\nDelete this API contract permanently?")) {
                      deleteEndpointMutation.mutate(selectedEndpoint._id);
                    }
                  }} 
                  className="p-2 text-text-muted hover:text-[#FF5252] hover:bg-[#FF5252]/10 hover:border-[#FF5252] bg-panel border border-border rounded transition"
                  title="Purge Contract"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-xs font-mono text-text-muted">
                <Layers size={14} />
                <span>JSON Payload Blueprint (Request Body)</span>
              </div>
              <pre className="bg-panel border border-border rounded-lg p-4 font-mono text-xs text-[#A8FFB2] overflow-x-auto">
                {JSON.stringify(selectedEndpoint.requestBody, null, 2)}
              </pre>
            </div>

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
      
      <EditEndpointModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        projectId={projectId} 
        endpointData={selectedEndpoint} 
      />
    </div>
  )
}

export default ApiRegistry;
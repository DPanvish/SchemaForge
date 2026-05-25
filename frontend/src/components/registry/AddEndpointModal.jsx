import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Network, Loader2 } from 'lucide-react';
import api from '../../lib/api';

export default function AddEndpointModal({ isOpen, onClose, projectId }) {
  const queryClient = useQueryClient();
  const [method, setMethod] = useState('GET');
  const [path, setPath] = useState('');
  const [description, setDescription] = useState('');
  const [requestBody, setRequestBody] = useState('{}');
  const [responseSchema, setResponseSchema] = useState('{}');
  const [error, setError] = useState('');

  const addEndpointMutation = useMutation({
    mutationFn: async (newEndpoint) => {
      const res = await api.post('/endpoints', newEndpoint);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['endpoints', projectId] });
      setMethod('GET'); setPath(''); setDescription(''); setRequestBody('{}'); setResponseSchema('{}');
      onClose();
    },
    onError: (err) => setError(err.response?.data?.error || 'Failed to register endpoint')
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    if (!path.startsWith('/')) return setError("Path must start with '/'");

    let parsedReq, parsedRes;
    try{
      parsedReq = JSON.parse(requestBody);
      parsedRes = JSON.parse(responseSchema);
    }catch(err){
      return setError("Invalid JSON format in payload blocks. Ensure keys are in double quotes.");
    }

    addEndpointMutation.mutate({
      projectId,
      method,
      path,
      description,
      requestBody: parsedReq,
      responseSchema: parsedRes
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-background border border-border rounded-xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-panel-header">
          <div className="flex items-center gap-2 text-text-main font-mono font-bold">
            <Network className="text-accent-amber" size={20} />
            <span>REGISTER API ROUTE</span>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-[#FF5252] transition">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[70vh] flex flex-col gap-4">
          {error && <div className="p-2 bg-[#FF5252]/10 border border-[#FF5252]/20 text-[#FF5252] text-xs font-mono rounded">{error}</div>}
          
          <div className="flex gap-4">
            <div className="w-1/3">
              <label className="block text-xs font-mono text-text-muted mb-2">HTTP METHOD</label>
              <select 
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full bg-panel border border-border text-accent-cyan text-sm font-mono rounded px-4 py-2 focus:outline-none focus:border-accent-cyan"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="PATCH">PATCH</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>
            <div className="w-2/3">
              <label className="block text-xs font-mono text-text-muted mb-2">ROUTE PATH</label>
              <input 
                type="text" 
                placeholder="e.g., /api/v1/users"
                value={path}
                onChange={(e) => setPath(e.target.value)}
                className="w-full bg-panel border border-border text-text-main text-sm font-mono rounded px-4 py-2 focus:outline-none focus:border-accent-cyan transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-text-muted mb-2">DESCRIPTION</label>
            <input 
              type="text" 
              placeholder="What does this endpoint do?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-panel border border-border text-text-main text-sm font-mono rounded px-4 py-2 focus:outline-none focus:border-accent-cyan transition"
            />
          </div>

          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="block text-xs font-mono text-text-muted mb-2">REQUEST PAYLOAD (JSON)</label>
              <textarea 
                value={requestBody}
                onChange={(e) => setRequestBody(e.target.value)}
                className="w-full h-32 bg-[#0E0E0E] border border-border text-[#A8FFB2] text-xs font-mono rounded p-3 focus:outline-none focus:border-accent-amber"
              />
            </div>
            <div className="w-1/2">
              <label className="block text-xs font-mono text-text-muted mb-2">EXPECTED RESPONSE (JSON)</label>
              <textarea 
                value={responseSchema}
                onChange={(e) => setResponseSchema(e.target.value)}
                className="w-full h-32 bg-[#0E0E0E] border border-border text-accent-cyan text-xs font-mono rounded p-3 focus:outline-none focus:border-accent-amber"
              />
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-border bg-panel-header flex justify-end">
          <button 
            onClick={handleSubmit}
            disabled={addEndpointMutation.isPending}
            className="flex items-center gap-2 bg-accent-amber/10 border border-accent-amber text-accent-amber px-6 py-2 rounded font-mono text-sm font-bold hover:bg-accent-amber hover:text-background transition shadow-[0_0_15px_rgba(255,171,0,0.2)]"
          >
            {addEndpointMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : 'SAVE ENDPOINT'}
          </button>
        </div>

      </div>
    </div>
  );
}
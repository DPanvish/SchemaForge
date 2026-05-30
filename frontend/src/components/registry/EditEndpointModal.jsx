import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Network, Loader2, AlertTriangle, Edit2 } from 'lucide-react';
import api from '../../lib/api';

export default function EditEndpointModal({ isOpen, onClose, projectId, endpointData }) {
  const queryClient = useQueryClient();
  const projectAccent = 'var(--project-accent)';
  
  const [method, setMethod] = useState('GET');
  const [path, setPath] = useState('');
  const [description, setDescription] = useState('');
  const [middleware, setMiddleware] = useState('');
  const [requestBody, setRequestBody] = useState('{}');
  const [responseSchema, setResponseSchema] = useState('{}');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && endpointData) {
      setMethod(endpointData.method || 'GET');
      setPath(endpointData.path || '');
      setDescription(endpointData.description || '');
      setMiddleware(endpointData.middleware || '');
      setRequestBody(JSON.stringify(endpointData.requestBody || {}, null, 2));
      setResponseSchema(JSON.stringify(endpointData.responseSchema || {}, null, 2));
      setError('');
    } else if (!isOpen) {
      setError('');
    }
  }, [isOpen, endpointData]);

  const updateEndpointMutation = useMutation({
    mutationFn: async (updatedEndpoint) => {
      const res = await api.put(`/endpoints/${endpointData._id}`, updatedEndpoint);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['endpoints', projectId] });
      onClose();
    },
    onError: (err) => setError(err.response?.data?.error || 'Failed to update endpoint')
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    if (!path.startsWith('/')) return setError("Path must start with '/'");

    let parsedReq, parsedRes;
    try {
      parsedReq = JSON.parse(requestBody);
      parsedRes = JSON.parse(responseSchema);
    } catch(err) {
      return setError("Invalid JSON format in payload blocks. Ensure keys are in double quotes.");
    }

    updateEndpointMutation.mutate({
      projectId,
      method,
      path,
      description,
      middleware, 
      requestBody: parsedReq,
      responseSchema: parsedRes
    });
  };

  if (!isOpen || !endpointData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-background border border-border rounded-xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-panel-header shrink-0">
          <div className="flex items-center gap-2 text-text-main font-mono font-bold">
            <Edit2 style={{ color: projectAccent }} size={18} />
            <span>RECONFIGURE API ROUTE</span>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-[#FF5252] transition">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh] flex flex-col gap-4">
          
          <div className="flex gap-4">
            <div className="w-1/3">
              <label className="block text-xs font-mono text-text-muted mb-2">HTTP METHOD</label>
              <select 
                value={method}
                onChange={(e) => {
                  setMethod(e.target.value);
                  if (error) setError('');
                }}
                style={{ color: projectAccent }}
                className="w-full bg-panel border border-border text-sm font-mono rounded px-4 py-2 focus:outline-none focus:border-[var(--project-accent)]"
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
                value={path}
                onChange={(e) => {
                  setPath(e.target.value);
                  if (error) setError('');
                }}
                className="w-full bg-panel border border-border text-text-main text-sm font-mono rounded px-4 py-2 focus:outline-none focus:border-[var(--project-accent)] transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-text-muted mb-2">DESCRIPTION</label>
            <input 
              type="text" 
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (error) setError('');
              }}
              className="w-full bg-panel border border-border text-text-main text-sm font-mono rounded px-4 py-2 focus:outline-none focus:border-[var(--project-accent)] transition"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-text-muted mb-2">MIDDLEWARE (Optional)</label>
            <input 
              type="text" 
              placeholder="e.g., protect, isAdmin"
              value={middleware}
              onChange={(e) => {
                setMiddleware(e.target.value);
                if (error) setError('');
              }}
              className="w-full bg-panel border border-border text-text-main text-sm font-mono rounded px-4 py-2 focus:outline-none focus:border-[var(--project-accent)] transition"
            />
          </div>

          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="block text-xs font-mono text-text-muted mb-2">REQUEST PAYLOAD (JSON)</label>
              <textarea 
                value={requestBody}
                onChange={(e) => {
                  setRequestBody(e.target.value);
                  if (error) setError('');
                }}
                className="w-full h-32 bg-[#0E0E0E] border border-border text-[var(--project-accent)] text-xs font-mono rounded p-3 focus:outline-none focus:border-[var(--project-accent)]"
              />
            </div>
            <div className="w-1/2">
              <label className="block text-xs font-mono text-text-muted mb-2">EXPECTED RESPONSE (JSON)</label>
              <textarea 
                value={responseSchema}
                onChange={(e) => {
                  setResponseSchema(e.target.value);
                  if (error) setError('');
                }}
                className="w-full h-32 bg-[#0E0E0E] border border-border text-[var(--project-accent)] text-xs font-mono rounded p-3 focus:outline-none focus:border-[var(--project-accent)]"
              />
            </div>
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="p-4 border-t border-border bg-panel-header shrink-0 flex flex-col gap-3">
          {error && (
            <div className="p-2 bg-[#FF5252]/10 border border-[#FF5252]/20 text-[#FF5252] text-xs font-mono rounded flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
              <AlertTriangle size={14} /> {error}
            </div>
          )}

          <div className="flex justify-end">
            <button 
              onClick={handleSubmit}
              disabled={updateEndpointMutation.isPending}
              className="flex items-center gap-2 bg-[color-mix(in_srgb,var(--project-accent)_10%,transparent)] border border-[var(--project-accent)] text-[var(--project-accent)] px-6 py-2 rounded font-mono text-sm font-bold hover:bg-[var(--project-accent)] hover:text-background transition shadow-[0_0_15px_var(--project-glow)]"
            >
              {updateEndpointMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : 'UPDATE CONFIGURATION'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
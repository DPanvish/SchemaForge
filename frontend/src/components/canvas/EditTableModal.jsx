import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Plus, Trash2, Settings2, Loader2, AlertTriangle } from 'lucide-react';
import api from '../../lib/api';

export default function EditTableModal({ isOpen, onClose, projectId, nodeData }) {
  const queryClient = useQueryClient();
  const [tableName, setTableName] = useState('');
  const [fields, setFields] = useState([]);
  const [error, setError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const [nodeColor, setNodeColor] = useState('#00E5FF');
  const colorPresets = ['#00E5FF', '#FFAB00', '#A8FFB2', '#FF5252', '#E040FB', '#90CAF9'];

  useEffect(() => {
    if (nodeData) {
      setTableName(nodeData.data.tableName);
      setFields(JSON.parse(JSON.stringify(nodeData.data.fields)));
      setNodeColor(nodeData.data.color || '#00E5FF'); // Add this line
    }
  }, [nodeData]);

  // Pre-fill the form when the modal opens with a specific node
  useEffect(() => {
    if (nodeData) {
      setTableName(nodeData.data.tableName);
      // Deep copy the fields to avoid mutating the original prop
      setFields(JSON.parse(JSON.stringify(nodeData.data.fields)));
      setIsDeleting(false);
      setError('');
    }
  }, [nodeData]);

  const updateTableMutation = useMutation({
    mutationFn: async (updatedData) => {
      const res = await api.put(`/schemas/${nodeData.id}`, updatedData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schemas', projectId] });
      onClose();
    },
    onError: (err) => setError(err.response?.data?.error || 'Failed to update table')
  });

  const deleteTableMutation = useMutation({
    mutationFn: async () => {
      const res = await api.delete(`/schemas/${nodeData.id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schemas', projectId] });
      onClose();
    },
    onError: (err) => setError(err.response?.data?.error || 'Failed to delete table')
  });

  const handleAddField = () => {
    setFields([...fields, { name: '', dataType: 'String', isRequired: false, isUnique: false, isArray: false }]);
  };

  const updateField = (index, key, value) => {
    const updated = [...fields];
    updated[index][key] = value;
    setFields(updated);
  };

  const removeField = (index) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!tableName) return setError('Table name is required');
    updateTableMutation.mutate({ tableName, fields, color: nodeColor });
  };

  if (!isOpen || !nodeData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-background border border-border rounded-xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-panel-header">
          <div className="flex items-center gap-2 text-text-main font-mono font-bold">
            <Settings2 className="text-accent-cyan" size={20} />
            <span>CONFIGURE NODE: {nodeData.data.tableName}</span>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-accent-amber transition">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {error && <div className="mb-4 p-2 bg-[#FF5252]/10 border border-[#FF5252]/20 text-[#FF5252] text-xs font-mono rounded">{error}</div>}
          
          <div className="mb-6">
            <label className="block text-xs font-mono text-text-muted mb-2">COLLECTION NAME</label>
            <input 
              type="text" 
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              className="w-full bg-panel border border-border text-text-main text-sm font-mono rounded px-4 py-2 focus:outline-none focus:border-accent-cyan transition"
            />
          </div>

          <div className="mb-6 animate-in fade-in slide-in-from-top-2 duration-200">
            <label className="block text-xs font-mono text-text-muted mb-2">NODE ACCENT COLOR</label>
            <div className="flex gap-2 items-center bg-background/50 p-3 rounded border border-border">
              {colorPresets.map(c => (
                <button 
                  key={c} 
                  type="button" 
                  onClick={() => setNodeColor(c)}
                  style={{ backgroundColor: c }}
                  className={`w-6 h-6 rounded-full transition-transform duration-200 ${
                    nodeColor === c ? 'scale-125 ring-2 ring-text-main shadow-lg' : 'opacity-60 hover:opacity-100'
                  }`}
                />
              ))}
              <div className="w-px h-6 bg-border mx-2" />
              <input 
                type="color" 
                value={nodeColor} 
                onChange={(e) => setNodeColor(e.target.value)} 
                className="bg-transparent border-none w-8 h-8 cursor-pointer" 
              />
            </div>
          </div>

          <div className="mb-4 flex items-center justify-between">
            <label className="block text-xs font-mono text-text-muted">DATA SCHEMA</label>
            <button onClick={handleAddField} className="flex items-center gap-1 text-xs font-mono text-accent-cyan hover:text-accent-amber transition">
              <Plus size={14} /> Add Column
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {fields.map((field, index) => (
              <div key={index} className="flex items-center gap-3 bg-panel p-3 rounded border border-border">
                <input 
                  type="text" 
                  value={field.name}
                  onChange={(e) => updateField(index, 'name', e.target.value)}
                  className="flex-1 bg-background border border-border text-text-main text-sm font-mono rounded px-3 py-1.5 focus:outline-none focus:border-accent-cyan"
                />
                <select 
                  value={field.dataType}
                  onChange={(e) => updateField(index, 'dataType', e.target.value)}
                  className="bg-background border border-border text-accent-cyan text-sm font-mono rounded px-3 py-1.5 focus:outline-none focus:border-accent-cyan"
                >
                  <option value="String">String</option>
                  <option value="Number">Number</option>
                  <option value="Boolean">Boolean</option>
                  <option value="Date">Date</option>
                  <option value="ObjectId">ObjectId</option>
                </select>
                <label className="flex items-center gap-1 text-xs font-mono text-text-muted cursor-pointer ml-1" title="Make this an Array">
                  <input 
                    type="checkbox" 
                    checked={field.isArray || false} 
                    onChange={(e) => updateField(index, 'isArray', e.target.checked)} 
                    className="accent-accent-cyan" 
                  />
                  [ ]
                </label>
                <label className="flex items-center gap-1 text-xs font-mono text-text-muted cursor-pointer">
                  <input type="checkbox" checked={field.isRequired} onChange={(e) => updateField(index, 'isRequired', e.target.checked)} className="accent-accent-cyan" />
                  Req
                </label>
                <label className="flex items-center gap-1 text-xs font-mono text-text-muted cursor-pointer">
                  <input type="checkbox" checked={field.isUnique} onChange={(e) => updateField(index, 'isUnique', e.target.checked)} className="accent-accent-amber" />
                  Unq
                </label>
                <button onClick={() => removeField(index)} className="text-text-muted hover:text-[#FF5252] transition ml-2">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-border bg-panel-header flex items-center justify-between">
          {/* Delete Sequence */}
          {isDeleting ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-[#FF5252] flex items-center gap-1"><AlertTriangle size={14}/> Confirm Delete?</span>
              <button onClick={() => setIsDeleting(false)} className="px-3 py-1.5 rounded bg-panel border border-border text-xs font-mono text-text-main hover:bg-panel-hover">Cancel</button>
              <button onClick={() => deleteTableMutation.mutate()} className="px-3 py-1.5 rounded bg-[#FF5252]/10 border border-[#FF5252] text-xs font-mono text-[#FF5252] hover:bg-[#FF5252] hover:text-background flex items-center gap-2">
                {deleteTableMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : 'Confirm'}
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setIsDeleting(true)}
              className="flex items-center gap-2 text-text-muted hover:text-[#FF5252] font-mono text-xs px-2 py-1 rounded transition"
            >
              <Trash2 size={14} /> PURGE NODE
            </button>
          )}

          {/* Save Sequence */}
          <button 
            onClick={handleSubmit}
            disabled={updateTableMutation.isPending || isDeleting}
            className={`flex items-center gap-2 px-6 py-2 rounded font-mono text-sm font-bold transition shadow-glow ${
              isDeleting ? 'opacity-50 cursor-not-allowed bg-panel border-border text-text-muted' : 'bg-accent-cyan/10 border border-accent-cyan text-accent-cyan hover:bg-accent-cyan hover:text-background'
            }`}
          >
            {updateTableMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : 'APPLY CONFIGURATION'}
          </button>
        </div>

      </div>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Plus, Trash2, Settings2, Loader2, AlertTriangle } from 'lucide-react';
import api from '../../lib/api';
import ColorPicker from './ColorPicker';

export default function EditTableModal({ isOpen, onClose, projectId, nodeData }) {
  const queryClient = useQueryClient();
  const projectAccent = 'var(--project-accent)';
  const [tableName, setTableName] = useState('');
  const [fields, setFields] = useState([]);
  const [error, setError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const [nodeColor, setNodeColor] = useState('#00E5FF');

  useEffect(() => {
    if (isOpen && nodeData) {
      setTableName(nodeData.data.tableName || '');
      setFields(JSON.parse(JSON.stringify(nodeData.data.fields || [])));
      setNodeColor(nodeData.data.color || localStorage.getItem('schemaforge-theme') || '#00E5FF');
      setIsDeleting(false);
      setError('');
    } else if (!isOpen) {
      // Clean up when closing
      setError('');
      setIsDeleting(false);
    }
  }, [isOpen, nodeData]);

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
    setFields([...fields, { name: '', dataType: 'String', isRequired: false, isUnique: false, ofType: 'String' }]);
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
    if (!tableName.trim()) return setError('Table name is required');
    updateTableMutation.mutate({ tableName, fields, color: nodeColor });
  };

  if (!isOpen || !nodeData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-background border border-border rounded-xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-panel-header shrink-0">
          <div className="flex items-center gap-2 text-text-main font-mono font-bold">
            <Settings2 style={{ color: projectAccent }} size={20} />
            <span>CONFIGURE NODE: {nodeData.data.tableName}</span>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-[var(--project-accent)] transition">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          
          <div className="mb-6">
            <label className="block text-xs font-mono text-text-muted mb-2">COLLECTION NAME</label>
            <input 
              type="text" 
              value={tableName}
              onChange={(e) => {
                setTableName(e.target.value);
                if(error) setError(''); // UX Polish: Clear error when typing
              }}
              className="w-full bg-panel border border-border text-text-main text-sm font-mono rounded px-4 py-2 focus:outline-none focus:border-[var(--project-accent)] transition"
            />
          </div>

          <ColorPicker selectedColor={nodeColor} onChange={setNodeColor} label="COLLECTION ACCENT COLOR" />

          <div className="mb-4 flex items-center justify-between mt-6">
            <label className="block text-xs font-mono text-text-muted">DATA SCHEMA</label>
            <button onClick={handleAddField} className="flex items-center gap-1 text-xs font-mono text-[var(--project-accent)] hover:opacity-80 transition">
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
                  className="flex-1 bg-background border border-border text-text-main text-sm font-mono rounded px-3 py-1.5 focus:outline-none focus:border-[var(--project-accent)]"
                />
                
                <div className="flex items-center gap-2">
                  <select 
                    value={field.dataType}
                    onChange={(e) => {
                      updateField(index, 'dataType', e.target.value);
                      if (e.target.value === 'Array') updateField(index, 'ofType', 'String');
                    }}
                    style={{ color: projectAccent }}
                    className="bg-background border border-border text-sm font-mono rounded px-3 py-1.5 focus:outline-none focus:border-[var(--project-accent)]"
                  >
                    <option value="String">String</option>
                    <option value="Number">Number</option>
                    <option value="Boolean">Boolean</option>
                    <option value="Date">Date</option>
                    <option value="ObjectId">ObjectId</option>
                    <option value="Array">Array (List)</option>
                  </select>

                  {/* Secondary Dropdown for Arrays */}
                  {/* {field.dataType === 'Array' && (
                    <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-200">
                      <span className="text-text-muted text-xs font-mono">of</span>
                      <select 
                        value={field.ofType || 'String'}
                        onChange={(e) => updateField(index, 'ofType', e.target.value)}
                        className="bg-background border border-border text-[#E040FB] text-sm font-mono rounded px-3 py-1.5 focus:outline-none focus:border-[#E040FB]"
                      >
                        <option value="String">String</option>
                        <option value="Number">Number</option>
                        <option value="ObjectId">ObjectId</option>
                        <option value="Boolean">Boolean</option>
                      </select>
                    </div>
                  )}*/}
                </div> 

                <label className="flex items-center gap-1 text-xs font-mono text-text-muted cursor-pointer ml-2">
                  <input type="checkbox" checked={field.isRequired} onChange={(e) => updateField(index, 'isRequired', e.target.checked)} style={{ accentColor: projectAccent }} />
                  Req
                </label>
                <label className="flex items-center gap-1 text-xs font-mono text-text-muted cursor-pointer">
                  <input type="checkbox" checked={field.isUnique} onChange={(e) => updateField(index, 'isUnique', e.target.checked)} style={{ accentColor: projectAccent }} />
                  Unq
                </label>
                <button onClick={() => removeField(index)} className="text-text-muted hover:text-[#FF5252] transition ml-2">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-border bg-panel-header shrink-0 flex flex-col gap-3">
          {error && (
            <div className="p-2 bg-[#FF5252]/10 border border-[#FF5252]/20 text-[#FF5252] text-xs font-mono rounded flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
              <AlertTriangle size={14} /> {error}
            </div>
          )}

          <div className="flex items-center justify-between">
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
              className={`flex items-center gap-2 px-6 py-2 rounded font-mono text-sm font-bold transition ${
                isDeleting ? 'opacity-50 cursor-not-allowed bg-panel border-border text-text-muted' : 'bg-[color-mix(in_srgb,var(--project-accent)_10%,transparent)] border border-[var(--project-accent)] text-[var(--project-accent)] hover:bg-[var(--project-accent)] hover:text-background shadow-[0_0_15px_var(--project-glow)]'
              }`}
            >
              {updateTableMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : 'APPLY CONFIGURATION'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
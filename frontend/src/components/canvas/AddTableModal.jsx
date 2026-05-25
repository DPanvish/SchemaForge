import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Plus, Trash2, Database, Loader2 } from 'lucide-react';
import api from '../../lib/api';

export default function AddTableModal({ isOpen, onClose, projectId }) {
  const queryClient = useQueryClient();
  const [tableName, setTableName] = useState('');
  const [fields, setFields] = useState([{ name: 'id', dataType: 'String', isRequired: true, isUnique: true }]);
  const [error, setError] = useState('');

  const addTableMutation = useMutation({
    mutationFn: async (newTable) => {
      const res = await api.post('/schemas', newTable);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['schemas', projectId]);
      setTableName('');
      setFields([{ name: 'id', dataType: 'String', isRequired: true, isUnique: true }]);
      onClose();
    },
    onError: (err) => setError(err.response?.data?.error || 'Failed to create table')
  });

  const handleAddField = () => {
    setFields([...fields, { name: '', dataType: 'String', isRequired: false, isUnique: false }]);
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
    
    // Default the new table to spawn in the center of the canvas
    addTableMutation.mutate({
      projectId,
      tableName,
      fields,
      uiPosition: { x: window.innerWidth / 2 - 100, y: window.innerHeight / 2 - 100 }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-background border border-border rounded-xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-panel-header">
          <div className="flex items-center gap-2 text-text-main font-mono font-bold">
            <Database className="text-accent-cyan" size={20} />
            <span>DEFINE NEW SCHEMA</span>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-[#FF5252] transition">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {error && <div className="mb-4 p-2 bg-[#FF5252]/10 border border-[#FF5252]/20 text-[#FF5252] text-xs font-mono rounded">{error}</div>}
          
          <div className="mb-6">
            <label className="block text-xs font-mono text-text-muted mb-2">TABLE / COLLECTION NAME</label>
            <input 
              type="text" 
              placeholder="e.g., Users, Orders, Products"
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              className="w-full bg-panel border border-border text-text-main text-sm font-mono rounded px-4 py-2 focus:outline-none focus:border-accent-cyan transition"
              autoFocus
            />
          </div>

          <div className="mb-4 flex items-center justify-between">
            <label className="block text-xs font-mono text-text-muted">DATA FIELDS</label>
            <button onClick={handleAddField} className="flex items-center gap-1 text-xs font-mono text-accent-cyan hover:text-accent-amber transition">
              <Plus size={14} /> Add Column
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {fields.map((field, index) => (
              <div key={index} className="flex items-center gap-3 bg-panel p-3 rounded border border-border">
                <input 
                  type="text" 
                  placeholder="Field Name"
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

        <div className="p-4 border-t border-border bg-panel-header flex justify-end">
          <button 
            onClick={handleSubmit}
            disabled={addTableMutation.isPending}
            className="flex items-center gap-2 bg-accent-cyan/10 border border-accent-cyan text-accent-cyan px-6 py-2 rounded font-mono text-sm font-bold hover:bg-accent-cyan hover:text-background transition shadow-glow"
          >
            {addTableMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : 'INITIALIZE NODE'}
          </button>
        </div>

      </div>
    </div>
  );
}
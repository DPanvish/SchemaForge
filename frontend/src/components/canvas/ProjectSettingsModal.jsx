import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Settings, Loader2 } from 'lucide-react';
import api from '../../lib/api';
import ColorPicker from './ColorPicker';

export const ProjectSettingsModal = ({ isOpen, onClose, project }) => {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [themeColor, setThemeColor] = useState('#00E5FF');
  const [error, setError] = useState('');

  // Initialize form when modal opens
  useEffect(() => {
    if (project) {
      setName(project.name || '');
      setDescription(project.description || '');
      setThemeColor(project.themeColor === '#0A0A0A' ? '#00E5FF' : project.themeColor || '#00E5FF');
    }
  }, [project]);

  const updateProjectMutation = useMutation({
    mutationFn: async (updatedData) => {
      const res = await api.put(`/projects/${project._id}`, updatedData);
      return res.data;
    },
    onSuccess: () => {
      // Instantly triggers a re-render of the workspace with the new color!
      queryClient.invalidateQueries({ queryKey: ['project', project._id] });
      onClose();
    },
    onError: (err) => setError(err.response?.data?.error || 'Failed to update project')
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return setError('Project name is required');
    updateProjectMutation.mutate({ name, description, themeColor });
  };

  if (!isOpen || !project) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-background border border-border rounded-xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-panel-header">
          <div className="flex items-center gap-2 text-text-main font-mono font-bold">
            <Settings className="text-text-muted" size={18} />
            <span style={{ color: themeColor }}>WORKSPACE SETTINGS</span>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-[#FF5252] transition">
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {error && <div className="mb-4 p-2 bg-[#FF5252]/10 border border-[#FF5252]/20 text-[#FF5252] text-xs font-mono rounded">{error}</div>}
          
          <div className="mb-5">
            <label className="block text-xs font-mono text-text-muted mb-2">PROJECT NAME</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-panel border border-border text-text-main text-sm font-mono rounded px-4 py-2 focus:outline-none focus:border-accent-cyan transition"
            />
          </div>

          <div className="mb-5">
            <label className="block text-xs font-mono text-text-muted mb-2">DESCRIPTION</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full bg-panel border border-border text-text-main text-sm font-mono rounded px-4 py-2 focus:outline-none focus:border-accent-cyan transition resize-none"
            />
          </div>

          {/* Master Workspace Color Selector */}
          <ColorPicker selectedColor={themeColor} onChange={setThemeColor} label="GLOBAL WORKSPACE ACCENT" />
          <p className="text-[10px] text-text-muted font-mono mt-1 opacity-70">
            This color dictates glowing effects, API registry highlights, and hover paths.
          </p>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-panel-header flex justify-end">
          <button 
            onClick={handleSubmit}
            disabled={updateProjectMutation.isPending}
            style={{ backgroundColor: `${themeColor}20`, borderColor: themeColor, color: themeColor }}
            className="flex items-center gap-2 border px-6 py-2 rounded font-mono text-sm font-bold transition hover:opacity-80"
          >
            {updateProjectMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : 'SAVE CHANGES'}
          </button>
        </div>

      </div>
    </div>
  );
}

export default ProjectSettingsModal;
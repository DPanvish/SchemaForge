import { useState, useEffect } from 'react';
import { X, Settings } from 'lucide-react';
import ColorPicker from '../canvas/ColorPicker';

export default function DashboardSettingsModal({ isOpen, onClose, currentTheme, applyTheme }) {
  const [localTheme, setLocalTheme] = useState(currentTheme);

  useEffect(() => {
    if (isOpen) setLocalTheme(currentTheme);
  }, [isOpen, currentTheme]);

  const handleSave = () => {
    localStorage.setItem('schemaforge-theme', localTheme);
    applyTheme(localTheme);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-background border border-border rounded-xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-panel-header">
          <div className="flex items-center gap-2 text-text-main font-mono font-bold">
            <Settings className="text-text-muted" size={18} />
            <span style={{ color: localTheme }}>GLOBAL PREFERENCES</span>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-[#FF5252] transition">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <ColorPicker 
            selectedColor={localTheme} 
            onChange={setLocalTheme} 
            label="DASHBOARD ACCENT COLOR" 
          />
          <p className="text-[10px] text-text-muted font-mono mt-1 opacity-70">
            This color will persist across all your login sessions on this device.
          </p>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-panel-header flex justify-end">
          <button 
            onClick={handleSave}
            style={{ backgroundColor: `${localTheme}20`, borderColor: localTheme, color: localTheme }}
            className="flex items-center gap-2 border px-6 py-2 rounded font-mono text-sm font-bold transition hover:opacity-80"
          >
            APPLY THEME
          </button>
        </div>

      </div>
    </div>
  );
}
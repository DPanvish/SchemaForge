import { THEMES } from '../../lib/colors';

export default function ColorPicker({ selectedColor, onChange, label = "NODE ACCENT COLOR" }) {
  return (
    <div className="mb-6 animate-in fade-in slide-in-from-top-2 duration-200">
      <label className="block text-xs font-mono text-text-muted mb-2">{label}</label>
      <div className="flex flex-col gap-4 bg-background/50 p-4 rounded border border-border max-h-[200px] overflow-y-auto">
        
        {/* Render Categorized Preset Grids */}
        {Object.entries(THEMES).map(([category, colors]) => (
          <div key={category}>
            <span className="text-[10px] text-text-muted font-mono uppercase mb-1.5 block opacity-70 tracking-widest">
              {category}
            </span>
            <div className="flex gap-2 flex-wrap">
              {colors.map(c => (
                <button 
                  key={c} 
                  type="button" 
                  onClick={() => onChange(c)}
                  style={{ backgroundColor: c }}
                  title={c}
                  className={`w-6 h-6 rounded-full transition-all duration-200 ${
                    selectedColor.toUpperCase() === c.toUpperCase() 
                      ? 'scale-125 ring-2 ring-text-main shadow-[0_0_15px_rgba(255,255,255,0.3)]' 
                      : 'opacity-60 hover:opacity-100 hover:scale-110'
                  }`}
                />
              ))}
            </div>
          </div>
        ))}

        {/* Custom Hex Override */}
        <div className="pt-3 mt-1 border-t border-border flex items-center justify-between">
          <span className="text-[10px] text-text-muted font-mono uppercase tracking-widest">Custom Hex Override</span>
          <div className="flex items-center gap-2 bg-panel px-2 py-1 rounded border border-border">
            <span className="text-xs font-mono text-text-main uppercase">{selectedColor}</span>
            <div className="w-px h-4 bg-border mx-1" />
            <input 
              type="color" 
              value={selectedColor} 
              onChange={(e) => onChange(e.target.value)} 
              className="bg-transparent border-none w-6 h-6 cursor-pointer p-0" 
            />
          </div>
        </div>

      </div>
    </div>
  );
}
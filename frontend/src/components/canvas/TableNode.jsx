import { Handle, Position } from 'reactflow';
import { Key, Settings } from 'lucide-react';

export default function TableNode({ data, id }) {
  const nodeColor = data.color || 'var(--project-accent)';

  const handleEditClick = (e) => {
    e.stopPropagation();
    const event = new CustomEvent('editNode', { detail: { id, data: { ...data, color: nodeColor } } });
    window.dispatchEvent(event);
  };

  return (
    <div 
      style={{ '--node-accent': nodeColor, '--node-glow': `${nodeColor}33` }}
      className="bg-panel border border-border rounded-lg min-w-[200px] shadow-lg hover:border-[var(--node-accent)] hover:shadow-[0_0_15px_var(--node-glow)] transition-all duration-300 animate-in fade-in slide-in-from-top-4"
    >
      {/* Header */}
      <div className="relative bg-panel-header px-4 py-2 rounded-t-lg border-b border-border flex items-center justify-between group cursor-grab active:cursor-grabbing">
        <Handle 
          type="target" 
          position={Position.Left} 
          id="table-target"
          style={{ borderColor: 'var(--node-accent)' }}
          className="w-3 h-6 bg-[#141414] border rounded opacity-0 group-hover:opacity-100 transition-opacity -ml-6" 
        />
        <span className="font-bold text-text-main tracking-wide text-sm">{data.tableName}</span>
        <button onClick={handleEditClick} className="text-text-muted opacity-0 group-hover:opacity-100 hover:text-[var(--node-accent)] transition-all">
          <Settings size={14} />
        </button>
      </div>

      {/* Columns */}
      <div className="flex flex-col py-2 font-mono text-xs cursor-default">
        {data.fields?.map((field, index) => (
          <div key={index} className="relative flex justify-between items-center px-4 py-1 hover:bg-panel-hover group transition-colors duration-150">
            <div className="flex items-center gap-2 text-text-muted">
              {field.isUnique && <Key size={12} className="text-accent-amber" />}
              <span>{field.name}</span>
            </div>
            <span style={{ color: 'var(--node-accent)' }} className="opacity-90">
              {field.isArray ? `[${field.dataType}]` : field.dataType}
            </span>

            <Handle 
              type="source" 
              position={Position.Right} 
              id={`source-${field.name}`}
              style={field.dataType === 'ObjectId' ? { backgroundColor: 'var(--node-accent)' } : {}}
              className={`w-2 h-2 border-none opacity-0 group-hover:opacity-100 transition-opacity -mr-5 ${
                field.dataType === 'ObjectId' ? 'scale-125' : 'bg-text-muted'
              }`} 
            />
          </div>
        ))}
      </div>
    </div>
  );
}
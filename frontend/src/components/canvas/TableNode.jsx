import { Handle, Position } from 'reactflow';
import { Key, Settings } from 'lucide-react';

export default function TableNode({ data, id }) {
  // We trigger a custom event that the parent SchemaCanvas will listen for
  const handleEditClick = (e) => {
    e.stopPropagation(); // Prevent React Flow from thinking we are dragging the node
    const event = new CustomEvent('editNode', { detail: { id, data } });
    window.dispatchEvent(event);
  };

  return (
    <div className="bg-panel border border-border rounded-lg min-w-[200px] shadow-lg hover:shadow-glow hover:border-accent-cyan transition-all duration-300">
      
      {/* Table Header with Edit Icon */}
      <div className="bg-panel-header px-4 py-2 rounded-t-lg border-b border-border flex items-center justify-between group cursor-grab active:cursor-grabbing">
        <span className="font-bold text-text-main tracking-wide text-sm">{data.tableName}</span>
        <button 
          onClick={handleEditClick}
          className="text-text-muted opacity-0 group-hover:opacity-100 hover:text-accent-cyan transition-all"
          title="Edit Schema"
        >
          <Settings size={14} />
        </button>
      </div>

      {/* Table Columns */}
      <div className="flex flex-col py-2 font-mono text-xs cursor-default">
        {data.fields?.map((field, index) => (
          <div key={index} className="relative flex justify-between items-center px-4 py-1 hover:bg-panel-hover group">
            
            <Handle 
              type="target" 
              position={Position.Left} 
              id={`target-${field.name}`}
              className="w-2 h-2 bg-accent-cyan border-none opacity-0 group-hover:opacity-100 transition-opacity -ml-5" 
            />

            <div className="flex items-center gap-2 text-text-muted">
              {field.isUnique && <Key size={12} className="text-accent-amber" />}
              <span>{field.name}</span>
            </div>
            <span className="text-accent-cyan opacity-80">{field.dataType}</span>

            <Handle 
              type="source" 
              position={Position.Right} 
              id={`source-${field.name}`}
              className="w-2 h-2 bg-accent-amber border-none opacity-0 group-hover:opacity-100 transition-opacity -mr-5" 
            />
          </div>
        ))}
      </div>
    </div>
  );
}
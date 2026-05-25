import { Handle, Position } from 'reactflow';
import { Key, Settings } from 'lucide-react';

export default function TableNode({ data, id }) {
  const handleEditClick = (e) => {
    e.stopPropagation();
    const event = new CustomEvent('editNode', { detail: { id, data } });
    window.dispatchEvent(event);
  };

  return (
    <div className="bg-panel border border-border rounded-lg min-w-[200px] shadow-lg hover:shadow-glow hover:border-accent-cyan transition-all duration-300">
      
      {/* UPGRADED HEADER WITH TARGET HANDLE */}
      <div className="relative bg-panel-header px-4 py-2 rounded-t-lg border-b border-border flex items-center justify-between group cursor-grab active:cursor-grabbing">
        
        {/* NEW: Table-Level Target Handle */}
        <Handle 
          type="target" 
          position={Position.Left} 
          id="table-target" // Explicit ID so React Flow knows this is the main table target
          className="w-3 h-6 bg-accent-cyan/20 border border-accent-cyan rounded opacity-0 group-hover:opacity-100 transition-opacity -ml-6" 
        />

        <span className="font-bold text-text-main tracking-wide text-sm">{data.tableName}</span>
        <button 
          onClick={handleEditClick}
          className="text-text-muted opacity-0 group-hover:opacity-100 hover:text-accent-cyan transition-all"
        >
          <Settings size={14} />
        </button>
      </div>

      {/* Table Columns */}
      <div className="flex flex-col py-2 font-mono text-xs cursor-default">
        {data.fields?.map((field, index) => (
          <div key={index} className="relative flex justify-between items-center px-4 py-1 hover:bg-panel-hover group">
            
            {/* We keep the field-level target handle just in case you need strict field-to-field mapping later */}
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

            {/* Source Handle (Used to drag FROM an ObjectId TO a Table) */}
            <Handle 
              type="source" 
              position={Position.Right} 
              id={`source-${field.name}`}
              className={`w-2 h-2 border-none opacity-0 group-hover:opacity-100 transition-opacity -mr-5 ${
                field.dataType === 'ObjectId' ? 'bg-accent-amber shadow-[0_0_8px_rgba(255,171,0,0.8)] scale-125' : 'bg-text-muted'
              }`} 
            />
          </div>
        ))}
      </div>
    </div>
  );
}
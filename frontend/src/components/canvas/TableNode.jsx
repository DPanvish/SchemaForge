import { Handle, Position } from 'reactflow';
import { Key } from 'lucide-react';

const TableNode = ({ data }) => {
  return (
    <div className="bg-panel border border-border rounded-lg min-w-[200px] shadow-lg hover:shadow-glow hover:border-accent-cyan transition-all duration-300">
      
      {/* Table Header */}
      <div className="bg-panel-header px-4 py-2 rounded-t-lg border-b border-border flex items-center justify-between">
        <span className="font-bold text-text-main tracking-wide text-sm">{data.tableName}</span>
      </div>

      {/* Table Columns */}
      <div className="flex flex-col py-2 font-mono text-xs">
        {data.fields?.map((field, index) => (
          <div key={index} className="relative flex justify-between items-center px-4 py-1 hover:bg-panel-hover group">
            
            {/* Left Handle (Target) */}
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

            {/* Right Handle (Source) */}
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

export default TableNode;
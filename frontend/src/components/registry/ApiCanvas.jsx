import { useMemo } from 'react';
import ReactFlow, { Background, Controls, MarkerType, Handle, Position } from 'reactflow';
import 'reactflow/dist/style.css';
import { Layers, Zap } from 'lucide-react';


// The Central Hub Node (e.g., "/api/auth")
const RouterNode = ({ data }) => (
  <div 
    className="bg-panel border-2 rounded-xl p-4 shadow-[0_0_20px_var(--project-glow)] animate-in zoom-in duration-300"
    style={{ borderColor: 'var(--project-accent, #00E5FF)' }}
  >
    <Handle type="source" position={Position.Bottom} className="opacity-0" />
    <div className="flex flex-col items-center gap-2">
      <div className="p-2 rounded-full bg-background border border-border" style={{ color: 'var(--project-accent)' }}>
        <Layers size={20} />
      </div>
      <span className="font-mono text-sm font-bold text-text-main tracking-wider">{data.label}</span>
      <span className="text-[10px] text-text-muted font-mono uppercase tracking-widest">Router Hub</span>
    </div>
  </div>
);

// The Specific Endpoint Node
const EndpointNode = ({ data }) => {
  const isSelected = data.isSelected;
  return (
    <div 
      onClick={data.onClick}
      className={`bg-background border rounded-lg p-3 min-w-[200px] cursor-pointer transition-all duration-300 ${
        isSelected ? 'border-[var(--project-accent)] shadow-[0_0_15px_var(--project-glow)] scale-105' : 'border-border hover:border-text-muted'
      }`}
    >
      <Handle type="target" position={Position.Top} className="opacity-0" />
      <div className="flex items-center gap-3 font-mono text-xs">
        <span className={`px-2 py-0.5 rounded border text-[10px] font-bold tracking-wide ${data.methodStyle}`}>
          {data.method}
        </span>
        <span className="text-text-main font-semibold tracking-tight truncate">{data.path}</span>
      </div>
    </div>
  );
};

const nodeTypes = { router: RouterNode, endpoint: EndpointNode };

// --- MAIN COMPONENT ---

export default function ApiCanvas({ endpoints, selectedEndpoint, setSelectedEndpoint }) {
  
  const getMethodStyle = (method) => {
    switch (method) {
      case 'GET': return 'text-[#4CAF50] bg-[#4CAF50]/10 border-[#4CAF50]/20';
      case 'POST': return 'text-[#FFAB00] bg-[#FFAB00]/10 border-[#FFAB00]/20';
      case 'PUT': return 'text-[#00E5FF] bg-[#00E5FF]/10 border-[#00E5FF]/20';
      case 'DELETE': return 'text-[#FF5252] bg-[#FF5252]/10 border-[#FF5252]/20';
      default: return 'text-text-muted bg-panel border-border';
    }
  };

  // The Layout Math Engine
  const { nodes, edges } = useMemo(() => {
    if (!endpoints || endpoints.length === 0) return { nodes: [], edges: [] };

    // Group endpoints by Base Path
    const hubs = {};
    endpoints.forEach(ep => {
      const parts = ep.path.split('/').filter(Boolean);
      const basePath = parts.length > 1 ? `/${parts[0]}/${parts[1]}` : `/${parts[0] || ''}`;
      
      if (!hubs[basePath]) hubs[basePath] = [];
      hubs[basePath].push(ep);
    });

    const generatedNodes = [];
    const generatedEdges = [];
    
    let hubOffsetX = 0; // Spacing between different hubs

    // Build the Graph
    Object.entries(hubs).forEach(([hubPath, hubEndpoints], hubIndex) => {
      const hubId = `hub-${hubIndex}`;
      
      generatedNodes.push({
        id: hubId,
        type: 'router',
        position: { x: hubOffsetX, y: 50 },
        data: { label: hubPath },
        draggable: true,
      });

      // Create Endpoint Nodes connected to this hub
      hubEndpoints.forEach((ep, epIndex) => {
        const epId = `ep-${ep._id}`;
        
        generatedNodes.push({
          id: epId,
          type: 'endpoint',
          // Stagger them downward vertically
          position: { x: hubOffsetX, y: 250 + (epIndex * 80) }, 
          data: { 
            method: ep.method, 
            path: ep.path,
            methodStyle: getMethodStyle(ep.method),
            isSelected: selectedEndpoint?._id === ep._id,
            onClick: () => setSelectedEndpoint(ep)
          },
          draggable: true,
        });

        // Draw the connecting wire
        generatedEdges.push({
          id: `e-${hubId}-${epId}`,
          source: hubId,
          target: epId,
          type: 'smoothstep',
          animated: true, // Make the data flow animation!
          style: { stroke: 'var(--project-accent, #00E5FF)', strokeWidth: 2, opacity: 0.6 },
          markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--project-accent, #00E5FF)' },
        });
      });

      // Move the X offset for the next Hub so they don't overlap
      hubOffsetX += 350; 
    });

    return { nodes: generatedNodes, edges: generatedEdges };
  }, [endpoints, selectedEndpoint]);

  return (
    <div className="w-full h-full bg-[#0A0A0A]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        nodesDraggable={false}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        proOptions={{ hideAttribution: true }} // Hides the React Flow watermark for a pro look
      >
        <Background color="#333" gap={16} size={1} />
        <Controls className="bg-panel border-border fill-text-main" showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
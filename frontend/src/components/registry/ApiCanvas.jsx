import { useMemo } from 'react';
import ReactFlow, { Background, Controls, MarkerType, Handle, Position } from 'reactflow';
import 'reactflow/dist/style.css';
import { Layers } from 'lucide-react';

// --- NODE DESIGNS ---

const RouterNode = ({ data }) => (
  <div 
    className="w-[220px] bg-panel/90 backdrop-blur-xl border-2 rounded-2xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.5)] animate-in zoom-in duration-300 flex flex-col items-center gap-3"
    style={{ borderColor: 'var(--project-accent, #00E5FF)', boxShadow: '0 0 25px color-mix(in srgb, var(--project-accent) 20%, transparent)' }}
  >
    <Handle type="source" position={Position.Bottom} className="opacity-0" />
    <div className="p-3 rounded-xl bg-background/80 border border-border/50 shadow-inner" style={{ color: 'var(--project-accent)' }}>
      <Layers size={24} />
    </div>
    <div className="flex flex-col items-center w-full">
      <span className="font-mono text-base font-bold text-text-main tracking-wider truncate text-center w-full">{data.label}</span>
      <span className="text-[10px] text-text-muted font-mono uppercase tracking-widest mt-1">Router Hub</span>
    </div>
  </div>
);

const MiddlewareNode = ({ data }) => (
  <div className="w-[180px] flex justify-center">
    <Handle type="target" position={Position.Top} className="opacity-0" />
    <div 
      className="rounded-full px-5 py-2 flex items-center gap-2.5 border backdrop-blur-md shadow-lg animate-in fade-in slide-in-from-top-4"
      style={{ 
        backgroundColor: 'color-mix(in srgb, var(--project-accent) 15%, transparent)', 
        borderColor: 'color-mix(in srgb, var(--project-accent) 60%, transparent)',
        color: 'var(--project-accent)'
      }}
    >
      <div className="w-2 h-2 rounded-full animate-pulse shrink-0" style={{ backgroundColor: 'var(--project-accent)', boxShadow: '0 0 10px var(--project-accent)' }} />
      <span className="font-mono text-[9px] font-bold tracking-widest uppercase mt-px truncate max-w-[120px]" title={data.label}>{data.label}</span>
    </div>
    <Handle type="source" position={Position.Bottom} className="opacity-0" />
  </div>
);

const EndpointNode = ({ data }) => {
  return (
    <div 
      onClick={data.onClick}
      className={`w-[260px] bg-panel/95 backdrop-blur-sm border rounded-xl p-3.5 cursor-pointer transition-all duration-300 ${
        data.isSelected ? 'border-[var(--project-accent)] shadow-[0_0_20px_color-mix(in_srgb,var(--project-accent)_30%,transparent)] scale-105' : 'border-border/60 hover:border-text-muted hover:shadow-lg'
      }`}
    >
      <Handle type="target" position={Position.Top} className="opacity-0" />
      <div className="flex items-center gap-3 font-mono text-xs">
        <span className={`px-2.5 py-1 rounded-md border text-[10px] font-bold tracking-wider shrink-0 ${data.methodStyle}`}>{data.method}</span>
        <span className="text-text-main font-semibold tracking-tight truncate pt-px">{data.path}</span>
      </div>
    </div>
  );
};

const nodeTypes = { router: RouterNode, endpoint: EndpointNode, middleware: MiddlewareNode };

// --- MULTI-CHAIN PIPELINE ENGINE ---

export default function ApiCanvas({ endpoints, selectedEndpoint, setSelectedEndpoint }) {
  
  const getMethodStyle = (method) => {
    switch (method) {
      case 'GET': return 'text-[#4CAF50] bg-[#4CAF50]/10 border-[#4CAF50]/20';
      case 'POST': return 'text-[#FFAB00] bg-[#FFAB00]/10 border-[#FFAB00]/20';
      case 'PUT': return 'text-[#00E5FF] bg-[#00E5FF]/10 border-[#00E5FF]/20';
      case 'PATCH': return 'text-[#E040FB] bg-[#E040FB]/10 border-[#E040FB]/20';
      case 'DELETE': return 'text-[#FF5252] bg-[#FF5252]/10 border-[#FF5252]/20';
      default: return 'text-text-muted bg-panel border-border';
    }
  };

  const { nodes, edges } = useMemo(() => {
    if (!endpoints || endpoints.length === 0) return { nodes: [], edges: [] };

    const hubs = {};
    endpoints.forEach(ep => {
      const parts = ep.path.split('/').filter(Boolean);
      const basePath = parts.length > 1 ? `/${parts[0]}/${parts[1]}` : `/${parts[0] || ''}`;
      if (!hubs[basePath]) hubs[basePath] = [];
      hubs[basePath].push(ep);
    });

    const generatedNodes = [];
    const generatedEdges = [];
    
    let globalOffsetX = 100; 
    const COLUMN_WIDTH = 320; 
    
    const ROW_HEIGHT = 95;    
    const NODE_WIDTHS = { hub: 220, middleware: 180, endpoint: 260 };

    const START_Y_HUB = 40;
    const START_Y_MIDDLEWARE = 280;     
    const START_Y_PUBLIC = 280;         
    const GAP_BETWEEN_MIDDLEWARES = 70; 
    const GAP_AFTER_MIDDLEWARE = 100;   

    Object.entries(hubs).forEach(([hubPath, hubEndpoints], hubIndex) => {
      const hubId = `hub-${hubIndex}`;
      
      const mwPipelines = [...new Set(hubEndpoints.map(ep => ep.middleware ? ep.middleware.trim() : ''))];
      mwPipelines.sort((a, b) => a === '' ? -1 : b === '' ? 1 : 0);

      const totalColumns = mwPipelines.length;
      const hubCenterX = globalOffsetX + ((totalColumns - 1) * COLUMN_WIDTH) / 2;

      generatedNodes.push({
        id: hubId, type: 'router', position: { x: hubCenterX - (NODE_WIDTHS.hub / 2), y: START_Y_HUB }, data: { label: hubPath }, draggable: true,
      });

      const columnYTracker = {};
      const mwColIndices = {};

      mwPipelines.forEach((pipelineStr, colIndex) => {
        mwColIndices[pipelineStr] = colIndex;
        const colCenterX = globalOffsetX + (colIndex * COLUMN_WIDTH);

        if (pipelineStr === '') {
          columnYTracker[pipelineStr] = START_Y_PUBLIC; 
        } else {
          const steps = pipelineStr.split(',').map(s => s.trim()).filter(Boolean);
          
          steps.forEach((step, stepIndex) => {
            const mwNodeId = `mw-${hubId}-${colIndex}-${stepIndex}`;
            
            generatedNodes.push({
              id: mwNodeId, type: 'middleware', 
              position: { 
                x: colCenterX - (NODE_WIDTHS.middleware / 2), 
                y: START_Y_MIDDLEWARE + (stepIndex * GAP_BETWEEN_MIDDLEWARES) 
              }, 
              data: { label: step }, draggable: true,
            });

            const sourceId = stepIndex === 0 ? hubId : `mw-${hubId}-${colIndex}-${stepIndex - 1}`;
            
            generatedEdges.push({
              id: `e-${sourceId}-to-${mwNodeId}`, source: sourceId, target: mwNodeId, 
              type: 'smoothstep', pathOptions: { borderRadius: 24 }, animated: true,
              style: { stroke: 'var(--project-accent)', strokeWidth: 2, opacity: 0.7 }, 
              markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--project-accent)' },
            });
          });

          columnYTracker[pipelineStr] = START_Y_MIDDLEWARE + ((steps.length - 1) * GAP_BETWEEN_MIDDLEWARES) + GAP_AFTER_MIDDLEWARE; 
        }
      });

      hubEndpoints.forEach((ep) => {
        const epId = `ep-${ep._id}`;
        const pipelineStr = ep.middleware ? ep.middleware.trim() : '';
        const colIndex = mwColIndices[pipelineStr];
        
        const colCenterX = globalOffsetX + (colIndex * COLUMN_WIDTH); 
        const targetY = columnYTracker[pipelineStr];
        columnYTracker[pipelineStr] += ROW_HEIGHT; 

        generatedNodes.push({
          id: epId, type: 'endpoint', 
          position: { x: colCenterX - (NODE_WIDTHS.endpoint / 2), y: targetY },
          data: { method: ep.method, path: ep.path, methodStyle: getMethodStyle(ep.method), isSelected: selectedEndpoint?._id === ep._id, onClick: () => setSelectedEndpoint(ep) }, draggable: true,
        });

        if (pipelineStr === '') {
          generatedEdges.push({
            id: `e-hub-to-${epId}`, source: hubId, target: epId, type: 'smoothstep', pathOptions: { borderRadius: 24 }, animated: true,
            style: { stroke: 'var(--project-accent)', strokeWidth: 2, opacity: 0.7 }, markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--project-accent)' },
          });
        } else {
          const steps = pipelineStr.split(',').filter(Boolean);
          const lastMwId = `mw-${hubId}-${colIndex}-${steps.length - 1}`;
          
          generatedEdges.push({
            id: `e-${lastMwId}-to-${epId}`, source: lastMwId, target: epId, type: 'smoothstep', pathOptions: { borderRadius: 24 }, animated: true,
            style: { stroke: 'var(--project-accent)', strokeWidth: 2, opacity: 0.7 }, markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--project-accent)' },
          });
        }
      });

      globalOffsetX += (totalColumns * COLUMN_WIDTH) + 120; 
    });

    return { nodes: generatedNodes, edges: generatedEdges };
  }, [endpoints, selectedEndpoint]);

  return (
    <div className="w-full h-full bg-[#0A0A0A]">
      <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} nodesDraggable={false} fitView fitViewOptions={{ padding: 0.2 }} proOptions={{ hideAttribution: true }}>
        <Background color="color-mix(in srgb, var(--project-accent) 20%, transparent)" gap={20} size={1.5} variant="dots" />
        <Controls className="bg-panel border-border fill-text-main" showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
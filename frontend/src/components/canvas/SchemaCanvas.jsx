import {  useState, useEffect, useCallback } from 'react';
import ReactFlow, { Background, Controls, MiniMap } from 'reactflow';
import { Code2, Database } from 'lucide-react';
import 'reactflow/dist/style.css'; 
import { useQuery, useMutation } from '@tanstack/react-query';
import useCanvasStore from '../../store/useCanvasStore';
import TableNode from './TableNode';
import ExportModal from './ExportModal';
import AddTableModal from './AddTableModal';
import api from '../../lib/api';

const nodeTypes = { tableNode: TableNode };

const SchemaCanvas = ({projectId}) => {
  const { nodes, setNodes, edges, setEdges, onNodesChange, onEdgesChange, onConnect} = useCanvasStore();
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isAddTableOpen, setIsAddTableOpen] = useState(false);

  console.log("Canvas Project ID:", projectId);

  const { data: dbNodes, isLoading, error } = useQuery({
    queryKey: ['schemas', projectId],
    queryFn: async () => {
      console.log("Axios Request Fired for Project:", projectId);
      const res = await api.get(`/schemas/${projectId}`);
      console.log("Axios Response Received:", res.data);
      return res.data;
    },
    enabled: !!projectId 
  });

  useEffect(() => {
    console.log("STEP 1: useEffect triggered. dbNodes =", dbNodes);

    if (dbNodes && Array.isArray(dbNodes)) {
      console.log("STEP 2: dbNodes is a valid array of length:", dbNodes.length);
      
      try {
        const formattedNodes = dbNodes.map((node) => {
          // CRASH PREVENTION: Default to empty arrays/objects if data is missing
          const safeFields = node.fields || [];
          const safePos = node.uiPosition || { x: 50, y: 50 };

          const cleanFields = safeFields.map(field => ({
            name: field.name || 'unnamed',
            dataType: field.dataType || 'String',
            isRequired: !!field.isRequired,
            isUnique: !!field.isUnique
          }));

          return {
            id: String(node._id), 
            type: 'tableNode',
            position: {
              x: Number(safePos.x),
              y: Number(safePos.y)
            },
            data: {
              tableName: node.tableName || 'Unnamed Table',
              fields: cleanFields 
            }
          };
        });

        console.log("STEP 3: Formatting successful. Formatted Nodes =", formattedNodes);
        
        // Push to Zustand
        setNodes(formattedNodes);
        
        console.log("STEP 4: setNodes has been dispatched!");
        
      } catch (err) {
        // If the mapping fails silently, this will catch it and force it to display!
        console.error("CRITICAL ERROR DURING FORMATTING:", err);
      }
    }
  }, [dbNodes, setNodes]);

  const updatePositionMutation = useMutation({
    mutationFn: async({id, position}) => {
      const res = await api.put(`/schemas/${id}`, {uiPosition: position});
      return res.data;
    },
    onError: (error) => console.error("Failed to save layout", error)
  });

  const onNodeDragStop = useCallback((event, node) => {
    updatePositionMutation.mutate({ id: node.id, position: node.position });
  }, [updatePositionMutation]);

  if(isLoading){
    return <div className="p-8 text-accent-cyan font-mono">Loading Canvas...</div>;
  }

  if(!projectId){
    return <div className="p-8 text-text-muted font-mono">Select a project to view its schema canvas.</div>;
  }
  
  return (
    <div className="w-full h-[calc(100vh-64px)] bg-background relative">
      <div className="absolute top-4 left-4 z-10 text-xs font-mono text-[#4CAF50] bg-panel p-2 rounded border border-border">
        Nodes in State: {nodes.length}
      </div> 
      <div className="absolute top-4 right-4 z-10 flex gap-3">
        <button 
          onClick={() => setIsAddTableOpen(true)}
          className="flex items-center gap-2 bg-panel border border-border px-4 py-2 rounded-md font-mono text-xs font-bold text-text-main hover:bg-panel-hover hover:border-accent-amber hover:text-accent-amber transition-all"
        >
          <Database size={16} />
          ADD TABLE
        </button>

        <button 
          onClick={() => setIsExportModalOpen(true)}
          className="flex items-center gap-2 bg-panel border border-accent-cyan/50 shadow-glow px-4 py-2 rounded-md font-mono text-xs font-bold text-accent-cyan hover:bg-panel-hover hover:border-accent-cyan transition-all"
        >
          <Code2 size={16} />
          GENERATE CODE
        </button>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        fitView
        className="dark"
      >
        <Background color="#262626" gap={20} size={1} />
        <Controls style={{ backgroundColor: '#141414', border: '1px solid #262626', fill: '#E5E5E5' }} />
        <MiniMap 
          nodeColor="#262626" 
          maskColor="rgba(10, 10, 10, 0.7)" 
          style={{ backgroundColor: '#141414' }} 
        />
      </ReactFlow>

      <ExportModal 
        isOpen={isExportModalOpen} 
        onClose={() => setIsExportModalOpen(false)} 
        nodes={nodes} 
      />

      <AddTableModal isOpen={isAddTableOpen} onClose={() => setIsAddTableOpen(false)} projectId={projectId} />
    </div>
  );
}

export default SchemaCanvas
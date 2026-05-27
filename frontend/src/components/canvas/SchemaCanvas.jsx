import { useEffect, useCallback, useState } from 'react';
import ReactFlow, { Background, ConnectionMode, Controls, MiniMap } from 'reactflow';
import 'reactflow/dist/style.css'; 
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Database, Code2 } from 'lucide-react';
import useCanvasStore from '../../store/useCanvasStore';
import TableNode from './TableNode';
import RelationEdge from './RelationEdge';
import AddTableModal from './AddTableModal';
import EditTableModal from './EditTableModal';
import ExportModal from './ExportModal';
import api from '../../lib/api';

// Defined outside the component to prevent React Flow re-render crashes
const nodeTypes = { tableNode: TableNode };
const edgeTypes = { relation: RelationEdge };

export default function SchemaCanvas({ projectId }) {
  const queryClient = useQueryClient();
  
  // UI Modal States
  const [isAddTableOpen, setIsAddTableOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isEditTableOpen, setIsEditTableOpen] = useState(false);
  const [editingNodeData, setEditingNodeData] = useState(null);

  // Zustand Global State
  const { 
    nodes, setNodes, 
    edges, setEdges, 
    onNodesChange, onEdgesChange, onConnect 
  } = useCanvasStore();

  // Fetch Project Data (for saved edges)
  const { data: projectData } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const res = await api.get(`/projects/${projectId}`);
      return res.data;
    },
    enabled: !!projectId
  });

  // Fetch Schema Nodes Data
  const { data: dbNodes } = useQuery({
    queryKey: ['schemas', projectId],
    queryFn: async () => {
      const res = await api.get(`/schemas/${projectId}`);
      return res.data;
    },
    enabled: !!projectId 
  });

  // Sync Nodes -> React Flow
  useEffect(() => {
    if (dbNodes && Array.isArray(dbNodes) && dbNodes.length > 0) {
      const formattedNodes = dbNodes.map((node) => {
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
          position: { x: Number(safePos.x), y: Number(safePos.y) },
          data: {
            tableName: node.tableName || 'Unnamed Table',
            fields: cleanFields,
            color: node.color || '#00E5FF',
          }
        };
      });
      setNodes(formattedNodes);
    } else if (dbNodes?.length === 0) {
      setNodes([]); 
    }
  }, [dbNodes, setNodes]);

  // Sync Edges -> React Flow
  useEffect(() => {
    if(projectData && Array.isArray(projectData.edges)){
      const formattedEdges = projectData.edges.map(edge => ({
        ...edge,
        type: 'relation' // Force custom interactive edge
      }));
      setEdges(formattedEdges);
    }else if(projectData){
      setEdges([]);
    }
  }, [projectData, setEdges]);

  // Clear canvas state when switching between projects
  useEffect(() => {
    return () => {
      setNodes([]);
      setEdges([]);
    };
  }, [projectId, setNodes, setEdges]);

  // Listen for the custom Edit Node event from TableNode.jsx
  useEffect(() => {
    const handleEditEvent = (event) => {
      setEditingNodeData(event.detail);
      setIsEditTableOpen(true);
    };
    window.addEventListener('editNode', handleEditEvent);
    return () => window.removeEventListener('editNode', handleEditEvent);
  }, []);

  // Save Node Position
  const updatePositionMutation = useMutation({
    mutationFn: async ({ id, position, nodeData }) => {
      const cleanPosition = {
        x: Math.round(position.x),
        y: Math.round(position.y)
      };
      
      const res = await api.put(`/schemas/${id}`, { 
        projectId, 
        tableName: nodeData.tableName,
        fields: nodeData.fields,
        uiPosition: cleanPosition 
      });
      return res.data;
    },
    onError: (error) => console.error("❌ Backend rejected the node save:", error.response?.data || error.message)
  });

  const onNodeDragStop = useCallback((event, node) => {
    updatePositionMutation.mutate({ 
      id: node.id, 
      position: node.position,
      nodeData: node.data 
    });
  }, [updatePositionMutation]);

  // Save Edge Relationships
  const saveEdgesMutation = useMutation({
    mutationFn: async (currentEdges) => {
      await api.put(`/projects/${projectId}/edges`, { edges: currentEdges });
    },
    onError: (error) => console.error("❌ Backend rejected the edge save:", error)
  });

  // Debounced auto-save for edges (waits 1 second after connection/deletion to save)
  useEffect(() => {
    if (projectId && edges && projectData) {
      const timeoutId = setTimeout(() => {
         saveEdgesMutation.mutate(edges);
      }, 1000); 
      return () => clearTimeout(timeoutId);
    }
  }, [edges, projectId, projectData]);

  return (
    <div className="w-full h-[calc(100vh-64px)] bg-background relative">
      
      {/* Floating Action Buttons */}
      <div className="absolute top-4 right-4 z-10 flex gap-3">
        <button 
          onClick={() => setIsAddTableOpen(true)}
          className="flex items-center gap-2 bg-panel border border-border px-4 py-2 rounded-md font-mono text-xs font-bold text-text-main hover:bg-panel-hover hover:border-[var(--project-accent)] hover:text-[var(--project-accent)] transition-all"
        >
          <Database size={16} />
          ADD TABLE
        </button>
        {/* <button 
          onClick={() => setIsExportModalOpen(true)}
          className="flex items-center gap-2 bg-panel border border-accent-cyan/50 shadow-glow px-4 py-2 rounded-md font-mono text-xs font-bold text-accent-cyan hover:bg-panel-hover hover:border-accent-cyan transition-all"
        >
          <Code2 size={16} />
          GENERATE CODE
        </button> */}
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionMode={ConnectionMode.Loose}
        defaultEdgeOptions={{ type: 'relation', animated: true }} 
        fitView
        className="dark"
      >
        <Background color="#262626" gap={20} size={1} />
        <Controls style={{ backgroundColor: '#141414', border: '1px solid #262626', fill: '#E5E5E5' }} />
        <MiniMap nodeColor="#262626" maskColor="rgba(10, 10, 10, 0.7)" style={{ backgroundColor: '#141414' }} />
      </ReactFlow>

      {/* Mounted Modals */}
      <AddTableModal isOpen={isAddTableOpen} onClose={() => setIsAddTableOpen(false)} projectId={projectId} />
      <ExportModal isOpen={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} nodes={nodes} />
      <EditTableModal 
        isOpen={isEditTableOpen} 
        onClose={() => { setIsEditTableOpen(false); setEditingNodeData(null); }} 
        projectId={projectId} 
        nodeData={editingNodeData} 
      />
    </div>
  );
}

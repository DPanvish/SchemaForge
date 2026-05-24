import { useEffect, useCallback, useMemo } from 'react';
import ReactFlow, { Background, Controls, MiniMap } from 'reactflow';
import 'reactflow/dist/style.css'; 
import { useQuery, useMutation } from '@tanstack/react-query';

import useCanvasStore from '../../store/useCanvasStore';
import TableNode from './TableNode';
import api from '../../lib/api';


const SchemaCanvas = ({projectId}) => {
  const { nodes, setNodes, edges, setEdges, onNodesChange, onEdgesChange, onConnect} = useCanvasStore();

  const nodeTypes = useMemo(() => ({
    tableNode: TableNode
  }), []);

  const {date: dbNodes, isLoading} = useQuery({
    queryKey: ["schemas", projectId],
    queryFn: async() => {
      const res = await api.get(`/schemas/${projectId}`);
      return res.data;
    },
    enabled: !!projectId
  });

  useEffect(() => {
    if(dbNodes){
      const formattedNodes = dbNodes.map(node => ({
        id: node._id,
        type: "tableNode",
        position: node.uiPosition || {x: 0, y: 0},
        data: {
          tableName: node.tableName,
          fields: node.fields
        }
      }));
      setNodes(formattedNodes);
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
    <div className="w-full h-[calc(100vh-64px)] bg-background">
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
    </div>
  );
}

export default SchemaCanvas
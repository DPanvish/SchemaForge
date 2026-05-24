import { create } from "zustand";
import { applyNodeChanges, applyEdgeChanges, addEdge } from 'reactflow';

const useCanvasStore = create((set, get) => ({
  activeProjectId: null,
  nodes: [],
  edges: [],
  setActiveProject: (id) => set({activeProjectId: id}),
  setNodes: (nodes) => set({nodes}),
  setEdges: (edges) => set({edges}),
  updateNodePosition: (id, position) => set((state) => ({
    nodes: state.nodes.map((node) => node.id === id ? {...node, position} : node)
  })),
  onNodesChange: (changes) => {
    set({ nodes: applyNodeChanges(changes, get().nodes) });
  },
  onEdgesChange: (changes) => {
    set({ edges: applyEdgeChanges(changes, get().edges) });
  },
  onConnect: (connection) => {
    set({ edges: addEdge({ ...connection, animated: true, style: { stroke: '#00E5FF' } }, get().edges) });
  }
}));

export default useCanvasStore;
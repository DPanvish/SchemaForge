import { create } from "zustand";

const useCanvasStore = create((set) => ({
  activeProjectId: null,
  nodes: [],
  edges: [],
  setActiveProject: (id) => set({activeProjectId: id}),
  setNodes: (nodes) => set({nodes}),
  setEdges: (edges) => set({edges}),
  updateNodePosition: (id, position) => set((state) => ({
    nodes: state.nodes.map((node) => node.id === id ? {...node, position} : node)
  }))
}));

export default useCanvasStore;
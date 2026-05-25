import { BaseEdge, EdgeLabelRenderer, getBezierPath } from 'reactflow';
import { X } from 'lucide-react';
import useCanvasStore from '../../store/useCanvasStore';

export default function RelationEdge({ 
  id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style, markerEnd 
}) {
  // Calculate the path and the exact center point for our button
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition,
  });

  const deleteEdge = useCanvasStore((state) => state.deleteEdge);

  return (
    <>
      {/* The glowing cyber-line */}
      <BaseEdge 
        path={edgePath} 
        markerEnd={markerEnd} 
        style={{ ...style, strokeWidth: 2, stroke: 'var(--color-accent-cyan)' }} 
      />
      
      {/* The Interactive HTML Layer */}
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all', // Crucial: allows clicking the button instead of the canvas
          }}
          className="nodrag nopan"
        >
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevent clicking through to the canvas
              deleteEdge(id);
            }}
            className="w-5 h-5 bg-panel border border-border rounded-full flex items-center justify-center text-text-muted hover:text-[#FF5252] hover:border-[#FF5252] hover:bg-[#FF5252]/10 transition-all shadow-lg group cursor-pointer"
            title="Remove Relation"
          >
            <X size={12} className="group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
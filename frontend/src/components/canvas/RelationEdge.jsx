import { useState } from 'react';
import { EdgeLabelRenderer, getBezierPath } from 'reactflow';
import { X } from 'lucide-react';
import useCanvasStore from '../../store/useCanvasStore';

export default function RelationEdge({ 
  id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, markerEnd 
}) {
  const [isHovered, setIsHovered] = useState(false);
  const deleteEdge = useCanvasStore((state) => state.deleteEdge);

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition,
  });

  return (
    <g 
      onMouseEnter={() => setIsHovered(true)} 
      onMouseLeave={() => setIsHovered(false)}
      className="cursor-pointer"
    >
      {/* Invisible thick path to make mouse hovering easy */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
      />

      {/* The visible animated connection line */}
      <path
        d={edgePath}
        fill="none"
        // Uses the CSS variable, falls back to Cyan, rests at grey
        stroke={isHovered ? 'var(--project-accent, #00E5FF)' : '#525252'}
        strokeWidth={isHovered ? 3 : 2}
        className="transition-all duration-300"
        markerEnd={markerEnd}
      />
      
      {/* The Interactive Delete Button Overlay */}
      {isHovered && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="nodrag nopan animate-in zoom-in duration-200"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteEdge(id);
              }}
              className="w-6 h-6 bg-panel border border-[#FF5252] rounded-full flex items-center justify-center text-[#FF5252] hover:bg-[#FF5252] hover:text-white transition-all shadow-[0_0_15px_rgba(255,82,82,0.4)]"
              title="Remove Relation"
            >
              <X size={14} />
            </button>
          </div>
        </EdgeLabelRenderer>
      )}
    </g>
  );
}
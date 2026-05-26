import { useState } from 'react';
import { EdgeLabelRenderer, getBezierPath } from 'reactflow';
import { X } from 'lucide-react';
import useCanvasStore from '../../store/useCanvasStore';

export default function RelationEdge({ 
  id, source, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition
}) {
  const [isHovered, setIsHovered] = useState(false);
  const deleteEdge = useCanvasStore((state) => state.deleteEdge);
  const sourceNode = useCanvasStore((state) => state.nodes.find((node) => node.id === source));
  const accentColor = sourceNode?.data?.color || 'var(--project-accent, #00E5FF)';
  const safeEdgeId = id.replace(/[^a-zA-Z0-9_-]/g, '-');
  const gradientId = `relation-gradient-${safeEdgeId}`;
  const glowId = `relation-glow-${safeEdgeId}`;

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition,
  });

  return (
    <g 
      onMouseEnter={() => setIsHovered(true)} 
      onMouseLeave={() => setIsHovered(false)}
      className="cursor-pointer"
    >
      <defs>
        <linearGradient id={gradientId} x1={sourceX} y1={sourceY} x2={targetX} y2={targetY} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={accentColor} />
          <stop offset="100%" stopColor="var(--project-accent, #00E5FF)" />
        </linearGradient>
        <filter id={glowId} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation={isHovered ? 4 : 2.5} result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Invisible thick path to make mouse hovering easy */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
      />

      {/* Soft shadow gives the connection contrast against the grid */}
      <path
        d={edgePath}
        fill="none"
        stroke="#050505"
        strokeOpacity={0.9}
        strokeWidth={isHovered ? 7 : 5}
        strokeLinecap="round"
      />

      {/* The visible connection line */}
      <path
        d={edgePath}
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeOpacity={isHovered ? 1 : 0.78}
        strokeWidth={isHovered ? 3.5 : 2.5}
        strokeLinecap="round"
        filter={`url(#${glowId})`}
        className="transition-all duration-300"
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

import React, { useRef, useState, useEffect } from 'react';
import type { Player, Position, HighlightedTriangle, Activity, CompletionStatus, CalculationData } from '../types';
import { GOAL_POST_LEFT, GOAL_POST_RIGHT, VIEWBOX } from '../constants';

interface SoccerFieldProps {
  activity: Activity;
  players: Player[];
  highlightedTriangle: HighlightedTriangle;
  onPlayerPositionChange: (id: number, position: Position) => void;
  completionStatus: CompletionStatus;
  calculationData: CalculationData;
}

const PlayerCircle: React.FC<{ player: Player; isDraggable: boolean; onMouseDown: (e: React.MouseEvent) => void }> = ({ player, isDraggable, onMouseDown }) => {
  const colorClass = player.color.replace('bg-', 'fill-');
  return (
    <g onMouseDown={onMouseDown} style={{ cursor: isDraggable ? 'grab' : 'default' }}>
      <circle
        cx={player.position.x}
        cy={player.position.y}
        r={1.2}
        className={`${colorClass} stroke-white stroke-[0.2]`}
      />
      <text
        x={player.position.x}
        y={player.position.y + 0.1}
        textAnchor="middle"
        dominantBaseline="middle"
        className="fill-gray-900 font-bold text-[0.8px] select-none pointer-events-none"
      >
        {player.id}
      </text>
    </g>
  );
};

export const SoccerField: React.FC<SoccerFieldProps> = ({ activity, players, highlightedTriangle, onPlayerPositionChange, completionStatus, calculationData }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [draggingPlayer, setDraggingPlayer] = useState<number | null>(null);
  const footLabels = ['P', 'Q', 'R'];

  const getSVGCoordinates = (e: MouseEvent): Position => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const pt = svgRef.current.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgP = pt.matrixTransform(svgRef.current.getScreenCTM()?.inverse());
    return { x: Math.round(svgP.x * 10) / 10, y: Math.round(svgP.y * 10) / 10 };
  };

  const handleMouseDown = (e: React.MouseEvent, playerId: number) => {
    if (activity === 'activity2' && (playerId === 1 || playerId === 3)) {
      setDraggingPlayer(playerId);
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (draggingPlayer === null) return;
    const newPosition = getSVGCoordinates(e);
    onPlayerPositionChange(draggingPlayer, newPosition);
  };

  const handleMouseUp = () => {
    setDraggingPlayer(null);
  };
  
  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingPlayer]); // eslint-disable-line react-hooks/exhaustive-deps


  return (
    <div className="w-full bg-gray-800 rounded-xl shadow-2xl p-4 border border-gray-700">
       <svg
        ref={svgRef}
        viewBox={`${VIEWBOX.minX} ${VIEWBOX.minY} ${VIEWBOX.width} ${VIEWBOX.height}`}
        className="w-full h-auto"
        style={draggingPlayer ? {cursor: 'grabbing'} : {}}
      >
        {/* Field Background */}
        <rect
          x={VIEWBOX.minX}
          y={VIEWBOX.minY}
          width={VIEWBOX.width}
          height={VIEWBOX.height}
          className="fill-emerald-800"
        />

        {/* Penalty Area */}
        <rect x="-18" y="0" width="36" height="18" className="fill-none stroke-emerald-600 stroke-[0.2]" />
        <rect x="-9" y="0" width="18" height="6" className="fill-none stroke-emerald-600 stroke-[0.2]" />

        {/* Goal */}
        <line
          x1={GOAL_POST_LEFT.x}
          y1="0"
          x2={GOAL_POST_RIGHT.x}
          y2="0"
          className="stroke-white stroke-[0.5]"
        />
        <circle {...GOAL_POST_LEFT} r="0.3" className="fill-white" />
        <circle {...GOAL_POST_RIGHT} r="0.3" className="fill-white" />
        <text x="0" y="-1.5" textAnchor="middle" className="fill-gray-400 text-[1px] font-mono">골대 (6m)</text>
        <text x="0" y="0.9" textAnchor="middle" dominantBaseline="hanging" className="fill-gray-400 text-[0.8px] font-mono">(0, 0)</text>
        
        {/* Player to Goal Lines */}
        <g>
          {players.map(player => (
            <React.Fragment key={`lines-${player.id}`}>
              <line
                x1={player.position.x}
                y1={player.position.y}
                x2={GOAL_POST_LEFT.x}
                y2={GOAL_POST_LEFT.y}
                className="stroke-gray-400 stroke-[0.1] opacity-70"
              />
              <line
                x1={player.position.x}
                y1={player.position.y}
                x2={GOAL_POST_RIGHT.x}
                y2={GOAL_POST_RIGHT.y}
                className="stroke-gray-400 stroke-[0.1] opacity-70"
              />
            </React.Fragment>
          ))}
        </g>
        
        {/* Perpendicular lines and labels */}
        <g>
          {players.map((player, index) => (
            <React.Fragment key={`perp-group-${player.id}`}>
              <line
                x1={player.position.x}
                y1={player.position.y}
                x2={player.position.x}
                y2={0}
                className="stroke-cyan-400 stroke-[0.15] opacity-80"
                strokeDasharray="0.5 0.5"
              />
              <circle cx={player.position.x} cy="0" r="0.25" className="fill-cyan-400" />
              <text
                x={player.position.x}
                y={-0.5}
                textAnchor="middle"
                dominantBaseline="auto"
                className="fill-cyan-300 text-[0.8px] font-mono"
              >
                {footLabels[index]}
              </text>
            </React.Fragment>
          ))}
        </g>
        
        {/* Highlighted Triangle and Angle Arc */}
        {highlightedTriangle && (
          <g>
            {(() => {
              const player = players.find(p => p.id === highlightedTriangle.playerId);
              if (!player || player.position.y === 0) return null;

              const post = highlightedTriangle.side === 'left' ? GOAL_POST_LEFT : GOAL_POST_RIGHT;
              const foot = { x: player.position.x, y: 0 };
              
              const pA = player.position; // Angle vertex
              const pB = foot;
              const pC = post;

              const points = `${pA.x},${pA.y} ${pB.x},${pB.y} ${pC.x},${pC.y}`;
              
              const v1 = { x: pB.x - pA.x, y: pB.y - pA.y };
              const v2 = { x: pC.x - pA.x, y: pC.y - pA.y };

              const angle1 = Math.atan2(v1.y, v1.x);
              const angle2 = Math.atan2(v2.y, v2.x);
              
              const angleDiff = angle2 - angle1;
              const sweepFlag = angleDiff > 0 ? 1 : 0;
              
              const arcRadius = 1.5;
              const startPoint = { x: pA.x + arcRadius * Math.cos(angle1), y: pA.y + arcRadius * Math.sin(angle1) };
              const endPoint = { x: pA.x + arcRadius * Math.cos(angle2), y: pA.y + arcRadius * Math.sin(angle2) };

              const arcPath = `M ${startPoint.x} ${startPoint.y} A ${arcRadius} ${arcRadius} 0 0 ${sweepFlag} ${endPoint.x} ${endPoint.y}`;

              const midAngle = angle1 + angleDiff / 2;
              const thetaRadius = arcRadius * 0.6;
              const thetaPos = {
                x: pA.x + thetaRadius * Math.cos(midAngle),
                y: pA.y + thetaRadius * Math.sin(midAngle)
              };
              
              const height = Math.abs(player.position.y);
              const base = Math.abs(player.position.x - post.x);

              const heightTextPos = {
                x: player.position.x + (player.position.x > 0 ? -0.5 : 0.5),
                y: player.position.y / 2,
              };

              const baseTextPos = {
                x: (player.position.x + post.x) / 2,
                y: -0.8,
              };

              return (
                <g>
                  <polygon
                    points={points}
                    className="fill-orange-400/30 stroke-orange-300 stroke-[0.2]"
                  />
                  <path d={arcPath} className="fill-none stroke-red-500 stroke-[0.2]" />
                  <text
                    x={thetaPos.x}
                    y={thetaPos.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-red-500 font-bold text-[1px] select-none pointer-events-none"
                    style={{ filter: "drop-shadow(0 0 0.5px black)" }}
                  >
                    θ
                  </text>
                   {/* Side length labels */}
                  <text
                    x={heightTextPos.x}
                    y={heightTextPos.y}
                    textAnchor={player.position.x > 0 ? 'end' : 'start'}
                    dominantBaseline="middle"
                    className="fill-yellow-300 font-bold text-[1px]"
                    style={{ filter: "drop-shadow(0 0 0.5px black)" }}
                  >
                    {height.toFixed(1)}m
                  </text>
                  <text
                    x={baseTextPos.x}
                    y={baseTextPos.y}
                    textAnchor="middle"
                    dominantBaseline="auto"
                    className="fill-yellow-300 font-bold text-[1px]"
                    style={{ filter: "drop-shadow(0 0 0.5px black)" }}
                  >
                    {base.toFixed(1)}m
                  </text>
                </g>
              );
            })()}
          </g>
        )}
        
        {/* Viewing angle text */}
        <g>
          {players.map(player => {
              if ((player.id !== 1 && player.id !== 3) || !completionStatus[player.id]?.left || !completionStatus[player.id]?.right) {
                  return null;
              }
              const data = calculationData[player.id];
              if (!data) return null;

              return (
                  <text
                      key={`angle-label-${player.id}`}
                      x={player.position.x}
                      y={player.position.y - 1.8}
                      textAnchor="middle"
                      className="fill-yellow-300 font-bold text-[1.2px]"
                      style={{ filter: "drop-shadow(0 0 0.5px black)" }}
                  >
                      시야각: {data.finalAngle.toFixed(1)}°
                  </text>
              );
          })}
        </g>

        {/* Players */}
        {players.map(player => (
            <PlayerCircle 
                key={player.id} 
                player={player} 
                isDraggable={activity === 'activity2' && (player.id === 1 || player.id === 3)}
                onMouseDown={(e) => handleMouseDown(e, player.id)}
            />
        ))}
      </svg>
    </div>
  );
};


import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { SoccerField } from './components/SoccerField';
import { Controls } from './components/Controls';
import { TrigTableModal } from './components/TrigTableModal';
import type { Player, HighlightedTriangle, Position, Activity, CalculationData, CompletionStatus } from './types';
import { INITIAL_PLAYERS, GOAL_POST_LEFT, GOAL_POST_RIGHT } from './constants';

const calculatePlayerData = (player: Player, activity: Activity): CalculationData[number] => {
    const { x: px, y: py } = player.position;
    if (py === 0) return null;

    const height = Math.abs(py);
    
    const leftNumerator = Math.abs(px - GOAL_POST_LEFT.x);
    const leftTangent = leftNumerator / height;
    const leftAngleRad = Math.atan(leftTangent);
    const leftAngleDeg = leftAngleRad * 180 / Math.PI;

    const rightNumerator = Math.abs(px - GOAL_POST_RIGHT.x);
    const rightTangent = rightNumerator / height;
    const rightAngleRad = Math.atan(rightTangent);
    const rightAngleDeg = rightAngleRad * 180 / Math.PI;

    const playerIsBetweenPosts = Math.abs(px) < GOAL_POST_RIGHT.x;
    
    let finalAngle;
    let isSum = false;

    if (activity === 'activity2') {
        isSum = playerIsBetweenPosts;
        finalAngle = isSum ? leftAngleDeg + rightAngleDeg : Math.abs(leftAngleDeg - rightAngleDeg);
    } else {
        // For Activity 1, always subtract.
        finalAngle = Math.abs(leftAngleDeg - rightAngleDeg);
    }
    
    return {
        left: { numerator: leftNumerator, denominator: height, tangent: leftTangent, angleDeg: leftAngleDeg },
        right: { numerator: rightNumerator, denominator: height, tangent: rightTangent, angleDeg: rightAngleDeg },
        finalAngle,
        isSum,
    };
};


function App() {
  const [activity, setActivity] = useState<Activity>('activity1');
  const [players, setPlayers] = useState<Player[]>(INITIAL_PLAYERS);
  const [highlightedTriangle, setHighlightedTriangle] = useState<HighlightedTriangle>(null);
  const [isTrigTableOpen, setIsTrigTableOpen] = useState(false);
  const [completionStatus, setCompletionStatus] = useState<CompletionStatus>({
    1: { left: false, right: false },
    3: { left: false, right: false },
  });
  
  const handlePlayerPositionChange = useCallback((id: number, newPosition: Position) => {
    if (activity === 'activity2') {
      setPlayers(prevPlayers => 
        prevPlayers.map(p => p.id === id ? { ...p, position: newPosition } : p)
      );
    }
  }, [activity]);

  const calculationData = useMemo<CalculationData>(() => {
    return players.reduce((acc, player) => {
        if (player.id !== 2) {
            acc[player.id] = calculatePlayerData(player, activity);
        }
        return acc;
    }, {} as CalculationData);
  }, [players, activity]);
  
  const handleCompletionChange = useCallback((playerId: number, side: 'left' | 'right', isCorrect: boolean) => {
    setCompletionStatus(prev => {
        const current = prev[playerId] || { left: false, right: false };
        const newStatus = { ...current, [side]: isCorrect };
        
        // If in activity2, completion should always be true
        const finalStatus = activity === 'activity2' ? { left: true, right: true } : newStatus;

        return {
            ...prev,
            [playerId]: finalStatus
        };
    });
  }, [activity]);
  
  useEffect(() => {
      if (activity === 'activity2') {
          setCompletionStatus({ 1: { left: true, right: true }, 3: { left: true, right: true } });
      }
  }, [players, activity]);

  const openTrigTable = () => setIsTrigTableOpen(true);
  const closeTrigTable = () => setIsTrigTableOpen(false);
  
  const handleHighlightTriangle = useCallback((playerId: number, side: 'left' | 'right') => {
    setHighlightedTriangle(prev => 
      prev && prev.playerId === playerId && prev.side === side ? null : { playerId, side }
    );
  }, []);
  
  const handleActivityChange = (newActivity: Activity) => {
      setActivity(newActivity);
      setPlayers(INITIAL_PLAYERS);
      if (newActivity === 'activity1') {
          setCompletionStatus({ 1: { left: false, right: false }, 3: { left: false, right: false } });
      } else {
          setCompletionStatus({ 1: { left: true, right: true }, 3: { left: true, right: true } });
      }
      setHighlightedTriangle(null);
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center p-4 sm:p-6 lg:p-8 font-sans">
      <header className="w-full max-w-7xl text-center mb-4">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-emerald-400 tracking-tight">
          축구 포지션 시뮬레이터
        </h1>
        <p className="mt-2 text-lg text-gray-400">탄젠트를 이용한 선수별 골대 시야각 계산</p>
      </header>
      
      <div className="w-full max-w-7xl mb-6 flex justify-center space-x-4">
        <button 
          onClick={() => handleActivityChange('activity1')}
          className={`px-6 py-2 rounded-lg font-semibold transition-colors ${activity === 'activity1' ? 'bg-emerald-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
        >
          활동 1: 계산 연습
        </button>
        <button 
          onClick={() => handleActivityChange('activity2')}
          className={`px-6 py-2 rounded-lg font-semibold transition-colors ${activity === 'activity2' ? 'bg-emerald-500 text-white' : 'bg-gray-600 text-gray-300 hover:bg-gray-600'}`}
        >
          활동 2: 동적 탐구
        </button>
      </div>
      
      <main className="w-full max-w-7xl flex flex-col lg:flex-row gap-8">
        <div className="flex-grow lg:w-2/3">
          <SoccerField 
            activity={activity}
            players={players} 
            highlightedTriangle={highlightedTriangle}
            onPlayerPositionChange={handlePlayerPositionChange}
            completionStatus={completionStatus}
            calculationData={calculationData}
          />
        </div>
        <aside className="lg:w-1/3">
          <Controls 
            activity={activity}
            players={players} 
            highlightedTriangle={highlightedTriangle}
            onHighlightTriangle={handleHighlightTriangle}
            onOpenTrigTable={openTrigTable}
            calculationData={calculationData}
            completionStatus={completionStatus}
            onCompletionChange={handleCompletionChange}
          />
        </aside>
      </main>
      <TrigTableModal isOpen={isTrigTableOpen} onClose={closeTrigTable} />
    </div>
  );
}

export default App;
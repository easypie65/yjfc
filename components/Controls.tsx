
import React, { useState, useEffect } from 'react';
import type { Player, HighlightedTriangle, Activity, CalculationData, CompletionStatus, PlayerCompletionStatus, CalculationStep } from '../types';

interface ControlsProps {
  activity: Activity;
  players: Player[];
  highlightedTriangle: HighlightedTriangle;
  onHighlightTriangle: (playerId: number, side: 'left' | 'right') => void;
  onOpenTrigTable: () => void;
  calculationData: CalculationData;
  completionStatus: CompletionStatus;
  onCompletionChange: (playerId: number, side: 'left' | 'right', isCorrect: boolean) => void;
}

const EyeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const ChevronDownIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
);

const InteractiveCalculationStep: React.FC<{
    id: string; title: string; description: string; isHighlighted: boolean;
    onHighlight: () => void; calculationData: CalculationStep;
    onOpenTrigTable: () => void; onCompletionChange: (isCorrect: boolean) => void;
}> = ({ id, title, description, isHighlighted, onHighlight, calculationData, onOpenTrigTable, onCompletionChange }) => {
    const [inputs, setInputs] = useState({ tanNum: '', tanDen: '' });
    const [tanStatus, setTanStatus] = useState<'unvalidated' | 'correct' | 'incorrect'>('unvalidated');

    useEffect(() => {
        // Reset local state when calculationData changes (e.g., player moves in activity 2)
        setInputs({ tanNum: '', tanDen: '' });
        setTanStatus('unvalidated');
    }, [calculationData]);

    const handleTanFractionChange = (part: 'tanNum' | 'tanDen', value: string) => {
        const newInputs = { ...inputs, [part]: value };
        setInputs(newInputs);
    
        if (newInputs.tanNum.trim() === '' || newInputs.tanDen.trim() === '') {
            setTanStatus('unvalidated');
            onCompletionChange(false);
            return;
        }

        const num = parseFloat(newInputs.tanNum);
        const den = parseFloat(newInputs.tanDen);
    
        if (isNaN(num) || isNaN(den) || den === 0) {
            setTanStatus('unvalidated');
            onCompletionChange(false);
            return;
        }
    
        const isCorrect = Math.abs(num - calculationData.numerator) < 0.01 && Math.abs(den - calculationData.denominator) < 0.01;
        const newStatus = isCorrect ? 'correct' : 'incorrect';
        setTanStatus(newStatus);
        onCompletionChange(isCorrect);
    };

    const getTanInputBorderClass = () => {
        switch (tanStatus) {
            case 'correct': return 'border-green-500 focus:ring-green-500 text-green-300';
            case 'incorrect': return 'border-red-500 focus:ring-red-500 text-red-300';
            default: return 'border-gray-600 focus:ring-indigo-500';
        }
    };
    
    const commonInputClass = "w-full bg-gray-900 border rounded-md shadow-sm py-1.5 px-2 text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors text-center";

    return (
        <div className={`p-3 bg-gray-900/50 rounded-md border ${isHighlighted ? 'border-orange-400' : 'border-gray-700/60'} transition-colors`}>
            <div className="flex justify-between items-center cursor-pointer" onClick={onHighlight}>
                <p className="font-semibold text-gray-300">{title}</p>
                <EyeIcon className={`w-5 h-5 ${isHighlighted ? 'text-orange-400' : 'text-gray-500'}`} />
            </div>
            <p className="text-xs text-gray-400 mt-1">{description}</p>
            <div className="mt-3 space-y-3 text-sm font-mono">
                <div className="flex items-center gap-2">
                    <label htmlFor={`${id}-tan-num`} className="w-28 text-cyan-400 shrink-0">tan(θ) =</label>
                    <div className="flex items-center gap-1 w-full">
                        <input id={`${id}-tan-num`} type="number" step="0.1" value={inputs.tanNum} onChange={e => handleTanFractionChange('tanNum', e.target.value)} className={`${commonInputClass} ${getTanInputBorderClass()}`} placeholder="분자" />
                        <span className="text-gray-400 font-bold px-1">/</span>
                        <input id={`${id}-tan-den`} type="number" step="0.1" value={inputs.tanDen} onChange={e => handleTanFractionChange('tanDen', e.target.value)} className={`${commonInputClass} ${getTanInputBorderClass()}`} placeholder="분모" />
                    </div>
                </div>
                 <button
                    onClick={onOpenTrigTable}
                    disabled={tanStatus !== 'correct'}
                    className="w-full mt-2 px-3 py-2 bg-indigo-600 text-white rounded-md transition-colors text-sm font-semibold disabled:bg-gray-600 disabled:cursor-not-allowed enabled:hover:bg-indigo-500"
                 >
                    삼각비 표 보기
                </button>
                {tanStatus === 'correct' && (
                    <p className="text-right font-semibold text-lg text-cyan-300 mt-1">각도 ≈ {calculationData.angleDeg.toFixed(1)}°</p>
                )}
            </div>
        </div>
    );
};

const DisplayCalculationStep: React.FC<{
    title: string; description: string; isHighlighted: boolean;
    onHighlight: () => void; calculationData: CalculationStep;
}> = ({ title, description, isHighlighted, onHighlight, calculationData }) => {
    return (
        <div className={`p-3 bg-gray-900/50 rounded-md border ${isHighlighted ? 'border-orange-400' : 'border-gray-700/60'} transition-colors`}>
            <div className="flex justify-between items-center cursor-pointer" onClick={onHighlight}>
                <p className="font-semibold text-gray-300">{title}</p>
                <EyeIcon className={`w-5 h-5 ${isHighlighted ? 'text-orange-400' : 'text-gray-500'}`} />
            </div>
            <p className="text-xs text-gray-400 mt-1">{description}</p>
            <div className="mt-3 space-y-2 text-sm font-mono">
                <p><span className="w-28 inline-block text-gray-400">tan(θ) =</span> {calculationData.numerator.toFixed(2)} / {calculationData.denominator.toFixed(2)}</p>
                <p className="text-right font-semibold text-lg text-cyan-300 mt-1">각도 ≈ {calculationData.angleDeg.toFixed(1)}°</p>
            </div>
        </div>
    );
};

interface PlayerControlProps {
    activity: Activity; player: Player; isOpen: boolean; onToggle: () => void;
    highlightedTriangle: HighlightedTriangle;
    onHighlightTriangle: (playerId: number, side: 'left' | 'right') => void;
    onOpenTrigTable: () => void;
    calculationData: CalculationData[number];
    completionStatus: PlayerCompletionStatus;
    onCompletionChange: (playerId: number, side: 'left' | 'right', isCorrect: boolean) => void;
}

const PlayerControl: React.FC<PlayerControlProps> = ({ activity, player, isOpen, onToggle, highlightedTriangle, onHighlightTriangle, onOpenTrigTable, calculationData, completionStatus, onCompletionChange }) => {
    const footLabels = ['P', 'Q', 'R'];

    if (player.id === 2) {
        return (
            <div className="p-4 bg-gray-800 rounded-lg border border-gray-700 space-y-2">
                <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full ${player.color} border-2 border-gray-600`}></div>
                    <h3 className="font-bold text-lg text-gray-200">{player.name}</h3>
                    <span className="text-sm font-mono text-gray-400">({player.position.x.toFixed(1)}, {player.position.y.toFixed(1)})</span>
                </div>
            </div>
        );
    }

    if (!calculationData) {
        return <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">선수가 골 라인 위에 있어 시야각을 계산할 수 없습니다.</div>
    }
    
    const isLeftHighlighted = highlightedTriangle?.playerId === player.id && highlightedTriangle.side === 'left';
    const isRightHighlighted = highlightedTriangle?.playerId === player.id && highlightedTriangle.side === 'right';
    
    const renderFinalAngle = () => {
        if (!completionStatus?.left || !completionStatus?.right) {
            return <p className="text-sm text-gray-500 mt-2">좌/우 각도를 먼저 계산해주세요.</p>;
        }

        if (activity === 'activity2') {
            const formulaSymbol = calculationData.isSum ? 'θ_L + θ_R' : '| θ_L - θ_R |';
            const formula = calculationData.isSum 
                ? `${calculationData.left.angleDeg.toFixed(1)}° + ${calculationData.right.angleDeg.toFixed(1)}°`
                : `|${calculationData.left.angleDeg.toFixed(1)}° - ${calculationData.right.angleDeg.toFixed(1)}°|`;
            const explanation = calculationData.isSum ? '선수가 골대 사이에 위치: 덧셈 적용' : '선수가 골대 바깥에 위치: 뺄셈 적용';

            return (
                <>
                    <p className="text-xs text-gray-400">{explanation}</p>
                    <div className="font-mono text-sm mt-1">
                        <span>시야각 = {formulaSymbol} = </span>
                        <span>{formula}</span>
                    </div>
                    <p className="text-amber-300 font-mono text-2xl font-bold mt-1">≈ {calculationData.finalAngle.toFixed(1)}°</p>
                </>
            );
        }

        // Activity 1
        return (
            <>
               <div className="font-mono text-sm mt-2">
                   <span>시야각 = | θ_L - θ_R | = </span>
                   <span>|{calculationData.left.angleDeg.toFixed(1)}° - {calculationData.right.angleDeg.toFixed(1)}°|</span>
               </div>
               <p className="text-amber-300 font-mono text-2xl font-bold mt-1">≈ {calculationData.finalAngle.toFixed(1)}°</p>
            </>
        );
    }

    return (
        <div className="p-4 bg-gray-800 rounded-lg border border-gray-700 space-y-2">
            <div className="flex items-center justify-between cursor-pointer" onClick={onToggle}>
                <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full ${player.color} border-2 border-gray-600`}></div>
                    <h3 className="font-bold text-lg text-gray-200">{player.name}</h3>
                    <span className="text-sm font-mono text-gray-400">({player.position.x.toFixed(1)}, {player.position.y.toFixed(1)})</span>
                </div>
                <ChevronDownIcon className={`w-6 h-6 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </div>
            
            {isOpen && (
                <div className="space-y-3 pt-2">
                     {activity === 'activity1' ? (
                        <InteractiveCalculationStep 
                            id={`p${player.id}-left`}
                            title="왼쪽 골대 각 (θ_L)"
                            description={`${footLabels[player.id-1]}, 선수 ${player.id}, 왼쪽 골포스트`}
                            isHighlighted={isLeftHighlighted}
                            onHighlight={() => onHighlightTriangle(player.id, 'left')}
                            calculationData={calculationData.left}
                            onOpenTrigTable={onOpenTrigTable}
                            onCompletionChange={(isCorrect) => onCompletionChange(player.id, 'left', isCorrect)}
                        />
                     ) : (
                        <DisplayCalculationStep
                            title="왼쪽 골대 각 (θ_L)"
                            description={`${footLabels[player.id-1]}, 선수 ${player.id}, 왼쪽 골포스트`}
                            isHighlighted={isLeftHighlighted}
                            onHighlight={() => onHighlightTriangle(player.id, 'left')}
                            calculationData={calculationData.left}
                        />
                     )}
                     {activity === 'activity1' ? (
                        <InteractiveCalculationStep 
                            id={`p${player.id}-right`}
                            title="오른쪽 골대 각 (θ_R)"
                            description={`${footLabels[player.id-1]}, 선수 ${player.id}, 오른쪽 골포스트`}
                            isHighlighted={isRightHighlighted}
                            onHighlight={() => onHighlightTriangle(player.id, 'right')}
                            calculationData={calculationData.right}
                            onOpenTrigTable={onOpenTrigTable}
                            onCompletionChange={(isCorrect) => onCompletionChange(player.id, 'right', isCorrect)}
                        />
                     ) : (
                        <DisplayCalculationStep
                            title="오른쪽 골대 각 (θ_R)"
                            description={`${footLabels[player.id-1]}, 선수 ${player.id}, 오른쪽 골포스트`}
                            isHighlighted={isRightHighlighted}
                            onHighlight={() => onHighlightTriangle(player.id, 'right')}
                            calculationData={calculationData.right}
                        />
                     )}
                    <div className="p-3 bg-gray-900/50 rounded-md border border-gray-700/60">
                        <p className="font-semibold text-amber-400">최종 시야각 계산</p>
                        {renderFinalAngle()}
                    </div>
                </div>
            )}
        </div>
    );
};

export const Controls: React.FC<ControlsProps> = (props) => {
  const [openPlayerId, setOpenPlayerId] = useState<number | null>(1);
  
  const handleToggle = (playerId: number) => {
    setOpenPlayerId(prevId => prevId === playerId ? null : playerId);
  };
  
  useEffect(() => {
    // Keep the first player open by default in activity 2
    if (props.activity === 'activity2' && openPlayerId === null) {
        setOpenPlayerId(1);
    }
  }, [props.activity, openPlayerId]);

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl shadow-lg p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-100">계산 과정</h2>
      </div>
      <div className="space-y-4">
        {props.players.map(player => (
            <PlayerControl 
              key={player.id} 
              {...props}
              player={player} 
              isOpen={openPlayerId === player.id}
              onToggle={() => handleToggle(player.id)}
              calculationData={props.calculationData[player.id]}
              completionStatus={props.completionStatus[player.id] || {left: false, right: false}}
            />
        ))}
      </div>
    </div>
  );
};
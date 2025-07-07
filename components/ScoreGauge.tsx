import React from 'react';

interface ScoreGaugeProps {
  score: number;
  label: string;
}

const ScoreGauge: React.FC<ScoreGaugeProps> = ({ score, label }) => {
  const getScoreColors = (value: number) => {
    if (value < 40) return 'from-red-400 to-red-500';
    if (value < 70) return 'from-yellow-400 to-yellow-500';
    return 'from-green-400 to-green-500';
  };

  const colorClass = getScoreColors(score);
  const percentage = Math.max(0, Math.min(100, score));

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-semibold text-slate-700">{label}</span>
        <span className="text-lg font-bold text-slate-800">{score.toFixed(0)}/100</span>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-3.5 overflow-hidden">
        <div 
          className={`h-3.5 rounded-full transition-all duration-1000 ease-out bg-gradient-to-r ${colorClass}`} 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ScoreGauge;
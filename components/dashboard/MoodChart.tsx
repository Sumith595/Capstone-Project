import React, { useState } from 'react';
import { JournalEntry } from '../../types';

interface MoodChartProps {
  entries: JournalEntry[];
}

const MoodChart: React.FC<MoodChartProps> = ({ entries }) => {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; date: Date; score: number } | null>(null);

  if (entries.length < 2) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-700/50 rounded-lg">
        <p className="text-slate-400">Need at least two entries to display mood trend.</p>
      </div>
    );
  }

  // Entries are newest first, reverse for chronological order
  const chartData = entries.map(e => ({
    date: new Date(e.date),
    score: e.analysis.moodScore
  })).reverse();

  const width = 500;
  const height = 200;
  const margin = { top: 20, right: 20, bottom: 30, left: 30 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const maxScore = 10;
  const minScore = 1;

  const xScale = (index: number) => (index / (chartData.length - 1)) * innerWidth;
  const yScale = (score: number) => innerHeight - ((score - minScore) / (maxScore - minScore)) * innerHeight;

  const handleMouseOver = (data: { date: Date; score: number; }, index: number) => {
    setTooltip({
      x: xScale(index),
      y: yScale(data.score),
      date: data.date,
      score: data.score,
    });
  };

  const handleMouseLeave = () => {
    setTooltip(null);
  };

  const linePath = chartData
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(d.score)}`)
    .join(' ');

  const getMonthLabel = (date: Date) => date.toLocaleString('default', { month: 'short' });

  return (
    <div className="bg-slate-700/50 p-4 rounded-lg h-full w-full flex flex-col">
        <h3 className="text-sm font-semibold text-slate-200 mb-2">Mood Trend</h3>
        <div className="flex-grow">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
                <g transform={`translate(${margin.left}, ${margin.top})`}>
                {/* Y-axis */}
                <line x1={0} y1={0} x2={0} y2={innerHeight} stroke="#475569" strokeWidth="1" />
                {[1, 5, 10].map(tick => (
                    <g key={tick} transform={`translate(0, ${yScale(tick)})`}>
                    <line x1="-5" y1="0" x2="0" y2="0" stroke="#64748b" strokeWidth="1" />
                    <text x="-10" y="4" textAnchor="end" fontSize="10" fill="#94a3b8">
                        {tick}
                    </text>
                    </g>
                ))}
                
                {/* X-axis */}
                <line x1={0} y1={innerHeight} x2={innerWidth} y2={innerHeight} stroke="#475569" strokeWidth="1" />
                {chartData.map((d, i) => {
                    // Show labels for first, last, and maybe a middle point to avoid clutter
                    if (i === 0 || i === chartData.length - 1 || (chartData.length > 5 && i === Math.floor(chartData.length/2))) {
                        return (
                            <g key={i} transform={`translate(${xScale(i)}, ${innerHeight})`}>
                            <line y1="0" y2="5" stroke="#64748b" strokeWidth="1" />
                            <text y="15" textAnchor="middle" fontSize="10" fill="#94a3b8">
                                {getMonthLabel(d.date)} {d.date.getDate()}
                            </text>
                            </g>
                        );
                    }
                    return null;
                })}

                {/* Grid lines */}
                {[1, 5, 10].map(tick => (
                    <line 
                        key={`grid-${tick}`}
                        x1={0} y1={yScale(tick)} x2={innerWidth} y2={yScale(tick)} 
                        stroke="#334155" strokeWidth="1" strokeDasharray="2 2" 
                    />
                ))}

                {/* Line path */}
                <path d={linePath} fill="none" stroke="#f59e0b" strokeWidth="2" />

                {/* Data points - Invisible hover targets for easier interaction */}
                 {chartData.map((d, i) => (
                    <circle 
                      key={`hover-${i}`}
                      cx={xScale(i)} 
                      cy={yScale(d.score)} 
                      r="10" 
                      fill="transparent"
                      className="cursor-pointer"
                      onMouseOver={() => handleMouseOver(d, i)}
                      onMouseLeave={handleMouseLeave}
                    />
                ))}
                
                {/* Data points - Visible circles */}
                {chartData.map((d, i) => (
                    <circle 
                      key={i} 
                      cx={xScale(i)} 
                      cy={yScale(d.score)} 
                      r={tooltip?.date === d.date ? 5 : 3} 
                      fill="#f59e0b"
                      className="transition-all duration-150"
                      style={{ pointerEvents: 'none' }}
                    />
                ))}

                {/* Tooltip */}
                {tooltip && (
                    <g transform={`translate(${tooltip.x}, ${tooltip.y})`} style={{ pointerEvents: 'none' }}>
                        {(() => {
                            const tooltipWidth = 125;
                            const xOffset = tooltip.x + margin.left + tooltipWidth > width - margin.right ? -tooltipWidth - 15 : 15;
                            const yOffset = tooltip.y + margin.top < 50 ? 20 : -45;

                            return (
                                <g transform={`translate(${xOffset}, ${yOffset})`}>
                                    <rect
                                        width={tooltipWidth}
                                        height={40}
                                        fill="rgba(15, 23, 42, 0.9)"
                                        stroke="#475569"
                                        rx="4"
                                    />
                                    <text x="10" y="16" fill="#e2e8f0" fontSize="11" fontWeight="bold">
                                        {`Score: ${tooltip.score} / 10`}
                                    </text>
                                    <text x="10" y="30" fill="#94a3b8" fontSize="10">
                                        {tooltip.date.toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </text>
                                </g>
                            );
                        })()}
                    </g>
                )}
                </g>
            </svg>
        </div>
    </div>
  );
};

export default MoodChart;
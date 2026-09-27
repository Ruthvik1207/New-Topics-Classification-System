import React from 'react';
import type { Category } from '../types';

interface ProbabilityChartProps {
  probabilities: Record<Category | string, number>;
  predictedCategory?: string;
}

const CATEGORY_COLORS: Record<string, { bar: string; glow: string; text: string }> = {
  Technology: { bar: 'from-cyan-500 to-blue-500', glow: 'rgba(6,182,212,0.4)', text: 'text-cyan-400' },
  Business: { bar: 'from-blue-600 to-indigo-500', glow: 'rgba(59,130,246,0.4)', text: 'text-blue-400' },
  Politics: { bar: 'from-purple-500 to-violet-600', glow: 'rgba(139,92,246,0.4)', text: 'text-purple-400' },
  World: { bar: 'from-emerald-500 to-teal-500', glow: 'rgba(16,185,129,0.4)', text: 'text-emerald-400' },
  Science: { bar: 'from-amber-500 to-orange-500', glow: 'rgba(245,158,11,0.4)', text: 'text-amber-400' },
  Health: { bar: 'from-rose-500 to-pink-500', glow: 'rgba(244,63,94,0.4)', text: 'text-rose-400' },
  Sports: { bar: 'from-lime-500 to-emerald-600', glow: 'rgba(132,204,22,0.4)', text: 'text-lime-400' },
  Entertainment: { bar: 'from-fuchsia-500 to-pink-600', glow: 'rgba(217,70,239,0.4)', text: 'text-fuchsia-400' },
};

export const ProbabilityChart: React.FC<ProbabilityChartProps> = ({
  probabilities,
  predictedCategory,
}) => {
  // Sort by probability descending
  const sortedCategories = Object.entries(probabilities).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-3.5">
      {sortedCategories.map(([category, prob]) => {
        const percentage = Math.round(prob * 100);
        const isPredicted = category === predictedCategory;
        const color = CATEGORY_COLORS[category] || {
          bar: 'from-slate-500 to-slate-400',
          glow: 'rgba(148,163,184,0.2)',
          text: 'text-slate-300',
        };

        return (
          <div key={category} className="group">
            <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
              <span className={`flex items-center gap-2 ${isPredicted ? 'text-white font-bold' : 'text-slate-400'}`}>
                {isPredicted && (
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                )}
                {category}
              </span>
              <span className={isPredicted ? color.text : 'text-slate-400'}>
                {percentage}%
              </span>
            </div>

            {/* Glass progress track */}
            <div className="h-2.5 w-full bg-slate-900/60 rounded-full overflow-hidden border border-white/5 relative p-[1px]">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${color.bar} transition-all duration-700 ease-out`}
                style={{
                  width: `${Math.max(percentage, 2)}%`,
                  boxShadow: isPredicted ? `0 0 10px ${color.glow}` : 'none',
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

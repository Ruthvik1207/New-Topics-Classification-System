import React from 'react';
import { GlassCard } from './GlassCard';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  glowColor?: 'blue' | 'purple' | 'cyan' | 'emerald';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  glowColor = 'blue',
}) => {
  return (
    <GlassCard hoverEffect glowColor={glowColor} className="flex flex-col justify-between">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider font-medium text-slate-400">{title}</p>
          <h3 className="text-2xl lg:text-3xl font-bold text-white mt-1.5 tracking-tight">{value}</h3>
        </div>
        <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-cyan-400">
          {icon}
        </div>
      </div>

      {(subtitle || trend) && (
        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
          {subtitle && <span className="text-slate-400">{subtitle}</span>}
          {trend && (
            <span
              className={`font-medium ${
                trend.isPositive ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {trend.value}
            </span>
          )}
        </div>
      )}
    </GlassCard>
  );
};

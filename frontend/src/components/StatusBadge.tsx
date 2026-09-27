import React from 'react';

interface StatusBadgeProps {
  status: string;
  variant?: 'healthy' | 'warning' | 'critical' | 'info' | 'neutral';
  pulse?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  variant,
  pulse = false,
}) => {
  // Infer variant if not explicitly given
  let calculatedVariant = variant;
  if (!calculatedVariant) {
    const s = status.toLowerCase();
    if (s.includes('healthy') || s.includes('active') || s.includes('ready') || s.includes('finished') || s.includes('completed')) {
      calculatedVariant = 'healthy';
    } else if (s.includes('warning') || s.includes('running') || s.includes('pending')) {
      calculatedVariant = 'warning';
    } else if (s.includes('critical') || s.includes('failed') || s.includes('error')) {
      calculatedVariant = 'critical';
    } else {
      calculatedVariant = 'neutral';
    }
  }

  const styles = {
    healthy: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    warning: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
    critical: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
    info: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300',
    neutral: 'bg-slate-800/50 border-slate-700 text-slate-300',
  };

  const dotColors = {
    healthy: 'bg-emerald-400',
    warning: 'bg-amber-400',
    critical: 'bg-rose-400',
    info: 'bg-cyan-400',
    neutral: 'bg-slate-400',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border backdrop-blur-md ${styles[calculatedVariant]}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${dotColors[calculatedVariant]} ${
          pulse ? 'animate-ping' : ''
        }`}
      />
      {status}
    </span>
  );
};

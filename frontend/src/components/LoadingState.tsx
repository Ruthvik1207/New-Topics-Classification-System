import React from 'react';
import { Loader2 } from 'lucide-react';
import { GlassCard } from './GlassCard';

interface LoadingStateProps {
  message?: string;
  subMessage?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading data...',
  subMessage,
}) => {
  return (
    <div className="w-full py-16 flex flex-col items-center justify-center">
      <div className="relative">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center backdrop-blur-xl animate-pulse">
          <Loader2 className="w-7 h-7 text-cyan-400 animate-spin" />
        </div>
        <div className="absolute inset-0 bg-cyan-400/20 blur-xl rounded-full -z-10 animate-ping" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-slate-200">{message}</h3>
      {subMessage && <p className="mt-1 text-xs text-slate-400">{subMessage}</p>}
    </div>
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <GlassCard className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="h-4 w-28 bg-white/10 rounded-md skeleton-shimmer" />
        <div className="h-8 w-8 rounded-lg bg-white/10 skeleton-shimmer" />
      </div>
      <div className="h-8 w-20 bg-white/15 rounded-md skeleton-shimmer" />
      <div className="h-3 w-36 bg-white/10 rounded-md skeleton-shimmer pt-2" />
    </GlassCard>
  );
};

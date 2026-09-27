import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
  glowColor?: 'blue' | 'purple' | 'cyan' | 'emerald';
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  hoverEffect = false,
  glowColor,
}) => {
  const glowClasses = {
    blue: 'hover:shadow-[0_0_25px_rgba(59,130,246,0.25)]',
    purple: 'hover:shadow-[0_0_25px_rgba(139,92,246,0.25)]',
    cyan: 'hover:shadow-[0_0_25px_rgba(6,182,212,0.25)]',
    emerald: 'hover:shadow-[0_0_25px_rgba(16,185,129,0.25)]',
  };

  return (
    <div
      className={`glass-card rounded-2xl p-6 relative overflow-hidden transition-all duration-300 ${
        hoverEffect ? 'glass-card-hover' : ''
      } ${glowColor ? glowClasses[glowColor] : ''} ${className}`}
    >
      {/* Top subtle highlight reflection */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
      {children}
    </div>
  );
};

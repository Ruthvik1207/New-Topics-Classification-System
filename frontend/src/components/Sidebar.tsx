import React from 'react';
import {
  LayoutDashboard,
  Sparkles,
  BarChart3,
  Cpu,
  Activity,
  Code2,
  Layers,
  ChevronRight,
  Radio
} from 'lucide-react';

export type NavTab = 'dashboard' | 'classify' | 'analytics' | 'mlops' | 'monitoring' | 'apidocs';

interface SidebarProps {
  currentTab: NavTab;
  setCurrentTab: (tab: NavTab) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  modelType: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  isOpen,
  setIsOpen,
  modelType,
}) => {
  const navItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'classify', label: 'Classify Article', icon: <Sparkles className="w-4 h-4 text-cyan-400" />, badge: 'Live' },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'mlops', label: 'MLOps Pipeline', icon: <Cpu className="w-4 h-4 text-purple-400" /> },
    { id: 'monitoring', label: 'Drift & Monitoring', icon: <Activity className="w-4 h-4 text-emerald-400" /> },
    { id: 'apidocs', label: 'API Reference', icon: <Code2 className="w-4 h-4 text-blue-400" /> },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 glass-panel border-r border-white/10 flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6">
          {/* Brand Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.4)]">
                <Layers className="w-5 h-5 text-white" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
              </span>
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                NewsLens <span className="text-cyan-400 font-light">AI</span>
              </h1>
              <p className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">
                Continuous Learning NLP
              </p>
            </div>
          </div>

          {/* Navigation links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentTab(item.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600/30 to-purple-600/20 text-white border border-blue-500/30 shadow-[0_4px_20px_rgba(59,130,246,0.15)]'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isActive ? 'text-cyan-300' : 'text-slate-400 group-hover:text-slate-200'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>

                  {item.badge ? (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      {item.badge}
                    </span>
                  ) : isActive ? (
                    <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />
                  ) : null}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Engine status footer */}
        <div className="p-4 m-4 rounded-xl bg-slate-900/60 border border-white/5 backdrop-blur-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">Inference Engine</span>
            <div className="flex items-center gap-1.5">
              <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
              <span className="text-[10px] text-emerald-400 font-semibold uppercase">Active</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-semibold">{modelType}</span>
            <span className="text-slate-400 font-mono text-[11px]">8 Classes</span>
          </div>
        </div>
      </aside>
    </>
  );
};

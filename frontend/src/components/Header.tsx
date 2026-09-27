import React from 'react';
import { Menu, ExternalLink, Database, Sparkles, Terminal } from 'lucide-react';
import type { NavTab } from './Sidebar';


interface HeaderProps {
  currentTab: NavTab;
  setIsOpen: (open: boolean) => void;
  modelVersion: string;
  modelType: string;
  apiHealthy: boolean;
  dvcVersion?: string;
}

const TAB_TITLES: Record<NavTab, { title: string; subtitle: string }> = {
  dashboard: { title: 'Intelligence Overview', subtitle: 'Real-time NLP operations, classification statistics & system telemetry' },
  classify: { title: 'News Article Classification', subtitle: 'Live transformer-based multi-class categorization & probability inference' },
  analytics: { title: 'Analytics & Performance', subtitle: 'Model evaluation matrices, confusion table, and category distribution' },
  mlops: { title: 'MLOps & Continuous Learning', subtitle: 'DVC data versioning, MLflow experiments, model registry, and retraining' },
  monitoring: { title: 'Evidently AI Monitoring', subtitle: 'Data drift detection, feature distribution drift, and prediction drift' },
  apidocs: { title: 'REST API Documentation', subtitle: 'FastAPI REST contract, curl examples, and Swagger OpenAPI schemas' },
};

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setIsOpen,
  modelVersion,
  modelType,
  apiHealthy,
  dvcVersion = 'v1.2.0',
}) => {
  const meta = TAB_TITLES[currentTab] || { title: 'New Topics Classification System', subtitle: 'Continuous Learning Platform' };


  return (
    <header className="glass-panel sticky top-0 z-30 px-6 py-4 border-b border-white/10 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsOpen(true)}
          className="lg:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            {meta.title}
          </h2>
          <p className="text-xs text-slate-400 hidden sm:block mt-0.5">{meta.subtitle}</p>
        </div>
      </div>

      {/* Badges and Swagger Link */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* API Health */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-white/10 text-xs">
          <span className={`w-2 h-2 rounded-full ${apiHealthy ? 'bg-emerald-400' : 'bg-rose-400 animate-pulse'}`} />
          <span className="text-slate-300 font-medium">API: {apiHealthy ? 'Online' : 'Offline'}</span>
        </div>

        {/* Model Version & Type */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-950/40 border border-blue-500/30 text-xs text-blue-300 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Model:</span>
            <strong className="text-white">{modelVersion}</strong>
          </div>

          <div className="px-2.5 py-1.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs font-semibold text-cyan-300 tracking-wide">
            {modelType}
          </div>
        </div>

        {/* DVC Tag */}
        <div className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-purple-950/30 border border-purple-500/30 text-xs text-purple-300">
          <Database className="w-3 h-3 text-purple-400" />
          <span>DVC: {dvcVersion}</span>
        </div>

        {/* Swagger docs external link */}
        <a
          href="/docs"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-300 hover:text-white transition-all cursor-pointer"
        >
          <Terminal className="w-3.5 h-3.5 text-cyan-400" />
          <span>Swagger</span>
          <ExternalLink className="w-3 h-3 text-slate-400" />
        </a>
      </div>
    </header>
  );
};

import { useState, useEffect } from 'react';
import { Sidebar, type NavTab } from './components/Sidebar';

import { Header } from './components/Header';
import { Dashboard } from './pages/Dashboard';
import { Classify } from './pages/Classify';
import { Analytics } from './pages/Analytics';
import { MLOps } from './pages/MLOps';
import { Monitoring } from './pages/Monitoring';
import { ApiDocs } from './pages/ApiDocs';
import { api } from './services/api';

export function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modelVersion, setModelVersion] = useState('v1.0');
  const [modelType, setModelType] = useState('DEMO MODEL');
  const [apiHealthy, setApiHealthy] = useState(true);

  // Initial health and model info query
  useEffect(() => {
    async function checkHealth() {
      try {
        const health = await api.getHealth();
        setApiHealthy(health.status === 'healthy');
        setModelVersion(health.model_version || 'v1.0');
        setModelType(health.model_type || 'DEMO MODEL');
      } catch (err) {
        setApiHealthy(false);
      }
    }
    checkHealth();
    const interval = setInterval(checkHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#070913] text-slate-100 relative overflow-x-hidden selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Background Animated Gradient Blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-15%] left-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-cyan-600/15 via-blue-600/10 to-transparent blur-[120px] animate-blob-1" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[700px] h-[700px] rounded-full bg-gradient-to-br from-purple-600/15 via-pink-600/10 to-transparent blur-[140px] animate-blob-2" />
        <div className="absolute top-[40%] right-[25%] w-[450px] h-[450px] rounded-full bg-gradient-to-r from-blue-700/10 via-indigo-600/10 to-transparent blur-[100px] animate-blob-3" />
      </div>

      {/* Glass Sidebar */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        modelType={modelType}
      />

      {/* Main Content Area */}
      <div className="lg:pl-72 flex flex-col min-h-screen">
        <Header
          currentTab={currentTab}
          setIsOpen={setSidebarOpen}
          modelVersion={modelVersion}
          modelType={modelType}
          apiHealthy={apiHealthy}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentTab === 'dashboard' && <Dashboard setCurrentTab={setCurrentTab} />}
          {currentTab === 'classify' && <Classify />}
          {currentTab === 'analytics' && <Analytics />}
          {currentTab === 'mlops' && <MLOps />}
          {currentTab === 'monitoring' && <Monitoring />}
          {currentTab === 'apidocs' && <ApiDocs />}
        </main>

        {/* Global Footer */}
        <footer className="glass-panel border-t border-white/5 py-4 px-6 text-center text-xs text-slate-500 mt-auto">
          <p>
            NewsLens AI — Continuous Learning News Topic Classification System • React + FastAPI + DistilBERT + DVC + MLflow + Evidently AI
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;

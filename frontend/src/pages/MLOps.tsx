import React, { useEffect, useState } from 'react';
import {
  Database,
  Play,
  RotateCw,
  CheckCircle2,
  AlertCircle,
  Terminal,
  Sparkles,
  GitBranch,
  ShieldCheck,
} from 'lucide-react';

import { GlassCard } from '../components/GlassCard';
import { GlassButton } from '../components/GlassButton';
import { StatusBadge } from '../components/StatusBadge';
import { LoadingState } from '../components/LoadingState';
import { api } from '../services/api';
import type {
  DatasetMetadata,
  MLflowRun,
  ModelRegistryItem,
  TrainingStatus,
  ModelMetadata,
} from '../types';

export const MLOps: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [datasetMeta, setDatasetMeta] = useState<DatasetMetadata | null>(null);
  const [experiments, setExperiments] = useState<MLflowRun[]>([]);
  const [models, setModels] = useState<ModelRegistryItem[]>([]);
  const [currentModel, setCurrentModel] = useState<ModelMetadata | null>(null);
  const [trainingStatus, setTrainingStatus] = useState<TrainingStatus | null>(null);
  const [targetVersion, setTargetVersion] = useState('v1.1');
  const [isStartingTraining, setIsStartingTraining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMLOpsData = async () => {
    try {
      const [ds, expData, regData, curMod, trStatus] = await Promise.all([
        api.getDatasetMetadata().catch(() => null),
        api.getExperiments().catch(() => ({ runs: [] })),
        api.getRegisteredModels().catch(() => ({ models: [] })),
        api.getModelMetadata().catch(() => null),
        api.getTrainingStatus().catch(() => null),
      ]);
      setDatasetMeta(ds);
      setExperiments(expData.runs || []);
      setModels(regData.models || []);
      setCurrentModel(curMod);
      setTrainingStatus(trStatus);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Failed to load MLOps data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMLOpsData();
  }, []);

  // Poll training status if running
  useEffect(() => {
    let interval: any = null;
    if (trainingStatus?.status === 'running') {
      interval = setInterval(async () => {
        try {
          const st = await api.getTrainingStatus();
          setTrainingStatus(st);
          if (st.status === 'completed' || st.status === 'failed') {
            loadMLOpsData();
          }
        } catch (e) {
          console.error(e);
        }
      }, 1500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [trainingStatus?.status]);

  const handleStartTraining = async () => {
    setIsStartingTraining(true);
    setError(null);
    try {
      await api.triggerTraining({
        model_version: targetVersion,
        epochs: 3,
        batch_size: 16,
      });
      const st = await api.getTrainingStatus();
      setTrainingStatus(st);
    } catch (err: any) {
      setError(err?.message || 'Failed to initiate training');
    } finally {
      setIsStartingTraining(false);
    }
  };

  if (loading) {
    return <LoadingState message="Connecting to MLflow Tracking & DVC Pipelines..." />;
  }

  const isTraining = trainingStatus?.status === 'running';

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Retraining & Continuous Learning Controller */}
      <GlassCard glowColor="purple" className="border-purple-500/30">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Continuous Learning Controller
              </span>
              <StatusBadge status={isTraining ? 'Training in Progress' : 'Pipeline Idle'} pulse={isTraining} />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Model Retraining & Gated Promotion Pipeline
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Fine-tunes the candidate model on processed training batches and user feedback. Evaluates on validation split and automatically promotes to production only if F1 &gt;= 0.80.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-400">Target Version:</label>
              <input
                type="text"
                value={targetVersion}
                onChange={(e) => setTargetVersion(e.target.value)}
                disabled={isTraining}
                className="glass-input text-xs px-3 py-2 rounded-xl w-24 text-center font-mono"
              />
            </div>

            <GlassButton
              variant="primary"
              size="md"
              onClick={handleStartTraining}
              isLoading={isStartingTraining || isTraining}
              disabled={isTraining}
              leftIcon={<Play className="w-4 h-4 fill-white" />}
            >
              {isTraining ? 'Training Run Active...' : 'Start Training'}
            </GlassButton>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 flex items-center gap-2 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Live Training Progress & Terminal Logs */}
        {trainingStatus && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200 flex items-center gap-2">
                <RotateCw className={`w-3.5 h-3.5 text-cyan-400 ${isTraining ? 'animate-spin' : ''}`} />
                Status: {trainingStatus.current_step}
              </span>
              <span className="font-mono text-cyan-400 font-bold">
                {trainingStatus.progress_percentage}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-900/80 h-2.5 rounded-full overflow-hidden border border-white/10 p-[1px]">
              <div
                className="bg-gradient-to-r from-blue-500 via-cyan-400 to-purple-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${trainingStatus.progress_percentage}%` }}
              />
            </div>

            {/* Terminal Log Box */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-white/10 font-mono text-xs text-slate-300 max-h-48 overflow-y-auto space-y-1">
              <div className="text-slate-500 flex items-center gap-2 border-b border-white/5 pb-1 mb-2">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                <span>Training Pipeline Logs (Job: {trainingStatus.job_id})</span>
              </div>
              {trainingStatus.logs.map((log, idx) => (
                <div key={idx} className="leading-relaxed">
                  <span className="text-cyan-500">&gt;</span> {log}
                </div>
              ))}
            </div>
          </div>
        )}
      </GlassCard>

      {/* DVC Dataset & Model Registry Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* DVC Dataset Specs */}
        <GlassCard>
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                DVC Dataset Versioning
              </h3>
            </div>
            <StatusBadge status={`DVC: ${datasetMeta?.dvc_version || 'v1.2.0'}`} variant="healthy" />
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
              <span className="text-slate-400">Tracked Pipeline</span>
              <p className="font-semibold text-white mt-1">dvc.yaml (3 stages)</p>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
              <span className="text-slate-400">Raw Dataset Size</span>
              <p className="font-semibold text-white mt-1">{datasetMeta?.raw_size_kb || 78.4} KB</p>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
              <span className="text-slate-400">Total Samples</span>
              <p className="font-semibold text-cyan-300 mt-1">{datasetMeta?.raw_samples || 480} records</p>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
              <span className="text-slate-400">Categories</span>
              <p className="font-semibold text-purple-300 mt-1">{datasetMeta?.num_categories || 8} classes</p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
            <span>Splits: Train {datasetMeta?.splits.train} | Val {datasetMeta?.splits.validation} | Test {datasetMeta?.splits.test}</span>
            <span className="text-emerald-400 flex items-center gap-1 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              Reproducible
            </span>
          </div>
        </GlassCard>

        {/* Model Registry Card */}
        <GlassCard>
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
            <div className="flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                MLflow Model Registry
              </h3>
            </div>
            <span className="text-xs font-mono text-cyan-400">news-topic-classifier</span>
          </div>

          <div className="space-y-3">
            {models.map((mod, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">v{mod.version}</span>
                    <StatusBadge status={mod.stage} variant="healthy" />
                  </div>
                  <p className="text-slate-400 text-[11px] mt-1">
                    {mod.architecture} • F1: {(mod.f1_score * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="text-right">
                  <span className="px-2 py-1 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[10px] font-bold">
                    PRODUCTION
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
            <span>Promotion Gate: F1 &gt;= 0.80</span>
            <span className="text-cyan-300 font-mono">
              Active: {currentModel?.model_version || 'v1.0'} ({currentModel?.model_type || 'DEMO MODEL'})
            </span>
          </div>

        </GlassCard>
      </div>

      {/* MLflow Experiment Runs Table */}
      <GlassCard>
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              MLflow Tracked Experiment Runs
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Parameters, validation accuracy, F1 score, and run execution status</p>
          </div>

          <GlassButton
            size="sm"
            variant="secondary"
            onClick={loadMLOpsData}
            leftIcon={<RotateCw className="w-3.5 h-3.5 text-cyan-400" />}
          >
            Refresh Runs
          </GlassButton>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-400 uppercase tracking-wider border-b border-white/5">
                <th className="pb-3 font-semibold">Run ID</th>
                <th className="pb-3 font-semibold">Model Version</th>
                <th className="pb-3 font-semibold">Accuracy</th>
                <th className="pb-3 font-semibold">F1 Score</th>
                <th className="pb-3 font-semibold">Epochs</th>
                <th className="pb-3 font-semibold">Batch Size</th>
                <th className="pb-3 font-semibold">Promoted</th>
                <th className="pb-3 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {experiments.map((run) => (
                <tr key={run.run_id} className="hover:bg-white/[0.02]">
                  <td className="py-3 font-mono text-cyan-300 font-bold">{run.run_id}</td>
                  <td className="py-3 text-slate-200">{run.model_version}</td>
                  <td className="py-3 font-mono text-slate-300">{(run.accuracy * 100).toFixed(1)}%</td>
                  <td className="py-3 font-mono text-purple-300 font-bold">{(run.f1 * 100).toFixed(1)}%</td>
                  <td className="py-3 text-slate-400">{run.epochs}</td>
                  <td className="py-3 text-slate-400">{run.batch_size}</td>
                  <td className="py-3">
                    {run.is_promoted ? (
                      <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                        <CheckCircle2 className="w-3 h-3" /> Yes
                      </span>
                    ) : (
                      <span className="text-slate-500">No</span>
                    )}
                  </td>
                  <td className="py-3 text-right">
                    <StatusBadge status={run.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
};

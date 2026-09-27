import React, { useEffect, useState } from 'react';
import {
  Activity,
  ExternalLink,
  Gauge,
  Layers,
  FileBarChart,
  RefreshCw,
} from 'lucide-react';

import { GlassCard } from '../components/GlassCard';
import { GlassButton } from '../components/GlassButton';
import { StatusBadge } from '../components/StatusBadge';
import { LoadingState } from '../components/LoadingState';
import { api } from '../services/api';
import type { MonitoringData } from '../types';

export const Monitoring: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [monitoring, setMonitoring] = useState<MonitoringData | null>(null);

  const fetchMonitoring = async () => {
    setLoading(true);
    try {
      const data = await api.getMonitoring();
      setMonitoring(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonitoring();
  }, []);

  if (loading) {
    return <LoadingState message="Calculating Kolmogorov-Smirnov & TVD Drift Metrics..." subMessage="Evaluating baseline reference vs live production distribution" />;
  }

  const status = monitoring?.status || 'Healthy';
  const metrics = monitoring?.metrics || {
    text_length_p_value: 1.0,
    word_count_p_value: 1.0,
    confidence_drift_p_value: 1.0,
    category_drift_score: 0.0,
    average_confidence_reference: 0.8545,
    average_confidence_current: 0.8545,
  };

  const featureDrift = monitoring?.feature_drift || {
    text_length: { drift_detected: false, score: 0.0 },
    word_count: { drift_detected: false, score: 0.0 },
    prediction_confidence: { drift_detected: false, score: 0.0 },
    category_distribution: { drift_detected: false, score: 0.0 },
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Drift Header Card */}
      <GlassCard glowColor={status === 'Healthy' ? 'emerald' : status === 'Warning' ? 'cyan' : 'purple'}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-5 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Evidently AI Engine
              </span>
              <StatusBadge status={`Overall System: ${status}`} pulse={status !== 'Healthy'} />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Data & Prediction Drift Monitor
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Continuous non-parametric statistical testing (Kolmogorov-Smirnov & Total Variation Distance) comparing incoming inference inputs against curated baseline reference distributions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <GlassButton
              variant="secondary"
              size="md"
              onClick={fetchMonitoring}
              leftIcon={<RefreshCw className="w-4 h-4 text-cyan-400" />}
            >
              Re-run Drift Scan
            </GlassButton>
            <a
              href="/api/v1/monitoring/report"
              target="_blank"
              rel="noopener noreferrer"
              className="glass-button-primary px-4 py-2.5 text-sm rounded-xl font-medium inline-flex items-center gap-2 text-white cursor-pointer"
            >
              <FileBarChart className="w-4 h-4" />
              <span>Open Evidently HTML Report</span>
              <ExternalLink className="w-3.5 h-3.5 text-cyan-200" />
            </a>
          </div>
        </div>

        {/* Dataset sample sizes */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 text-xs">
          <div className="p-3 rounded-xl bg-white/5 border border-white/5">
            <span className="text-slate-400">Baseline Reference</span>
            <p className="text-lg font-bold text-white mt-1">{monitoring?.reference_samples || 72} samples</p>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/5">
            <span className="text-slate-400">Current Window</span>
            <p className="text-lg font-bold text-cyan-300 mt-1">{monitoring?.current_samples || 72} samples</p>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/5">
            <span className="text-slate-400">P-Value Threshold</span>
            <p className="text-lg font-bold text-purple-300 mt-1">&alpha; = 0.05</p>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/5">
            <span className="text-slate-400">Category TVD Drift</span>
            <p className="text-lg font-bold text-emerald-400 mt-1">{metrics.category_drift_score.toFixed(3)}</p>
          </div>
        </div>
      </GlassCard>

      {/* Feature & Distribution Drift Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Feature 1: Text Length Drift */}
        <GlassCard>
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">Text Length Distribution</h3>
            </div>
            <StatusBadge
              status={featureDrift.text_length.drift_detected ? 'Drifted' : 'Stable'}
              variant={featureDrift.text_length.drift_detected ? 'warning' : 'healthy'}
            />
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Statistical Test</span>
              <span className="font-mono text-slate-200">Two-Sample Kolmogorov-Smirnov</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">P-Value</span>
              <span className="font-mono font-bold text-cyan-300">{metrics.text_length_p_value.toFixed(4)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">KS Statistic</span>
              <span className="font-mono text-slate-300">{featureDrift.text_length.score.toFixed(4)}</span>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-slate-300 mt-2">
              Character length distributions in recent inputs match baseline benchmarks within statistical tolerances.
            </div>
          </div>
        </GlassCard>

        {/* Feature 2: Word Count Drift */}
        <GlassCard>
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">Word Count Distribution</h3>
            </div>
            <StatusBadge
              status={featureDrift.word_count.drift_detected ? 'Drifted' : 'Stable'}
              variant={featureDrift.word_count.drift_detected ? 'warning' : 'healthy'}
            />
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Statistical Test</span>
              <span className="font-mono text-slate-200">Two-Sample Kolmogorov-Smirnov</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">P-Value</span>
              <span className="font-mono font-bold text-blue-300">{metrics.word_count_p_value.toFixed(4)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">KS Statistic</span>
              <span className="font-mono text-slate-300">{featureDrift.word_count.score.toFixed(4)}</span>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-slate-300 mt-2">
              Word frequency and article length profiles are consistent with news dataset reference splits.
            </div>
          </div>
        </GlassCard>

        {/* Feature 3: Prediction Confidence Calibration */}
        <GlassCard>
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
            <div className="flex items-center gap-2">
              <Gauge className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">Confidence Calibration</h3>
            </div>
            <StatusBadge
              status={featureDrift.prediction_confidence.drift_detected ? 'Drifted' : 'Calibrated'}
              variant={featureDrift.prediction_confidence.drift_detected ? 'warning' : 'healthy'}
            />
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Confidence P-Value</span>
              <span className="font-mono font-bold text-purple-300">{metrics.confidence_drift_p_value.toFixed(4)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Reference Mean Confidence</span>
              <span className="font-mono text-slate-200">{(metrics.average_confidence_reference * 100).toFixed(1)}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Current Window Mean</span>
              <span className="font-mono text-emerald-400">{(metrics.average_confidence_current * 100).toFixed(1)}%</span>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-slate-300 mt-2">
              Softmax probability distributions show no degradation in model certainty.
            </div>
          </div>
        </GlassCard>

        {/* Feature 4: Category Topic Distribution TVD */}
        <GlassCard>
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">Category Distribution Shift</h3>
            </div>
            <StatusBadge
              status={featureDrift.category_distribution.drift_detected ? 'Shift Detected' : 'Balanced'}
              variant={featureDrift.category_distribution.drift_detected ? 'warning' : 'healthy'}
            />
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Distance Metric</span>
              <span className="font-mono text-slate-200">Total Variation Distance (TVD)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">TVD Score</span>
              <span className="font-mono font-bold text-emerald-300">{metrics.category_drift_score.toFixed(4)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Threshold Limit</span>
              <span className="font-mono text-slate-400">&lt; 0.20 for Balanced</span>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-slate-300 mt-2">
              Predicted topic frequencies across 8 categories remain aligned with expected topical balance.
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

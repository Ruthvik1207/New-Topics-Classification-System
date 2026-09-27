import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, Sparkles, Send, Clock, Cpu } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { GlassButton } from './GlassButton';
import { ProbabilityChart } from './ProbabilityChart';
import type { PredictionResponse, Category } from '../types';
import { api } from '../services/api';

interface PredictionResultProps {
  result: PredictionResponse;
  onFeedbackSubmitted?: () => void;
}

const CATEGORIES: Category[] = [
  'World',
  'Politics',
  'Business',
  'Technology',
  'Science',
  'Health',
  'Sports',
  'Entertainment',
];

export const PredictionResult: React.FC<PredictionResultProps> = ({
  result,
  onFeedbackSubmitted,
}) => {
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<string | null>(null);
  const [showCorrectionSelect, setShowCorrectionSelect] = useState(false);
  const [selectedCorrection, setSelectedCorrection] = useState<Category>(result.prediction);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const confidencePercent = (result.confidence * 100).toFixed(1);

  const handleFeedback = async (correct: boolean, customLabel?: Category) => {
    setIsSubmitting(true);
    const labelToSend = correct ? result.prediction : customLabel || selectedCorrection;
    try {
      await api.submitFeedback(result.prediction_id, labelToSend);
      setFeedbackSubmitted(labelToSend);
      setShowCorrectionSelect(false);
      if (onFeedbackSubmitted) onFeedbackSubmitted();
    } catch (err) {
      console.error('Failed to submit feedback', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <GlassCard glowColor="cyan" className="border-cyan-500/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Predicted Topic</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white mt-1 tracking-tight">
              {result.prediction}
            </h2>
          </div>

          <div className="flex flex-col items-start sm:items-end">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">Confidence</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-3xl font-black text-cyan-300">{confidencePercent}%</span>
            </div>
            <span className="text-[11px] text-slate-400">Calibrated Probability</span>
          </div>
        </div>

        {/* Metadata badges */}
        <div className="flex flex-wrap items-center gap-3 py-4 text-xs text-slate-300 border-b border-white/5">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>Model: <strong className="text-white">{result.model_version}</strong></span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-cyan-300">
            <span>{result.model_type}</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{new Date(result.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>

        {/* Probability Distribution */}
        <div className="mt-5">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3.5">
            Category Probabilities
          </h4>
          <ProbabilityChart
            probabilities={result.probabilities}
            predictedCategory={result.prediction}
          />
        </div>

        {/* Continuous Learning Feedback Card */}
        <div className="mt-6 pt-5 border-t border-white/10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h5 className="text-xs font-semibold text-slate-200">Continuous Learning Feedback</h5>
              <p className="text-xs text-slate-400 mt-0.5">
                Was this classification accurate? Your feedback powers the retraining queue.
              </p>
            </div>

            {feedbackSubmitted ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
                <CheckCircle2 className="w-4 h-4" />
                <span>Feedback saved ({feedbackSubmitted})</span>
              </div>
            ) : showCorrectionSelect ? (
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <select
                  value={selectedCorrection}
                  onChange={(e) => setSelectedCorrection(e.target.value as Category)}
                  className="glass-input text-xs px-2.5 py-1.5 rounded-lg border border-white/20 bg-slate-900"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c} className="bg-slate-900 text-white">
                      {c}
                    </option>
                  ))}
                </select>
                <GlassButton
                  size="sm"
                  variant="primary"
                  isLoading={isSubmitting}
                  onClick={() => handleFeedback(false, selectedCorrection)}
                  leftIcon={<Send className="w-3 h-3" />}
                >
                  Submit
                </GlassButton>
                <GlassButton
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowCorrectionSelect(false)}
                >
                  Cancel
                </GlassButton>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <GlassButton
                  size="sm"
                  variant="secondary"
                  leftIcon={<CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                  onClick={() => handleFeedback(true)}
                  disabled={isSubmitting}
                >
                  Correct
                </GlassButton>
                <GlassButton
                  size="sm"
                  variant="outline"
                  leftIcon={<AlertCircle className="w-3.5 h-3.5 text-amber-400" />}
                  onClick={() => setShowCorrectionSelect(true)}
                  disabled={isSubmitting}
                >
                  Correct Label
                </GlassButton>
              </div>
            )}
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

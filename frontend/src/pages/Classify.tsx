import React, { useState } from 'react';
import {
  Sparkles,
  RotateCcw,
  BookOpen,
  AlertCircle,
  FileText,
} from 'lucide-react';

import { GlassCard } from '../components/GlassCard';
import { GlassButton } from '../components/GlassButton';
import { PredictionResult } from '../components/PredictionResult';
import { api } from '../services/api';
import type { PredictionResponse, Category } from '../types';

interface SampleArticle {
  category: Category;
  title: string;
  text: string;
}

const SAMPLE_ARTICLES: SampleArticle[] = [
  {
    category: 'Technology',
    title: 'Breakthrough in Neural Silicon Accelerators',
    text: 'Researchers at the international hardware consortium revealed a revolutionary optical computing architecture tailored for deep neural network inference. The prototype silicon photonic chip achieves tenfold latency reductions and ninety percent energy efficiency gains over conventional extreme ultraviolet semiconductor accelerators.',
  },
  {
    category: 'Business',
    title: 'Central Banks Navigate Global Interest Rate Horizons',
    text: 'Global equity markets surged to fresh records as monetary authorities signaled stability across benchmark interest rates following a steady contraction in headline inflation indices. Venture capital deployments into green manufacturing and cross-border fintech payment networks rose forty-two percent in the latest quarter.',
  },
  {
    category: 'Politics',
    title: 'Parliament Debates Sweeping Digital Privacy Legislation',
    text: 'Lawmakers convened for extensive parliamentary hearings to debate a landmark regulatory reform bill aimed at curbing algorithmic surveillance, protecting consumer biometric records, and mandating transparency audits for generative artificial intelligence models deployed across federal agencies.',
  },
  {
    category: 'Science',
    title: 'Space Telescope Maps Earliest Galactic Filaments',
    text: 'Astronomers processing deep infrared telemetry from the orbital space telescope detected complex primordial galaxy clusters dating to within three hundred million years of the cosmic dawn. The spectroscopic data challenges current models of cosmological dark matter distribution in the early universe.',
  },
  {
    category: 'Health',
    title: 'Targeted mRNA Vaccine Demonstrates High Clinical Efficacy',
    text: 'A multi-center Phase III clinical trial published in the medical journal reported eighty-eight percent protective efficacy for an innovative personalized mRNA therapeutic directed against recurrent melanoma tumors. The treatment prompted durable systemic T-cell activation without severe adverse neurotoxicity.',
  },
  {
    category: 'World',
    title: 'Diplomatic Accord Establishes Humanitarian Corridors',
    text: 'Delegates representing thirty-four nations ratified an emergency maritime logistics pact in Geneva to safeguard international shipping corridors and facilitate humanitarian food aid shipments through disputed territorial waters following months of bilateral regional tensions.',
  },
  {
    category: 'Sports',
    title: 'Dramatic Stoppage-Time Strike Clinches Championship Glory',
    text: 'In a breathless final fixture before seventy thousand spectators, the underdog club secured an unforgettable continental cup victory with a curling stoppage-time strike in the ninety-fourth minute. The triumph marks their first international championship title in forty-two seasons.',
  },
  {
    category: 'Entertainment',
    title: 'Dystopian Sci-Fi Epic Sweeps Annual International Film Awards',
    text: 'The premiere season of the visionary neo-noir science fiction franchise received unanimous critical praise and swept nine cinematic guild awards, honoring its pioneering virtual soundstage cinematography, innovative orchestral score, and arresting ensemble performance.',
  },
];

export const Classify: React.FC = () => {
  const [articleText, setArticleText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeSampleCategory, setActiveSampleCategory] = useState<Category | null>(null);

  const charCount = articleText.length;
  const wordCount = articleText.trim() ? articleText.trim().split(/\s+/).length : 0;

  const handleClassify = async () => {
    if (!articleText.trim()) {
      setError('Please paste or enter news article text to classify');
      return;
    }
    if (articleText.trim().length < 10) {
      setError('Article text must contain at least 10 characters');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const res = await api.predict(articleText);
      setResult(res);
    } catch (err: any) {
      setError(err?.message || 'Classification failed. Please check backend connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadSample = (sample: SampleArticle) => {
    setArticleText(sample.text);
    setActiveSampleCategory(sample.category);
    setError(null);
  };

  const handleClear = () => {
    setArticleText('');
    setResult(null);
    setError(null);
    setActiveSampleCategory(null);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Sample Articles Selector Pill Row */}
      <GlassCard className="p-4 border-cyan-500/20">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Quick Load Demo Articles (8 Topics)
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_ARTICLES.map((sample) => (
            <button
              key={sample.category}
              onClick={() => loadSample(sample)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 border cursor-pointer ${
                activeSampleCategory === sample.category
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {sample.category}
            </button>
          ))}
        </div>
      </GlassCard>

      {/* Main Text Editor */}
      <GlassCard glowColor="cyan" className="relative">
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Article Content Editor
            </h3>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
            <span>{wordCount} words</span>
            <span>•</span>
            <span>{charCount} chars</span>
          </div>
        </div>

        <textarea
          value={articleText}
          onChange={(e) => {
            setArticleText(e.target.value);
            if (error) setError(null);
          }}
          placeholder="Paste or write full news article text here... (e.g. Breaking news on technology, science, world events, finance, politics, sports...)"
          rows={9}
          className="w-full glass-input rounded-xl p-4 text-sm leading-relaxed placeholder:text-slate-500 resize-y min-h-[180px]"
        />

        {error && (
          <div className="mt-3 p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 flex items-center gap-2.5 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/10">
          <GlassButton
            size="sm"
            variant="ghost"
            onClick={handleClear}
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            disabled={!articleText && !result}
          >
            Clear Text
          </GlassButton>

          <GlassButton
            size="lg"
            variant="primary"
            onClick={handleClassify}
            isLoading={isLoading}
            leftIcon={<Sparkles className="w-4 h-4 text-cyan-200" />}
          >
            Classify Article
          </GlassButton>
        </div>
      </GlassCard>

      {/* Result Card */}
      {result && (
        <div className="transition-all duration-500 animate-in fade-in-50 slide-in-from-bottom-4">
          <PredictionResult result={result} />
        </div>
      )}
    </div>
  );
};

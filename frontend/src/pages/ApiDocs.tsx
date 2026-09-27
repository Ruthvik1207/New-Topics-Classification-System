import React, { useState } from 'react';
import {
  Code2,
  Copy,
  Check,
  ExternalLink,
} from 'lucide-react';
import { GlassCard } from '../components/GlassCard';


interface EndpointDoc {
  method: 'GET' | 'POST';
  path: string;
  description: string;
  requestBody?: string;
  responseExample: string;
  curlExample: string;
}

const ENDPOINTS: EndpointDoc[] = [
  {
    method: 'GET',
    path: '/api/v1/health',
    description: 'Check service availability, model loading state, and active version',
    responseExample: `{
  "status": "healthy",
  "service": "NewsLens AI — Continuous Learning News Topic Classification",
  "model_loaded": true,
  "model_version": "v1.0",
  "model_type": "DEMO MODEL",
  "environment": "development"
}`,
    curlExample: 'curl -X GET http://localhost:8000/api/v1/health',
  },
  {
    method: 'POST',
    path: '/api/v1/predict',
    description: 'Classify news article text and return calibrated probability distribution across 8 topics',
    requestBody: `{
  "text": "Researchers at the institute announced a breakthrough in quantum artificial intelligence silicon processors."
}`,
    responseExample: `{
  "prediction_id": "d8e35ab0-94cb-4a69-8fd1-a1b7e0d37e28",
  "prediction": "Technology",
  "confidence": 0.9412,
  "probabilities": {
    "Business": 0.012,
    "Entertainment": 0.005,
    "Health": 0.003,
    "Politics": 0.015,
    "Science": 0.021,
    "Sports": 0.002,
    "Technology": 0.9412,
    "World": 0.0008
  },
  "model_name": "news-topic-classifier",
  "model_version": "v1.0",
  "model_type": "DEMO MODEL",
  "timestamp": "2026-09-27T19:30:00Z"
}`,
    curlExample: `curl -X POST http://localhost:8000/api/v1/predict \\
  -H "Content-Type: application/json" \\
  -d '{"text":"Researchers announced a breakthrough in artificial intelligence."}'`,
  },
  {
    method: 'POST',
    path: '/api/v1/feedback',
    description: 'Submit verified category label feedback for continuous learning and retraining pool',
    requestBody: `{
  "prediction_id": "d8e35ab0-94cb-4a69-8fd1-a1b7e0d37e28",
  "actual_label": "Technology"
}`,
    responseExample: `{
  "status": "success",
  "message": "Feedback recorded for continuous learning retraining pool",
  "prediction_id": "d8e35ab0-94cb-4a69-8fd1-a1b7e0d37e28",
  "predicted_label": "Science",
  "actual_label": "Technology",
  "updated_at": "2026-09-27T19:35:12Z"
}`,
    curlExample: `curl -X POST http://localhost:8000/api/v1/feedback \\
  -H "Content-Type: application/json" \\
  -d '{"prediction_id":"d8e35ab0-94cb-4a69-8fd1-a1b7e0d37e28","actual_label":"Technology"}'`,
  },
  {
    method: 'GET',
    path: '/api/v1/model',
    description: 'Retrieve currently deployed model specifications, parameters, and metadata',
    responseExample: `{
  "model_name": "news-topic-classifier",
  "model_version": "v1.0",
  "model_type": "DEMO MODEL",
  "architecture": "Calibrated Ensemble",
  "categories": ["World", "Politics", "Business", "Technology", "Science", "Health", "Sports", "Entertainment"],
  "metrics": { "accuracy": 0.9861, "precision": 0.9878, "recall": 0.9861, "f1": 0.9863 },
  "is_promoted": true,
  "threshold_f1": 0.80,
  "training_samples": 336,
  "created_at": "2026-09-27T19:30:12Z",
  "status": "ACTIVE"
}`,
    curlExample: 'curl -X GET http://localhost:8000/api/v1/model',
  },
  {
    method: 'GET',
    path: '/api/v1/metrics',
    description: 'Get full test set evaluation report, precision/recall, and confusion matrix',
    responseExample: `{
  "status": "success",
  "model_version": "v1.0",
  "metrics": { "accuracy": 0.9861, "precision": 0.9878, "recall": 0.9861, "f1": 0.9863, "test_samples": 72 },
  "confusion_matrix": [[9, 0, 0, 0, 0, 0, 0, 0], [0, 9, 0, 0, 0, 0, 0, 0]],
  "labels": ["Business", "Entertainment", "Health", "Politics", "Science", "Sports", "Technology", "World"]
}`,
    curlExample: 'curl -X GET http://localhost:8000/api/v1/metrics',
  },
  {
    method: 'GET',
    path: '/api/v1/monitoring',
    description: 'Get Evidently AI drift statistics, Kolmogorov-Smirnov p-values, and TVD distance metrics',
    responseExample: `{
  "status": "Healthy",
  "timestamp": "2026-09-27T19:30:55Z",
  "reference_samples": 72,
  "current_samples": 72,
  "metrics": {
    "text_length_p_value": 1.0,
    "word_count_p_value": 1.0,
    "confidence_drift_p_value": 1.0,
    "category_drift_score": 0.0
  },
  "feature_drift": {
    "text_length": { "drift_detected": false, "score": 0.0 },
    "category_distribution": { "drift_detected": false, "score": 0.0 }
  }
}`,
    curlExample: 'curl -X GET http://localhost:8000/api/v1/monitoring',
  },
  {
    method: 'POST',
    path: '/api/v1/train',
    description: 'Trigger a controlled background training job with evaluation gate and automated model reload',
    requestBody: `{
  "model_version": "v1.1",
  "epochs": 3,
  "batch_size": 16,
  "learning_rate": 0.00003
}`,
    responseExample: `{
  "status": "accepted",
  "message": "Training pipeline initiated in background worker",
  "job_id": "4b92ef18",
  "target_model_version": "v1.1"
}`,
    curlExample: `curl -X POST http://localhost:8000/api/v1/train \\
  -H "Content-Type: application/json" \\
  -d '{"model_version":"v1.1","epochs":3}'`,
  },
  {
    method: 'GET',
    path: '/api/v1/training/status',
    description: 'Poll continuous learning job status, progress percentage, and step logs',
    responseExample: `{
  "job_id": "4b92ef18",
  "status": "completed",
  "progress_percentage": 100,
  "current_step": "Training complete",
  "threshold_f1": 0.80,
  "is_promoted": true,
  "logs": ["[19:30:05] Step 1/5: Loading dataset...", "[19:30:10] Training finished."]
}`,
    curlExample: 'curl -X GET http://localhost:8000/api/v1/training/status',
  },
  {
    method: 'GET',
    path: '/api/v1/dataset',
    description: 'Inspect DVC dataset tracking status, data split counts, and category proportions',
    responseExample: `{
  "dvc_version": "v1.2.0",
  "dvc_tracked": true,
  "raw_samples": 480,
  "splits": { "train": 336, "validation": 72, "test": 72 },
  "num_categories": 8
}`,
    curlExample: 'curl -X GET http://localhost:8000/api/v1/dataset',
  },
  {
    method: 'GET',
    path: '/api/v1/experiments',
    description: 'Fetch MLflow experiment runs with metrics, hyper-parameters, and execution status',
    responseExample: `{
  "status": "success",
  "tracking_uri": "sqlite:///mlflow.db",
  "experiment_name": "news-topic-classification",
  "runs": [
    { "run_id": "a611a5b1", "accuracy": 0.9861, "f1": 0.9863, "is_promoted": true, "status": "FINISHED" }
  ]
}`,
    curlExample: 'curl -X GET http://localhost:8000/api/v1/experiments',
  },
  {
    method: 'GET',
    path: '/api/v1/models',
    description: 'Fetch registered models from MLflow Model Registry',
    responseExample: `{
  "status": "success",
  "models": [
    { "name": "news-topic-classifier", "version": "1", "stage": "Production", "status": "READY", "f1_score": 0.9863 }
  ]
}`,
    curlExample: 'curl -X GET http://localhost:8000/api/v1/models',
  },
];

export const ApiDocs: React.FC = () => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Overview Banner */}
      <GlassCard glowColor="blue">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Code2 className="w-5 h-5 text-cyan-400" />
              <h2 className="text-2xl font-bold text-white tracking-tight">FastAPI REST Contract</h2>
            </div>
            <p className="text-xs text-slate-300">
              Interactive endpoints for model inference, monitoring telemetry, feedback collection, and MLOps triggers.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="glass-button-primary px-3.5 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 text-white"
            >
              <span>Swagger UI</span>
              <ExternalLink className="w-3.5 h-3.5 text-cyan-200" />
            </a>
            <a
              href="/redoc"
              target="_blank"
              rel="noopener noreferrer"
              className="glass-button px-3.5 py-2 rounded-xl text-xs font-medium inline-flex items-center gap-1.5 text-slate-300 hover:text-white"
            >
              <span>ReDoc</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-400">
          <span>Base URL: <code className="text-cyan-300">http://localhost:8000/api/v1</code></span>
          <span>•</span>
          <span>Format: <code className="text-purple-300">application/json</code></span>
          <span>•</span>
          <span>Total Endpoints: <strong className="text-white">11</strong></span>
        </div>
      </GlassCard>

      {/* Endpoints List */}
      <div className="space-y-4">
        {ENDPOINTS.map((ep, idx) => (
          <GlassCard key={idx} className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-white/5">
              <div className="flex items-center gap-2.5">
                <span
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold tracking-wide uppercase ${
                    ep.method === 'POST'
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}
                >
                  {ep.method}
                </span>
                <span className="font-mono text-sm font-semibold text-white">{ep.path}</span>
              </div>
              <p className="text-xs text-slate-400">{ep.description}</p>
            </div>

            {/* Curl Command with Copy */}
            <div className="relative rounded-xl bg-slate-950/80 border border-white/10 p-3 font-mono text-xs text-slate-300">
              <button
                onClick={() => handleCopy(ep.curlExample, idx)}
                className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Copy curl command"
              >
                {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <div className="pr-8 text-cyan-300 overflow-x-auto whitespace-pre-wrap">
                {ep.curlExample}
              </div>
            </div>

            {/* Request Body if present */}
            {ep.requestBody && (
              <div>
                <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 block mb-1">
                  Request Payload
                </span>
                <pre className="p-3 rounded-xl bg-slate-950/60 border border-white/5 font-mono text-xs text-slate-300 overflow-x-auto">
                  {ep.requestBody}
                </pre>
              </div>
            )}

            {/* Response Example */}
            <div>
              <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 block mb-1">
                200 OK Response
              </span>
              <pre className="p-3 rounded-xl bg-slate-950/60 border border-white/5 font-mono text-xs text-emerald-300/90 overflow-x-auto max-h-48">
                {ep.responseExample}
              </pre>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};

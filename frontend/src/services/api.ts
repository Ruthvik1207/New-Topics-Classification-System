import type {
  PredictionResponse,
  PredictionHistoryItem,
  FeedbackResponse,
  ModelMetadata,
  EvaluationMetricsResponse,
  MonitoringData,
  DatasetMetadata,
  MLflowRun,
  ModelRegistryItem,
  TrainingStatus
} from '../types';

const API_BASE = '/api/v1';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorDetail = 'API request failed';
    try {
      const errJson = await res.json();
      errorDetail = errJson.detail || errJson.message || errorDetail;
    } catch {
      errorDetail = res.statusText || errorDetail;
    }
    throw new Error(errorDetail);
  }
  return res.json();
}

export const api = {
  // Health
  async getHealth(): Promise<{ status: string; service: string; model_loaded: boolean; model_version: string; model_type: string }> {
    const res = await fetch(`${API_BASE}/health`);
    return handleResponse(res);
  },

  // Prediction
  async predict(text: string): Promise<PredictionResponse> {
    const res = await fetch(`${API_BASE}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    return handleResponse<PredictionResponse>(res);
  },

  // Feedback
  async submitFeedback(prediction_id: string, actual_label: string): Promise<FeedbackResponse> {
    const res = await fetch(`${API_BASE}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prediction_id, actual_label }),
    });
    return handleResponse<FeedbackResponse>(res);
  },

  // History & Stats
  async getRecentPredictions(limit = 10): Promise<PredictionHistoryItem[]> {
    const res = await fetch(`${API_BASE}/predictions/recent?limit=${limit}`);
    return handleResponse<PredictionHistoryItem[]>(res);
  },

  async getPredictionStats(): Promise<{ total_predictions: number; average_confidence: number; topic_distribution: Record<string, number>; feedback_count: number }> {
    const res = await fetch(`${API_BASE}/predictions/stats`);
    return handleResponse(res);
  },

  // Model Metadata
  async getModelMetadata(): Promise<ModelMetadata> {
    const res = await fetch(`${API_BASE}/model`);
    return handleResponse<ModelMetadata>(res);
  },

  // Metrics
  async getEvaluationMetrics(): Promise<EvaluationMetricsResponse> {
    const res = await fetch(`${API_BASE}/metrics`);
    return handleResponse<EvaluationMetricsResponse>(res);
  },

  // Monitoring
  async getMonitoring(): Promise<MonitoringData> {
    const res = await fetch(`${API_BASE}/monitoring`);
    return handleResponse<MonitoringData>(res);
  },

  // Dataset & DVC
  async getDatasetMetadata(): Promise<DatasetMetadata> {
    const res = await fetch(`${API_BASE}/dataset`);
    return handleResponse<DatasetMetadata>(res);
  },

  // MLflow Experiments
  async getExperiments(): Promise<{ status: string; tracking_uri: string; experiment_name: string; runs: MLflowRun[] }> {
    const res = await fetch(`${API_BASE}/experiments`);
    return handleResponse(res);
  },

  async getRegisteredModels(): Promise<{ status: string; models: ModelRegistryItem[] }> {
    const res = await fetch(`${API_BASE}/models`);
    return handleResponse(res);
  },

  // Training & Continuous Learning
  async triggerTraining(params: { model_version?: string; epochs?: number; batch_size?: number; learning_rate?: number }): Promise<{ status: string; message: string; job_id: string; target_model_version: string }> {
    const res = await fetch(`${API_BASE}/train`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return handleResponse(res);
  },

  async getTrainingStatus(): Promise<TrainingStatus> {
    const res = await fetch(`${API_BASE}/training/status`);
    return handleResponse<TrainingStatus>(res);
  },
};

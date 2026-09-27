export type Category = 
  | 'World'
  | 'Politics'
  | 'Business'
  | 'Technology'
  | 'Science'
  | 'Health'
  | 'Sports'
  | 'Entertainment';

export interface PredictionResponse {
  prediction_id: string;
  prediction: Category;
  confidence: number;
  probabilities: Record<Category, number>;
  model_name: string;
  model_version: string;
  model_type: string;
  timestamp: string;
}

export interface PredictionHistoryItem {
  id: string;
  snippet: string;
  prediction: Category;
  confidence: number;
  model_version: string;
  model_type: string;
  timestamp: string;
  actual_label?: string | null;
}

export interface FeedbackResponse {
  status: string;
  message: string;
  prediction_id: string;
  predicted_label: string;
  actual_label: string;
  updated_at: string;
}

export interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  training_time_seconds?: number;
}

export interface ModelMetadata {
  model_name: string;
  model_version: string;
  model_type: string;
  architecture: string;
  categories: Category[];
  metrics: ModelMetrics;
  is_promoted: boolean;
  threshold_f1: number;
  training_samples: number;
  created_at: string;
  run_id?: string;
  status: string;
}

export interface EvaluationMetricsResponse {
  status: string;
  model_version: string;
  metrics: ModelMetrics & { test_samples: number };
  confusion_matrix: number[][];
  labels: string[];
  classification_report: Record<string, any>;
}

export interface FeatureDriftItem {
  drift_detected: boolean;
  score: number;
}

export interface MonitoringData {
  status: 'Healthy' | 'Warning' | 'Critical';
  timestamp: string;
  reference_samples: number;
  current_samples: number;
  metrics: {
    text_length_p_value: number;
    word_count_p_value: number;
    confidence_drift_p_value: number;
    category_drift_score: number;
    average_confidence_reference: number;
    average_confidence_current: number;
  };
  feature_drift: Record<string, FeatureDriftItem>;
  category_distributions: {
    reference: Record<string, number>;
    current: Record<string, number>;
  };
  html_report_available: boolean;
}

export interface DatasetMetadata {
  dvc_version: string;
  dvc_tracked: boolean;
  raw_samples: number;
  raw_size_kb: number;
  splits: {
    train: number;
    validation: number;
    test: number;
  };
  num_categories: number;
  categories: Category[];
  category_distribution: Record<string, number>;
  last_updated: string;
}

export interface MLflowRun {
  run_id: string;
  run_name: string;
  status: string;
  start_time: number;
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  training_time: number;
  model_version: string;
  epochs: number | string;
  batch_size: number | string;
  is_promoted: boolean;
}

export interface ModelRegistryItem {
  name: string;
  version: string;
  stage: string;
  status: string;
  architecture: string;
  f1_score: number;
  created_at: string;
}

export interface TrainingStatus {
  job_id: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
  progress_percentage: number;
  current_step: string;
  started_at?: string | null;
  finished_at?: string | null;
  model_version?: string | null;
  metrics?: ModelMetrics | null;
  logs: string[];
  threshold_f1: number;
  is_promoted?: boolean | null;
}

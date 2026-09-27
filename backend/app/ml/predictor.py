import torch
import numpy as np
from typing import Dict, Any, Tuple
from backend.app.config import settings
from backend.app.ml.model_loader import ModelRegistry
from backend.app.core.logging import logger

def predict_article_topic(text: str) -> Dict[str, Any]:
    registry = ModelRegistry.get_instance()
    model = registry.model
    model_type = registry.model_type
    categories = settings.CATEGORIES

    if model is None:
        raise RuntimeError("No model is currently loaded in memory")

    # If Transformer Model is active
    if model_type == "BERT MODEL" and registry.tokenizer is not None:
        try:
            tokenizer = registry.tokenizer
            inputs = tokenizer(
                text,
                padding=True,
                truncation=True,
                max_length=128,
                return_tensors="pt"
            )
            with torch.no_grad():
                outputs = model(**inputs)
                logits = outputs.logits
                probs = torch.softmax(logits, dim=1).squeeze().tolist()

            if isinstance(probs, float):
                probs = [probs]

            # Map probabilities
            id2label = getattr(model.config, "id2label", None) or {i: c for i, c in enumerate(categories)}
            prob_dict = {}
            for i, p in enumerate(probs):
                cat_name = id2label.get(i, id2label.get(str(i), f"Class_{i}"))
                prob_dict[cat_name] = round(float(p), 4)

            # Ensure all configured categories are present in prob_dict
            for c in categories:
                if c not in prob_dict:
                    prob_dict[c] = 0.0

            predicted_cat = max(prob_dict, key=prob_dict.get)
            confidence = prob_dict[predicted_cat]

            return {
                "prediction": predicted_cat,
                "confidence": confidence,
                "probabilities": prob_dict,
                "model_type": "BERT MODEL"
            }
        except Exception as e:
            logger.error(f"Transformer inference error: {e}. Falling back to default inference.")

    # Lightweight Calibrated Classifier Pipeline
    try:
        # Check predict_proba
        classes = list(model.classes_)
        raw_probs = model.predict_proba([text])[0]
        
        prob_dict = {}
        for c, p in zip(classes, raw_probs):
            prob_dict[c] = round(float(p), 4)

        # Include missing categories with 0.00
        for c in categories:
            if c not in prob_dict:
                prob_dict[c] = 0.0001

        # Normalize so sum is exactly 1.0
        total = sum(prob_dict.values())
        prob_dict = {k: round(v / total, 4) for k, v in prob_dict.items()}

        predicted_cat = max(prob_dict, key=prob_dict.get)
        confidence = prob_dict[predicted_cat]

        return {
            "prediction": predicted_cat,
            "confidence": confidence,
            "probabilities": prob_dict,
            "model_type": "DEMO MODEL"
        }
    except Exception as e:
        logger.error(f"Inference calculation failed: {e}")
        raise RuntimeError(f"Prediction failed: {e}")

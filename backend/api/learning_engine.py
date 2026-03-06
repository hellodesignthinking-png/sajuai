from typing import Dict, List, Optional
from datetime import datetime

class FeedbackAnalyzer:
    """
    Analyzes user-reported accuracy and diaries to refine analysis weights.
    """
    @staticmethod
    def analyze_accuracy(diary_text: str, predicted_score: float, actual_rating: int) -> Dict:
        # Rating is 1-5. 3 is neutral.
        accuracy_delta = (actual_rating - 3) * 10 
        
        # Simple heuristic: If prediction was high but rating was low, 
        # we might be overestimating certain weights (e.g., Sanjong ratio).
        
        return {
            "timestamp": datetime.now().isoformat(),
            "predicted": predicted_score,
            "actual_rating": actual_rating,
            "accuracy_delta": accuracy_delta,
            "diary_summary": diary_text[:50] + "..." if len(diary_text) > 50 else diary_text
        }

class WeightCorrectionEngine:
    """
    Self-learning engine that adjusts personalized weights over time.
    """
    def __init__(self, current_weights: Dict[str, float]):
        self.weights = current_weights

    def refine_weights(self, feedback_history: List[Dict]):
        # Over many iterations, this would use ML to minimize (predicted - actual)
        # For now, we apply a dampening factor to outliers.
        avg_delta = sum(f['accuracy_delta'] for f in feedback_history) / len(feedback_history) if feedback_history else 0
        
        # If consistently off, adjust global sensitivity
        if abs(avg_delta) > 15:
            self.weights['sensitivity'] *= (1.0 + (avg_delta / 100.0))
            
        return self.weights

async def generate_monthly_review(user_id: str, history: List[Dict]) -> Dict:
    """
    Creates a 'Monthly Fate Review' narrative summary.
    """
    hits = [f for f in history if f['actual_rating'] >= 4]
    misses = [f for f in history if f['actual_rating'] <= 2]
    
    return {
        "month": datetime.now().strftime("%B"),
        "total_days": len(history),
        "hit_rate": (len(hits) / len(history)) * 100 if history else 0,
        "key_lesson": "Your 'Water' energy was most accurate during social events." if len(hits) > 0 else "Analysis needs refinement.",
        "growth_insights": "Focus on Yong-sin alignment for better resilience next month."
    }

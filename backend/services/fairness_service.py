# services/fairness_service.py
"""Fairness and bias detection service"""

import numpy as np
from typing import Dict, List
from collections import Counter
import logging

logger = logging.getLogger(__name__)

class FairnessService:
    """Bias detection and fairness analysis"""
    
    def __init__(
        self,
        gender_threshold: float = 0.3,
        age_threshold: float = 0.3,
        education_threshold: float = 0.3
    ):
        self.gender_threshold = gender_threshold
        self.age_threshold = age_threshold
        self.education_threshold = education_threshold
    
    def analyze_fairness(self, resumes: List[Dict]) -> Dict:
        """Analyze fairness metrics for resumes"""
        try:
            if not resumes:
                return self._empty_fairness_report()
            
            genders = [r.get('candidate_gender') for r in resumes if r.get('candidate_gender')]
            ages = [r.get('candidate_age_group') for r in resumes if r.get('candidate_age_group')]
            educations = [r.get('candidate_education_level') for r in resumes if r.get('candidate_education_level')]
            scores = [r.get('match_score', 0) for r in resumes]
            
            gender_diversity = self._calculate_diversity(genders)
            age_diversity = self._calculate_diversity(ages)
            education_diversity = self._calculate_diversity(educations)
            
            gender_bias = self._detect_bias(genders, scores)
            age_bias = self._detect_bias(ages, scores)
            education_bias = self._detect_bias(educations, scores)
            
            overall_fairness = (
                (1.0 - (gender_bias + age_bias + education_bias) / 3.0) * 0.6 +
                (gender_diversity + age_diversity + education_diversity) / 3.0 * 0.4
            ) * 100
            
            alerts = self._generate_alerts(gender_bias, age_bias, education_bias)
            
            return {
                'genderDiversity': round(gender_diversity * 100, 2),
                'ageDiversity': round(age_diversity * 100, 2),
                'educationDiversity': round(education_diversity * 100, 2),
                'genderBiasScore': round(gender_bias, 3),
                'ageBiasScore': round(age_bias, 3),
                'educationBiasScore': round(education_bias, 3),
                'overallFairnessScore': round(overall_fairness, 2),
                'alerts': alerts,
                'summary': f"Fairness Score: {overall_fairness:.1f}%"
            }
        except Exception as e:
            logger.error(f"Error analyzing fairness: {str(e)}")
            return self._empty_fairness_report()
    
    @staticmethod
    def _calculate_diversity(values: List[str]) -> float:
        """Calculate Simpson's Diversity Index"""
        if not values or len(values) == 0:
            return 0.0
        
        counter = Counter(values)
        n = len(values)
        diversity = 1.0
        
        for count in counter.values():
            diversity -= (count / n) ** 2
        
        return min(diversity, 1.0)
    
    @staticmethod
    def _detect_bias(categories: List[str], scores: List[float]) -> float:
        """Detect bias in scoring"""
        if len(categories) < 2 or not scores:
            return 0.0
        
        category_scores = {}
        for cat, score in zip(categories, scores):
            if cat not in category_scores:
                category_scores[cat] = []
            category_scores[cat].append(score)
        
        avg_scores = {cat: np.mean(scores) for cat, scores in category_scores.items()}
        
        if len(avg_scores) < 2:
            return 0.0
        
        scores_list = list(avg_scores.values())
        bias = np.std(scores_list) / (np.mean(scores_list) + 0.001)
        
        return min(bias, 1.0)
    
    def _generate_alerts(self, gender_bias, age_bias, education_bias) -> List[str]:
        """Generate alerts for high bias"""
        alerts = []
        
        if gender_bias > self.gender_threshold:
            alerts.append(f"⚠️ Gender bias detected (score: {gender_bias:.2f})")
        
        if age_bias > self.age_threshold:
            alerts.append(f"⚠️ Age bias detected (score: {age_bias:.2f})")
        
        if education_bias > self.education_threshold:
            alerts.append(f"⚠️ Education bias detected (score: {education_bias:.2f})")
        
        return alerts
    
    @staticmethod
    def _empty_fairness_report() -> Dict:
        """Return empty fairness report"""
        return {
            'genderDiversity': 0,
            'ageDiversity': 0,
            'educationDiversity': 0,
            'genderBiasScore': 0,
            'ageBiasScore': 0,
            'educationBiasScore': 0,
            'overallFairnessScore': 0,
            'alerts': [],
            'summary': 'Insufficient data'
        }

fairness_service = FairnessService()
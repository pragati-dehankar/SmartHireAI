import numpy as np
from typing import List, Dict
from collections import Counter

class AnalyticsService:
    @staticmethod
    def get_job_analytics(job, resumes: List) -> Dict:
        if not resumes:
            return {
                'totalCandidates': 0,
                'averageScore': 0,
                'topScore': 0,
                'bottomScore': 0,
                'topCandidates': [],
                'topSkills': [],
                'summary': 'No data'
            }
        
        scores = [r.match_score for r in resumes if r.match_score > 0]
        
        if not scores:
            return {
                'totalCandidates': len(resumes),
                'averageScore': 0,
                'topScore': 0,
                'bottomScore': 0,
                'topCandidates': [],
                'topSkills': [],
                'summary': 'Resumes not yet scored'
            }
        
        return {
            'totalCandidates': len(resumes),
            'scoredCandidates': len(scores),
            'averageScore': round(np.mean(scores), 2),
            'medianScore': round(np.median(scores), 2),
            'topScore': round(np.max(scores), 2),
            'bottomScore': round(np.min(scores), 2),
            'stdDeviation': round(np.std(scores), 2),
            'scoreDistribution': AnalyticsService._get_distribution(scores),
            'topCandidates': AnalyticsService._get_top_candidates(resumes, 5),
            'topSkills': AnalyticsService._get_top_skills(resumes),
            'qualificationRate': round((len([s for s in scores if s >= 60]) / len(scores) * 100), 2)
        }
    
    @staticmethod
    def _get_distribution(scores: List[float]) -> Dict:
        return {
            '80-100': len([s for s in scores if 80 <= s <= 100]),
            '60-79': len([s for s in scores if 60 <= s < 80]),
            '40-59': len([s for s in scores if 40 <= s < 60]),
            '0-39': len([s for s in scores if s < 40])
        }
    
    @staticmethod
    def _get_top_candidates(resumes: List, limit: int = 5) -> List[Dict]:
        sorted_resumes = sorted(resumes, key=lambda x: x.match_score, reverse=True)
        return [
            {
                'name': r.candidate_name,
                'email': r.candidate_email,
                'score': round(r.match_score, 2),
                'rank': i + 1
            }
            for i, r in enumerate(sorted_resumes[:limit])
        ]
    
    @staticmethod
    def _get_top_skills(resumes: List, limit: int = 10) -> List[Dict]:
        all_skills = []
        for resume in resumes:
            all_skills.extend(resume.skills or [])
        
        skill_counts = Counter(all_skills)
        return [
            {'skill': skill, 'count': count}
            for skill, count in skill_counts.most_common(limit)
        ]

analytics_service = AnalyticsService()

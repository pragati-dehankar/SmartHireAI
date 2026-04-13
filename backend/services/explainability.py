from typing import Dict, List

class ExplainabilityService:
    @staticmethod
    def explain_score(resume_data: Dict, job_data: Dict, scores: Dict) -> Dict:
        match_score = scores.get('matchScore', 0)
        
        return {
            'matchScore': match_score,
            'mainReasons': ExplainabilityService._get_main_reasons(match_score, scores),
            'strengths': ExplainabilityService._identify_strengths(scores, resume_data, job_data),
            'gaps': ExplainabilityService._identify_gaps(resume_data, job_data),
            'recommendation': ExplainabilityService._get_recommendation(match_score),
            'confidence': scores.get('confidence', 0),
            'nextSteps': ExplainabilityService._suggest_next_steps(match_score)
        }
    
    @staticmethod
    def _get_main_reasons(score: float, scores: Dict) -> List[str]:
        reasons = []
        if scores.get('skillsMatch', 0) > scores.get('experienceMatch', 0):
            reasons.append(f"Strong skills match ({scores.get('skillsMatch', 0):.0f}%)")
        else:
            reasons.append(f"Solid experience match ({scores.get('experienceMatch', 0):.0f}%)")
        
        if score >= 80:
            reasons.append("High overall compatibility")
        elif score >= 60:
            reasons.append("Moderate fit with some gaps")
        else:
            reasons.append("Significant skill/experience gaps")
        
        return reasons
    
    @staticmethod
    def _identify_strengths(scores: Dict, resume_data: Dict, job_data: Dict) -> List[str]:
        strengths = []
        resume_skills = [s.lower() for s in resume_data.get('skills', [])]
        required_skills = [s.lower() for s in job_data.get('required_skills', [])]
        
        # Intersection of skills
        matched = [s for s in required_skills if s in resume_skills]
        
        if matched:
            strengths.append(f"Mastery in core requirements: {', '.join([m.title() for m in matched[:3]])}")
        
        if scores.get('skillsMatch', 0) >= 75:
            strengths.append(f"Exceptional technical alignment ({scores.get('skillsMatch', 0):.0f}%)")
            
        if scores.get('experienceMatch', 0) >= 75:
            strengths.append("High-depth professional background")
            
        if not matched and scores.get('overallSimilarity', 0) >= 70:
            strengths.append("Strong semantic overlap with job objectives")
            
        return strengths if strengths else ["Highly compatible profile structure"]
    
    @staticmethod
    def _identify_gaps(resume_data: Dict, job_data: Dict) -> List[str]:
        gaps = []
        resume_skills = [s.lower() for s in resume_data.get('skills', [])]
        required_skills = [s.lower() for s in job_data.get('required_skills', [])]
        missing = [s for s in required_skills if s not in resume_skills]
        
        if missing:
            gaps.extend([f"Missing {s} skill" for s in missing[:3]])
        
        return gaps
    
    @staticmethod
    def _get_recommendation(score: float) -> str:
        if score >= 85:
            return "Highly recommended - Fast-track for interview"
        elif score >= 70:
            return "Recommended - Schedule technical interview"
        elif score >= 50:
            return "Consider - Phone screening recommended"
        else:
            return "Not recommended - Low match"
    
    @staticmethod
    def _suggest_next_steps(score: float) -> List[str]:
        if score >= 80:
            return ["1. Schedule technical interview", "2. Verify references", "3. Prepare offer discussion"]
        elif score >= 60:
            return ["1. Conduct phone screening", "2. Technical assessment", "3. Decision meeting"]
        else:
            return ["1. Review gaps with candidate", "2. Consider for junior role", "3. Keep in talent pool"]

explainability_service = ExplainabilityService()

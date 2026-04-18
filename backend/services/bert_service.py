# services/bert_service.py
"""BERT-based resume scoring service"""

import numpy as np
from transformers import AutoTokenizer, AutoModel
import torch
from typing import Dict, List
import logging

logger = logging.getLogger(__name__)

class BertService:
    """BERT-based resume scoring"""
    
    def __init__(self, model_name: str = "sentence-transformers/all-MiniLM-L6-v2"):
        self.model_name = model_name
        self.tokenizer = None
        self.model = None
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self._load_model()
    
    def _load_model(self):
        """Load BERT model and tokenizer"""
        try:
            logger.info(f"Loading BERT model: {self.model_name}")
            self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
            self.model = AutoModel.from_pretrained(self.model_name)
            self.model.to(self.device)
            self.model.eval()
            logger.info("✅ BERT model loaded successfully")
        except Exception as e:
            logger.error(f"Error loading BERT model: {str(e)}")
            raise
    
    def get_embedding(self, text: str) -> np.ndarray:
        """Convert text to embedding vector"""
        if not text or len(text.strip()) == 0:
            return np.zeros(384)
        
        try:
            inputs = self.tokenizer(
                text[:512],
                return_tensors="pt",
                truncation=True,
                padding=True
            )
            inputs = {k: v.to(self.device) for k, v in inputs.items()}
            
            with torch.no_grad():
                outputs = self.model(**inputs)
            
            embedding = outputs.last_hidden_state[:, 0, :].cpu().numpy()
            return embedding[0]
        except Exception as e:
            logger.error(f"Error getting embedding: {str(e)}")
            return np.zeros(384)
    
    @staticmethod
    def cosine_similarity(vec1: np.ndarray, vec2: np.ndarray) -> float:
        """Calculate cosine similarity between two vectors"""
        dot_product = np.dot(vec1, vec2)
        norm_a = np.linalg.norm(vec1)
        norm_b = np.linalg.norm(vec2)
        
        if norm_a == 0 or norm_b == 0:
            return 0.0
        
        return float(dot_product / (norm_a * norm_b))
    
    def score_resume(self, resume_text: str, job_description: str) -> Dict:
        """Score resume against job description"""
        try:
            resume_embedding = self.get_embedding(resume_text)
            job_embedding = self.get_embedding(job_description)
            
            overall_score = self.cosine_similarity(resume_embedding, job_embedding)
            
            sections = self._extract_sections(resume_text)
            
            skills_score = self.cosine_similarity(
                self.get_embedding(sections['skills']),
                job_embedding
            ) if sections['skills'] else overall_score
            
            experience_score = self.cosine_similarity(
                self.get_embedding(sections['experience']),
                job_embedding
            ) if sections['experience'] else overall_score
            
            final_score = (
                overall_score * 0.4 +
                skills_score * 0.35 +
                experience_score * 0.25
            ) * 100
            
            extracted_skills = self._extract_skills(resume_text)
            
            return {
                'matchScore': round(final_score),
                'overallSimilarity': round(overall_score * 100, 2),
                'skillsMatch': round(skills_score * 100, 2),
                'experienceMatch': round(experience_score * 100, 2),
                'extractedSkills': extracted_skills,
                'confidence': round((skills_score + experience_score) / 2 * 100, 2),
                'recommendation': self._get_recommendation(final_score)
            }
        except Exception as e:
            logger.error(f"Error scoring resume: {str(e)}")
            return {
                'matchScore': 0,
                'overallSimilarity': 0,
                'skillsMatch': 0,
                'experienceMatch': 0,
                'extractedSkills': [],
                'confidence': 0,
                'error': str(e)
            }
    
    @staticmethod
    def _extract_sections(text: str) -> Dict:
        """Extract resume sections"""
        text_lower = text.lower()
        
        sections = {
            'skills': '',
            'experience': '',
            'education': '',
            'full_text': text
        }
        
        skills_idx = text_lower.find('skill')
        if skills_idx != -1:
            indices = [
                text_lower.find('experience', skills_idx + 1),
                text_lower.find('education', skills_idx + 1)
            ]
            valid_indices = [i for i in indices if i != -1]
            next_section = min(valid_indices) if valid_indices else len(text)
            sections['skills'] = text[skills_idx:next_section]
        
        exp_idx = text_lower.find('experience')
        if exp_idx != -1:
            indices = [
                text_lower.find('education', exp_idx + 1)
            ]
            valid_indices = [i for i in indices if i != -1]
            next_section = min(valid_indices) if valid_indices else len(text)
            sections['experience'] = text[exp_idx:next_section]
        
        edu_idx = text_lower.find('education')
        if edu_idx != -1:
            sections['education'] = text[edu_idx:]
        
        return sections
    
    @staticmethod
    def _extract_skills(text: str) -> List[str]:
        """Extract skills keywords"""
        skills_keywords = [
            'python', 'javascript', 'java', 'c++', 'golang', 'rust', 'typescript',
            'react', 'angular', 'vue', 'node.js', 'express', 'django', 'flask',
            'fastapi', 'spring', 'sql', 'mongodb', 'postgresql', 'mysql',
            'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'git', 'jenkins',
            'rest api', 'graphql', 'microservices', 'ci/cd', 'agile', 'scrum'
        ]
        
        text_lower = text.lower()
        found_skills = []
        
        for skill in skills_keywords:
            if skill in text_lower:
                found_skills.append(skill.title())
        
        return list(set(found_skills))
    
    @staticmethod
    def _get_recommendation(score: float) -> str:
        """Get recommendation based on score"""
        if score >= 85:
            return "Highly recommended - Strong match"
        elif score >= 70:
            return "Recommended - Good match"
        elif score >= 50:
            return "Consider - Moderate match"
        else:
            return "Not recommended - Minimal match"

bert_service = None

def get_bert_service():
    global bert_service
    if bert_service is None:
        bert_service = BertService()
    return bert_service
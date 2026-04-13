import os
import PyPDF2
import docx
import logging
import re
from flask import current_app

logger = logging.getLogger(__name__)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in current_app.config['ALLOWED_EXTENSIONS']

def anonymize_text(text):
    """Deeply anonymize resume text to ensure background fairness."""
    # Remove Emails
    text = re.sub(r'\S+@\S+', '[EMAIL_REDACTED]', text)
    # Remove Phone Numbers
    text = re.sub(r'\b\d{10}\b|\b\d{3}[-.]?\d{3}[-.]?\d{4}\b', '[PHONE_REDACTED]', text)
    # Remove common Name indicators but keep skills (simple version)
    lines = text.split('\n')
    if lines:
        lines[0] = "[CANDIDATE_NAME_REDACTED]" # Usually name is on first line
    return '\n'.join(lines)

def extract_text(file_path):
    ext = file_path.rsplit('.', 1)[1].lower()
    text = ""
    try:
        if ext == 'pdf':
            with open(file_path, 'rb') as f:
                reader = PyPDF2.PdfReader(f)
                for page in reader.pages:
                    text += page.extract_text() or ""
        elif ext in ['doc', 'docx']:
            doc = docx.Document(file_path)
            text = "\n".join([para.text for para in doc.paragraphs])
        else:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                text = f.read()
    except Exception as e:
        logger.error(f"Error extracting text from {file_path}: {str(e)}")
        return ""
    return text

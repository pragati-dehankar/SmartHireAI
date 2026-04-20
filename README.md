# SmartHire AI

SmartHire AI is a specialized recruitment platform that uses BERT-based AI to score resumes, detect bias, and provide fairness analytics.

---

## 🚀 Getting Started

Follow these steps to set up and run the project locally.

### 📋 Prerequisites in your computer
- **Python**: 3.9 (Stable version recommended)
- **Node.js**: 18.x or higher
- **PostgreSQL**: Installed and running

---

## 🛠️ Backend Setup (Flask)

1. **Navigate to the backend directory**:
   ```interminal
   cd backend
   ```

2. **Create a Virtual Environment (Python 3.9)**:
   ```in terminal
   py -3.9 -m venv .venv
   ```

3. **Activate the Virtual Environment**:
   ```in terminal
   .\.venv\Scripts\Activate.ps1
   ```

4. **Upgrade Pip**:
   ```in terminal
   python -m pip install --upgrade pip
   ```

5. **Install Dependencies**:
   ```in terminal
   pip install -r requirements.txt
   ```
   *Note: We manually ensured `PyPDF2` and `python-docx` are installed.*

6. **Configure Environment Variables**:
   Create or edit the `.env` file in the `backend` folder with your credentials:
   ```env
   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/smart_hire_ai
   SECRET_KEY=your_secret_key
   JWT_SECRET=your_jwt_secret
   ```

7. **Initialize the Database**:
   Run this command one time to create the necessary tables:
   ```in terminal
   python -c "from app import app; from models.database import db; app.app_context().push(); db.create_all(); print('tables created')"
   ```

8. **Start the Backend Server**:
   ```in terminal
   python app.py
   ```
   The backend will run on `http://127.0.0.1:5000`.

---

## 💻 Frontend Setup (React + Vite)

1. **Navigate to the frontend directory**:
   ```in terminal
   cd frontend
   ```

2. **Install Dependencies**:
   ```in terminal
   npm install
   ```

3. **Start the Frontend Server**:
   ```in terminal
   npm run dev
   ```
   The frontend will run on `http://localhost:5173`.

---

## ⚙️ Troubleshooting Tips
- **Python Version**: Avoid using Python 3.14+ as some binary packages like `psycopg2` may not have pre-built wheels yet.
- **Database Connection**: Ensure your PostgreSQL server is running and the database `smart_hire_ai` exists before running the initialization script.
- **Port Conflicts**: If port 5000 is occupied, you can change the `PORT` in the `.env` file.

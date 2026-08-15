# Online Job Portal System

AI-powered full-stack job portal using FastAPI + React + PostgreSQL + Scikit-learn.

## Quick Start

### Backend
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # fill in DB creds + SECRET_KEY
# Create tables:
python -c "
from app.core.database import Base, engine
from app.module.users.models import User, RefreshToken, PasswordResetToken
from app.module.companies.models import Company
from app.module.jobs.models import Job
from app.module.applications.models import Application, SavedJob
from app.module.resumes.models import Resume
Base.metadata.create_all(bind=engine)
print('All tables created successfully')
"
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

- Frontend: http://localhost:5173  
- Backend API: http://localhost:8000  
- API Docs: http://localhost:8000/docs

## Architecture

```
backend/
  app/
    core/           config, database, security, dependencies, middleware
    module/
      auth/         JWT auth, refresh tokens, password reset
      users/        user profiles, role management
      companies/    employer company profiles
      jobs/         job CRUD, search, filters, pagination
      applications/ apply, save jobs, status tracking
      resumes/      file upload, PDF text extraction, skill parsing
      ai_engine/    TF-IDF, cosine similarity, KNN recommendations

frontend/
  src/
    services/       axios API clients (authService, jobService, etc.)
    context/        AuthContext (JWT session), JobContext (search state)
    routes/         ProtectedRoute, role-based guards
    components/     Navbar, Footer, JobCard, Loader, Toast
    pages/
      auth/         Login, Register, ForgotPassword, ResetPassword
      home/         Home, About, Contact, 404
      jobs/         JobListing (search/filter/paginate), JobDetails
      jobseeker/    Dashboard, Profile, ResumeUpload, Applications,
                    SavedJobs, Recommendations
      employer/     Dashboard, PostJob, ManageJobs, Applicants,
                    CompanyProfile
      admin/        Dashboard, Users, Jobs, Companies, Reports
```

## AI Recommendation System

The recommendation engine uses a pipeline of three algorithms:

1. **Skill Extraction** — regex word-boundary matching against a 50+ skill taxonomy
2. **TF-IDF** — vectorizes job descriptions + resume text into a shared vocabulary matrix
3. **Cosine Similarity** — computes similarity between candidate profile and each job vector
4. **KNN** — finds the K nearest jobs to the candidate's profile vector

All three are fit on the **same corpus per request** (candidate profile + all open jobs),
so vectors share vocabulary and scores are directly comparable.

Evaluation metrics (Precision@K, Recall@K, F1, MAP) are in `ai_engine/evaluation.py`
for offline testing.

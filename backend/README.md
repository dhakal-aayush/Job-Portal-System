# Job Portal Backend

## Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # Edit .env with your DB credentials and secret key
```

## Database

```bash
# Create PostgreSQL database
createdb job_portaldb

# Run migrations (after alembic init)
alembic upgrade head

# Or for development - auto-create tables:
python -c "from app.core.database import Base, engine; from app.module.users.models import *; from app.module.companies.models import *; from app.module.jobs.models import *; from app.module.applications.models import *; from app.module.resumes.models import *; Base.metadata.create_all(bind=engine); print('Tables created')"
```

## Run

```bash
uvicorn app.main:app --reload
# API: http://127.0.0.1:8000
# Docs: http://127.0.0.1:8000/docs
```

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /auth/signup | Register | Public |
| POST | /auth/login | Login (returns tokens) | Public |
| POST | /auth/refresh | Refresh access token | Public |
| POST | /auth/logout | Logout (revokes refresh token) | Bearer |
| GET | /auth/profile | Get current user | Bearer |
| POST | /auth/forgot-password | Request password reset | Public |
| POST | /auth/reset-password | Reset password | Public |
| GET | /jobs/ | List/search jobs | Public |
| GET | /jobs/{id} | Job details | Public |
| POST | /jobs/ | Create job | Employer |
| PUT | /jobs/{id} | Update job | Employer |
| DELETE | /jobs/{id} | Delete job | Employer/Admin |
| GET | /jobs/employer/mine | My posted jobs | Employer |
| POST | /applications/ | Apply to job | Job Seeker |
| GET | /applications/me | My applications | Bearer |
| GET | /applications/job/{id} | Job applicants | Employer |
| PATCH | /applications/{id}/status | Update status | Employer |
| POST | /applications/saved | Save job | Job Seeker |
| GET | /applications/saved | Saved jobs | Bearer |
| DELETE | /applications/saved/{id} | Unsave job | Job Seeker |
| POST | /resumes/ | Upload resume | Job Seeker |
| GET | /resumes/ | My resumes | Bearer |
| DELETE | /resumes/{id} | Delete resume | Bearer |
| GET | /companies/ | List companies | Public |
| GET | /companies/me | My company | Employer |
| PUT | /companies/{id} | Update company | Employer/Admin |
| GET | /users/me | My profile | Bearer |
| PUT | /users/me | Update profile | Bearer |
| GET | /users/ | All users | Admin |
| PUT | /users/{id} | Update user | Admin |
| DELETE | /users/{id} | Delete user | Admin |
| GET | /ai/recommendations | AI job recommendations | Job Seeker |
| POST | /ai/match/{job_id} | Match resume to job | Public |
| POST | /ai/skills | Extract skills | Public |
| GET | /ai/jobs/{id}/candidates | AI-ranked candidates | Employer |
| GET | /ai/analytics | Recommendation analytics | Admin |

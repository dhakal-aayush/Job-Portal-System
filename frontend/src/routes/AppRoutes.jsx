import { Routes, Route } from "react-router-dom";

// Home Pages
import Home from "../pages/home/Home";
import About from "../pages/home/About";
import Contact from "../pages/home/Contact";
import NotFound from "../pages/home/NotFound";

// Auth Pages
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";

// Job Pages
import JobListing from "../pages/jobs/JobListing";
import JobDetails from "../pages/jobs/JobDetails";

// Role-based route guards
import JobSeekerRoute from "./JobSeekerRoute";
import EmployerRoute from "./EmployerRoute";
import AdminRoute from "./AdminRoute";

// Job Seeker Pages
import Dashboard from "../pages/jobseeker/Dashboard";
import Profile from "../pages/jobseeker/Profile";
import ResumeUpload from "../pages/jobseeker/ResumeUpload";
import Applications from "../pages/jobseeker/Applications";
import SavedJobs from "../pages/jobseeker/SavedJobs";
import Recommendations from "../pages/jobseeker/Recommendations";

// Employer pages
import EmployerDashboard from "../pages/employer/Dashboard";
import PostJob from "../pages/employer/PostJob";
import ManageJobs from "../pages/employer/ManageJobs";
import Applicants from "../pages/employer/Applicants";
import CompanyProfile from "../pages/employer/CompanyProfile";

// Admin pages
import AdminDashboard from "../pages/admin/Dashboard";
import Users from "../pages/admin/Users";
import Jobs from "../pages/admin/Jobs";
import Companies from "../pages/admin/Companies";
import Reports from "../pages/admin/Reports";

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Public Job Routes */}
      <Route path="/jobs" element={<JobListing />} />
      <Route path="/jobs/:id" element={<JobDetails />} />

      {/* ========================= */}
      {/* JOB SEEKER ROUTES */}
      {/* ========================= */}
      <Route
        path="/dashboard"
        element={
          <JobSeekerRoute>
            <Dashboard />
          </JobSeekerRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <JobSeekerRoute>
            <Profile />
          </JobSeekerRoute>
        }
      />

      <Route
        path="/resume"
        element={
          <JobSeekerRoute>
            <ResumeUpload />
          </JobSeekerRoute>
        }
      />

      <Route
        path="/applications"
        element={
          <JobSeekerRoute>
            <Applications />
          </JobSeekerRoute>
        }
      />

      <Route
        path="/saved-jobs"
        element={
          <JobSeekerRoute>
            <SavedJobs />
          </JobSeekerRoute>
        }
      />

      <Route
        path="/recommendations"
        element={
          <JobSeekerRoute>
            <Recommendations />
          </JobSeekerRoute>
        }
      />

      {/* ========================= */}
      {/* EMPLOYER ROUTES */}
      {/* ========================= */}
      <Route
        path="/employer-dashboard"
        element={
          <EmployerRoute>
            <EmployerDashboard />
          </EmployerRoute>
        }
      />

      <Route
        path="/post-job"
        element={
          <EmployerRoute>
            <PostJob />
          </EmployerRoute>
        }
      />

      <Route
        path="/manage-jobs"
        element={
          <EmployerRoute>
            <ManageJobs />
          </EmployerRoute>
        }
      />

      <Route
        path="/applicants/:jobId"
        element={
          <EmployerRoute>
            <Applicants />
          </EmployerRoute>
        }
      />

      <Route
        path="/company-profile"
        element={
          <EmployerRoute>
            <CompanyProfile />
          </EmployerRoute>
        }
      />

      {/* ========================= */}
      {/* ADMIN ROUTES */}
      {/* ========================= */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />

      <Route
        path="/admin/users"
        element={
          <AdminRoute>
            <Users />
          </AdminRoute>
        }
      />

      <Route
        path="/admin/jobs"
        element={
          <AdminRoute>
            <Jobs />
          </AdminRoute>
        }
      />

      <Route
        path="/admin/companies"
        element={
          <AdminRoute>
            <Companies />
          </AdminRoute>
        }
      />

      <Route
        path="/admin/reports"
        element={
          <AdminRoute>
            <Reports />
          </AdminRoute>
        }
      />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRoutes;

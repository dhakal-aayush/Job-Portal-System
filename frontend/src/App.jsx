import AppRoutes from "./routes/AppRoutes";
import AuthProvider from "./context/AuthContext";
import JobProvider from "./context/JobContext";
import { ToastProvider } from "./components/common/Toast";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <JobProvider>
          <div className="app-shell">
            <Navbar />
            <main className="app-main">
              <AppRoutes />
            </main>
            <Footer />
          </div>
        </JobProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;

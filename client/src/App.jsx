import "./App.css";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ErrorBoundary from "./components/ErrorBoundary";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import Login from "./pages/Login";
import Careers from "./pages/Careers";
import Contact from "./pages/Contact";
import NextGenLanding from "./pages/NextGenFreeEdu/Landing";
import Enrollment from "./pages/NextGenFreeEdu/Enrollment";
import PaymentCheckout from "./pages/NextGenFreeEdu/PaymentCheckout";
import StudentLogin from "./pages/NextGenFreeEdu/Login";
import SetPassword from "./pages/NextGenFreeEdu/SetPassword";
import StudentProfile from "./pages/NextGenFreeEdu/StudentProfile";
import Exam from "./pages/NextGenFreeEdu/Exam";
import Results from "./pages/NextGenFreeEdu/Results";
import AdminPortal from "./pages/Portal/AdminPortal";
import HRPortal from "./pages/Portal/HRPortal";
import TeamLeadPortal from "./pages/Portal/TeamLeadPortal";
import ManagerPortal from "./pages/Portal/ManagerPortal";
import EmployeePortal from "./pages/Portal/EmployeePortal";
import CourseManagerPortal from "./pages/Portal/CourseManagerPortal";
import TestConnection from "./pages/TestConnection";
import PrivacyPolicy from "./pages/NextGenFreeEdu/PrivacyPolicy";

function MainLayout() {
  return (
    <div
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

function NextGenLayout() {
  return (
    <div
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <header
        style={{
          padding: "1rem",
          background: "linear-gradient(135deg, #fef3c7, #fde68a)",
          borderBottom: "2px solid #f59e0b",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}>
        <div className="container">
          <h1
            style={{
              margin: 0,
              fontSize: "1.5rem",
              fontWeight: "700",
              color: "#92400e",
            }}>
            NextGenFreeEdu
          </h1>
        </div>
      </header>
      <main style={{ flex: 1, padding: "2rem 0" }}>
        <Outlet />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}>
        <AuthProvider>
          <Routes>
            <Route element={<MainLayout />}>
              <Route index element={<Home />} />
              <Route path="about" element={<About />} />
              <Route path="services" element={<Services />} />
              <Route path="careers" element={<Careers />} />
              <Route path="contact" element={<Contact />} />
            </Route>
            <Route path="login" element={<Login />} />
            <Route path="nextgen" element={<NextGenLayout />}>
              <Route index element={<NextGenLanding />} />
              <Route path="enroll" element={<Enrollment />} />
              <Route path="payment/checkout" element={<PaymentCheckout />} />
              <Route path="login" element={<StudentLogin />} />
              <Route path="set-password" element={<SetPassword />} />
              <Route path="profile" element={<StudentProfile />} />
              <Route path="exam" element={<Exam />} />
              <Route path="results" element={<Results />} />
              <Route path="privacy-policy" element={<PrivacyPolicy />} />
            </Route>
            <Route path="portal/admin" element={<AdminPortal />} />
            <Route path="portal/hr" element={<HRPortal />} />
            <Route path="portal/team-lead" element={<TeamLeadPortal />} />
            <Route path="portal/manager" element={<ManagerPortal />} />
            <Route path="portal/employee" element={<EmployeePortal />} />
            <Route
              path="portal/coursemanager"
              element={<CourseManagerPortal />}
            />
            <Route path="test" element={<TestConnection />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

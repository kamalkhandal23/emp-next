// src/App.jsx
import './App.css';
import React, { useEffect } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Outlet,
  useLocation,
  useNavigate,
} from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Login from './pages/Login';
import Careers from './pages/Careers';
import Contact from './pages/Contact';

import NextGenLanding from './pages/NextGenFreeEdu/Landing';
import Enrollment from './pages/NextGenFreeEdu/Enrollment';
import PaymentCheckout from './pages/NextGenFreeEdu/PaymentCheckout';
import StudentLogin from './pages/NextGenFreeEdu/Login';
import SetPassword from './pages/NextGenFreeEdu/SetPassword';
import StudentProfile from './pages/NextGenFreeEdu/StudentProfile';
import Exam from './pages/NextGenFreeEdu/Exam';
import Results from './pages/NextGenFreeEdu/Results';
import PrivacyPolicy from './pages/NextGenFreeEdu/PrivacyPolicy';

import StudentAssignments from './pages/NextGenFreeEdu/StudentAssignments';
import AssignmentDetails from './pages/NextGenFreeEdu/AssignmentDetails';
import StudentExams from './pages/NextGenFreeEdu/StudentExams';

import AdminPortal from './pages/Portal/AdminPortal';
import HRPortal from './pages/Portal/HRPortal';
import TeamLeadPortal from './pages/Portal/TeamLeadPortal';
import ManagerPortal from './pages/Portal/ManagerPortal';
import EmployeePortal from './pages/Portal/EmployeePortal';
import CourseManagerPortal from './pages/Portal/CourseManagerPortal';

import TestConnection from './pages/TestConnection';
import CreateExam from './pages/NextGenFreeEdu/CreateExam';
import CreateAssignment from './pages/NextGenFreeEdu/CreateAssignment';
import ManageExams from './pages/NextGenFreeEdu/ManageExams';
import ManageAssignments from './pages/NextGenFreeEdu/ManageAssignments';
import CreateCodingExam from './pages/NextGenFreeEdu/CreateCodingExam';
import ManageCodingExams from './pages/NextGenFreeEdu/ManageCodingExams';

import SubmitAssignment from './pages/NextGenFreeEdu/SubmitAssignment';

import GradeAssignments from './pages/NextGenFreeEdu/GradeAssignments';
import GradeExams from './pages/NextGenFreeEdu/GradeExams';
import CodingExamsList from './pages/NextGenFreeEdu/CodingExamsList';
import CodingExam from './pages/NextGenFreeEdu/CodingExam';

function MainLayout() {
  return (
    <div
      style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
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
      style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header
        style={{
          padding: '1rem',
          background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
          borderBottom: '2px solid #f59e0b',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}>
        <div className='container'>
          <h1
            style={{
              margin: 0,
              fontSize: '1.5rem',
              fontWeight: '700',
              color: '#92400e',
            }}>
            NextGenFreeEdu
          </h1>
        </div>
      </header>
      <main style={{ flex: 1, padding: '2rem 0' }}>
        <Outlet />
      </main>
    </div>
  );
}

// Yahi component saare routes + redirect logic handle karega
function AppRoutes() {
  const hostname = window.location.hostname;
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Dynamic tab titles
    if (hostname === 'nextgenfreedu.site') {
      document.title = 'Welcome to NextGenFreeEdu';
    } else {
      document.title = 'Welcome to Lifebox NextGen Pvt. Ltd.';
    }

    // lifeboxnextgen.co.site/nextgen -> redirect to nextgenfreedu.site
    if (
      hostname === 'lifeboxnextgen.co.site' &&
      location.pathname === '/nextgen'
    ) {
      window.location.replace('https://nextgenfreedu.site');
    }

    // if on nextgenfreedu.site root, redirect to /nextgen
    if (hostname === 'nextgenfreedu.site' && location.pathname === '/') {
      navigate('/nextgen', { replace: true });
    }
  }, [hostname, location.pathname, navigate]);

  return (
    <Routes>
      {/* Main site */}
      <Route element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path='about' element={<About />} />
        <Route path='services' element={<Services />} />
        <Route path='careers' element={<Careers />} />
        <Route path='contact' element={<Contact />} />
      </Route>

      <Route path='login' element={<Login />} />

      {/* NextGen student side */}
      <Route path='nextgen' element={<NextGenLayout />}>
        <Route index element={<NextGenLanding />} />
        <Route path='enroll' element={<Enrollment />} />
        <Route path='payment/checkout' element={<PaymentCheckout />} />
        <Route path='login' element={<StudentLogin />} />
        <Route path='set-password' element={<SetPassword />} />
        <Route path='profile' element={<StudentProfile />} />
        <Route path='exam' element={<Exam />} />
        <Route path='exams' element={<StudentExams />} />
        {/* ✅ yahi important */}
        <Route path='results' element={<Results />} />
        <Route path='coding-exams' element={<CodingExamsList />} />
        <Route path='coding-exam/:id' element={<CodingExam />} />
        <Route path='assignments' element={<StudentAssignments />} />
        <Route
          path='assignments/:assignmentId'
          element={<AssignmentDetails />}
        />
        <Route
          path='assignments/:assignmentId/submit'
          element={<SubmitAssignment />}
        />
        <Route path='privacy-policy' element={<PrivacyPolicy />} />
      </Route>

      {/* Portals */}
      <Route path='portal/admin' element={<AdminPortal />} />
      <Route path='portal/hr' element={<HRPortal />} />
      <Route path='portal/team-lead' element={<TeamLeadPortal />} />
      <Route path='portal/manager' element={<ManagerPortal />} />
      <Route path='portal/employee' element={<EmployeePortal />} />
      <Route path='portal/coursemanager' element={<CourseManagerPortal />} />
      <Route path='portal/coursemanager/createexam' element={<CreateExam />} />
      <Route
        path='portal/coursemanager/createassignment'
        element={<CreateAssignment />}
      />
      <Route
        path='portal/coursemanager/manageexams'
        element={<ManageExams />}
      />
      <Route
        path='portal/coursemanager/createcodingexam'
        element={<CreateCodingExam />}
      />
      <Route
        path='portal/coursemanager/managecodingexams'
        element={<ManageCodingExams />}
      />
      <Route
        path='portal/coursemanager/manageassignments'
        element={<ManageAssignments />}
      />

      <Route path='test' element={<TestConnection />} />
    </Routes>
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
              <Route path='about' element={<About />} />
              <Route path='services' element={<Services />} />
              <Route path='careers' element={<Careers />} />
              <Route path='contact' element={<Contact />} />
            </Route>
            <Route path='login' element={<Login />} />
            <Route path='nextgen' element={<NextGenLayout />}>
              <Route index element={<NextGenLanding />} />
              <Route path='enroll' element={<Enrollment />} />
              <Route path='payment/checkout' element={<PaymentCheckout />} />
              <Route path='login' element={<StudentLogin />} />
              <Route path='set-password' element={<SetPassword />} />
              <Route path='profile' element={<StudentProfile />} />
              <Route path='exam' element={<Exam />} />
              <Route path='exams' element={<StudentExams />} />
              <Route path='results' element={<Results />} />
              <Route path='coding-exams' element={<CodingExamsList />} />
              <Route path='coding-exam/:id' element={<CodingExam />} />
              <Route path='assignments' element={<StudentAssignments />} />
              <Route
                path='assignments/:assignmentId'
                element={<AssignmentDetails />}
              />
              <Route
                path='assignments/:assignmentId/submit'
                element={<SubmitAssignment />}
              />
              <Route path='privacy-policy' element={<PrivacyPolicy />} />
            </Route>
            <Route path='portal/admin' element={<AdminPortal />} />
            <Route path='portal/hr' element={<HRPortal />} />
            <Route path='portal/team-lead' element={<TeamLeadPortal />} />
            <Route path='portal/manager' element={<ManagerPortal />} />
            <Route path='portal/employee' element={<EmployeePortal />} />
            <Route
              path='portal/coursemanager'
              element={<CourseManagerPortal />}
            />
            <Route
              path='/portal/coursemanager/createexam'
              element={<CreateExam />}
            />
            <Route
              path='/portal/coursemanager/createassignment'
              element={<CreateAssignment />}
            />
            <Route
              path='/portal/coursemanager/manageexams'
              element={<ManageExams />}
            />
            <Route
              path='/portal/coursemanager/createcodingexam'
               element={<CreateCodingExam />}
            />
            <Route
              path='/portal/coursemanager/managecodingexams'
              element={<ManageCodingExams />}
            />
            <Route
              path='/portal/coursemanager/manageassignments'
              element={<ManageAssignments />}
            />
            <Route
              path='/portal/coursemanager/gradeassignments'
              element={<GradeAssignments />}
            />
            <Route
              path='/portal/coursemanager/gradeexams'
              element={<GradeExams />}
            />
            <Route path='test' element={<TestConnection />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

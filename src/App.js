import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ReactKeycloakProvider } from '@react-keycloak/web';
import keycloak from './config/keycloak';
import { AuthProvider } from './contexts/AuthContext';
import { ProjectProvider } from './contexts/ProjectContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminRoute from './components/common/AdminRoute';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import ProjectDashboard from './components/projects/ProjectDashboard';
import ProjectDetail from './components/projects/ProjectDetail';
import CreateProject from './components/projects/CreateProject';
import QuickAssessment from './components/assessments/QuickAssessment';
import DeepAssessment from './components/assessments/DeepAssessment';
import AssessmentHistory from './components/assessments/AssessmentHistory';
import AdminPanel from './components/admin/AdminPanel';
import UserManagement from './components/admin/UserManagement';
import QuestionManagement from './components/admin/QuestionManagement';
import CategoryManagement from './components/admin/CategoryManagement';
import Reports from './components/reports/Reports';
import Profile from './components/Profile';
import NotFound from './components/common/NotFound';
import LoadingSpinner from './components/common/LoadingSpinner';
import './App.css';

const App = () => {
  return (
    <ReactKeycloakProvider 
      authClient={keycloak}
      LoadingComponent={<LoadingSpinner />}
    >
      <AuthProvider>
        <ProjectProvider>
          <Router>
            <div className="App">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected Routes */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />

                {/* Project Routes */}
                <Route path="/projects" element={
                  <ProtectedRoute>
                    <ProjectDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/projects/create" element={
                  <ProtectedRoute>
                    <CreateProject />
                  </ProtectedRoute>
                } />
                <Route path="/projects/:id" element={
                  <ProtectedRoute>
                    <ProjectDetail />
                  </ProtectedRoute>
                } />

                {/* Assessment Routes */}
                <Route path="/assessments/quick/:projectId" element={
                  <ProtectedRoute>
                    <QuickAssessment />
                  </ProtectedRoute>
                } />
                <Route path="/assessments/deep/:projectId" element={
                  <ProtectedRoute>
                    <DeepAssessment />
                  </ProtectedRoute>
                } />
                <Route path="/assessments/history" element={
                  <ProtectedRoute>
                    <AssessmentHistory />
                  </ProtectedRoute>
                } />

                {/* Reports */}
                <Route path="/reports" element={
                  <ProtectedRoute>
                    <Reports />
                  </ProtectedRoute>
                } />

                {/* Profile */}
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />

                {/* Admin Routes */}
                <Route path="/admin" element={
                  <AdminRoute>
                    <AdminPanel />
                  </AdminRoute>
                } />
                <Route path="/admin/users" element={
                  <AdminRoute>
                    <UserManagement />
                  </AdminRoute>
                } />
                <Route path="/admin/questions" element={
                  <AdminRoute>
                    <QuestionManagement />
                  </AdminRoute>
                } />
                <Route path="/admin/categories" element={
                  <AdminRoute>
                    <CategoryManagement />
                  </AdminRoute>
                } />

                {/* 404 Route */}
                <Route path="/404" element={<NotFound />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
              </Routes>
            </div>
          </Router>
        </ProjectProvider>
      </AuthProvider>
    </ReactKeycloakProvider>
  );
};

export default App;
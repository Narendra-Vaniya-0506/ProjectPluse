import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider, useDispatch } from 'react-redux';
import { store } from './store/index';
import { initializeAuth } from './store/slices/authSlice';
import Login from './pages/Login';
import SignIn from './pages/SignIn';
import Home from './pages/Home';
import Developer from './pages/Developer';
import './App.css';
import ChooseYourRole from './pages/ChooseYourRole';
import AdminDashboard from './pages/AdminDashboard';
import ProjectManagerDashboard from './pages/ProjectManagerDashboard';
import TeamMemberDashboard from './pages/TeamMemberDashboard';
import ChatWindow from './pages/ChatWindow';
import Cards from './pages/Cards';
import ProtectedRoute from './components/ProtectedRoute';

function AppContent() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/choose-role" element={<ChooseYourRole />} />
          <Route path="/developer" element={<Developer />} />
          <Route path="/admin" element={<ProtectedRoute requiredRole="Admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/pm-dashboard" element={<ProtectedRoute requiredRole="Project Manager"><ProjectManagerDashboard /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute requiredRole="Team Member"><TeamMemberDashboard /></ProtectedRoute>} />
          <Route path="/chat/:projectId" element={<ProtectedRoute><ChatWindow /></ProtectedRoute>} />
          <Route path="/cards/:projectId" element={<ProtectedRoute><Cards /></ProtectedRoute>} />
        </Routes>
      </div>
    </Router>
  );
}

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;

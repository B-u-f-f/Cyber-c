import React, { useState, useEffect, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import SpeechRecognition from './components/SpeechRecognition';
import ChatAssistant from './components/ChatAssistant';
import ClientManagement from './components/ClientManagement';
import PropertyList from './components/PropertyList';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { checkServerConnection, API_BASE_URL } from './utils/api';
import './App.css';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);

  // Show loading indicator while checking auth status
  if (loading) {
    return <div className="loading-container">Authenticating...</div>;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function AppContent() {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [serverStatus, setServerStatus] = useState({ checked: false, running: false });
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  
  useEffect(() => {
    // Check if server is running
    const checkServer = async () => {
      const isRunning = await checkServerConnection();
      setServerStatus({ checked: true, running: isRunning });
    };
    
    checkServer();
    
    // Periodically check server status
    const interval = setInterval(checkServer, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="app-container">
      {serverStatus.checked && !serverStatus.running && (
        <div className="server-status-alert">
          <p>
            <strong>Warning:</strong> Backend server is not running or not accessible at {API_BASE_URL}.
            Authentication, client management, chat and translation features will not work.
          </p>
        </div>
      )}
      
      <header className="app-header">
        <div className="logo-container">
          <img src="/logo192.png" alt="Real Estate Assistant Logo" className="app-logo" />
          <h1>Real Estate Communication Assistant</h1>
        </div>
        
        <nav className="main-nav">
          <Link to="/" className="nav-link">Dashboard</Link>
          <Link to="/speech" className="nav-link">Speech Recognition</Link>
          <Link to="/chat" className="nav-link">Chat Assistant</Link>
          <Link to="/clients" className="nav-link">Client Management</Link>
          <Link to="/properties" className="nav-link">Property Listings</Link>
        </nav>
        
        <div className="user-controls">
          <div className="language-selector">
            <select 
              value={currentLanguage} 
              onChange={(e) => setCurrentLanguage(e.target.value)}
              className="language-dropdown"
            >
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="mr">Marathi</option>
              <option value="te">Telugu</option>
            </select>
          </div>
          
          {isAuthenticated ? (
            <div className="user-menu">
              <span className="user-greeting">Hello, {user?.name}</span>
              <button onClick={logout} className="logout-btn">Logout</button>
            </div>
          ) : (
            <div className="auth-links">
              <Link to="/login" className="auth-link">Login</Link>
              <Link to="/register" className="auth-link">Register</Link>
            </div>
          )}
        </div>
      </header>
      
      <main className="app-content">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard currentLanguage={currentLanguage} />
            </ProtectedRoute>
          } />
          <Route path="/speech" element={
            <ProtectedRoute>
              <SpeechRecognition currentLanguage={currentLanguage} />
            </ProtectedRoute>
          } />
          <Route path="/chat" element={
            <ProtectedRoute>
              <ChatAssistant currentLanguage={currentLanguage} />
            </ProtectedRoute>
          } />
          <Route path="/clients" element={
            <ProtectedRoute>
              <ClientManagement currentLanguage={currentLanguage} />
            </ProtectedRoute>
          } />
          <Route path="/properties" element={
            <ProtectedRoute>
              <PropertyList />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
      
      <footer className="app-footer">
        <p>&copy; 2025 Real Estate Communication Assistant</p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
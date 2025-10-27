import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import SignUp from './pages/SignUp';
import SignIn from './pages/SignIn';
import Dashboard from './pages/Dashboard';
import Posts from './pages/Posts';
import CalendarPage from './pages/CalendarPage';
import Admin from './pages/Admin';

// Provide authentication and theme state throughout the app
function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [role, setRole] = useState(localStorage.getItem('role') || null);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const navigate = useNavigate();

  useEffect(() => {
    document.body.dataset.theme = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleSignIn = (jwt, userRole) => {
    setToken(jwt);
    setRole(userRole);
    localStorage.setItem('token', jwt);
    localStorage.setItem('role', userRole);
    navigate('/dashboard');
  };

  const handleSignOut = () => {
    setToken(null);
    setRole(null);
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/signin');
  };

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  // Set default authorization header when token changes
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  return (
    <div className="app-container">
      {token && (
        <nav className="nav-bar">
          <Link to="/dashboard">Home</Link>
          <Link to="/posts">Posts</Link>
          <Link to="/calendar">Calendar</Link>
          {role === 'admin' && <Link to="/admin">Admin</Link>}
          <button onClick={toggleTheme}>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</button>
          <button onClick={handleSignOut}>Sign Out</button>
        </nav>
      )}
      <Routes>
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn onSignIn={handleSignIn} />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/posts" element={<Posts />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/admin" element={<Admin />} />
        {/* Default route */}
        <Route path="*" element={token ? <Dashboard /> : <SignIn onSignIn={handleSignIn} />} />
      </Routes>
    </div>
  );
}

export default App;

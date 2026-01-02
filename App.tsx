import React, { useState, useEffect, useCallback } from 'react';
import Dashboard from './components/dashboard/Dashboard';
import AuthPage from './components/auth/AuthPage';
import { User } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  // Simple test to see if app loads
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Add a small delay to see if there are any loading issues
    const timer = setTimeout(() => {
      setIsLoading(false);
      const storedUser = localStorage.getItem('happy_session');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          localStorage.removeItem('happy_session');
        }
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const handleLogin = useCallback((loggedInUser: User) => {
    // Create a session for the logged-in user
    localStorage.setItem('happy_session', JSON.stringify(loggedInUser));
    setUser(loggedInUser);
  }, []);

  const handleSignup = useCallback((signedUpUser: User) => {
    // Simulate a user database in localStorage, keyed by email
    const users = JSON.parse(localStorage.getItem('happy_users') || '{}');
    users[signedUpUser.email] = signedUpUser;
    localStorage.setItem('happy_users', JSON.stringify(users));
    
    // Don't automatically log in - switch to login mode instead
    setAuthMode('login');
    // You could add a success message here if needed
  }, []);

  const handleLogout = useCallback(() => {
    // Only remove the session, not the user account
    localStorage.removeItem('happy_session');
    setUser(null);
    setAuthMode('login');
  }, []);
  
  const switchAuthMode = useCallback((mode: 'login' | 'signup') => {
    setAuthMode(mode);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-200 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p>Loading ThriveSense...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200">
      {user ? (
        <Dashboard user={user} onLogout={handleLogout} />
      ) : (
        <AuthPage 
            mode={authMode}
            onLogin={handleLogin} 
            onSignup={handleSignup}
            switchMode={switchAuthMode}
        />
      )}
    </div>
  );
};

export default App;
import React, { useState } from 'react';
import { User } from '../../types';

interface LoginProps {
  onLogin: (user: User) => void;
  onSwitchToSignup: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onSwitchToSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Add a small delay to show loading state
    setTimeout(() => {
      // Look for the user in our simulated database (using correct key)
      const users = JSON.parse(localStorage.getItem('happy_users') || '{}');
      const foundUser = users[email];

      if (!foundUser) {
        setError('No account found with that email. Please sign up.');
        setIsLoading(false);
        return;
      }

      if (foundUser.password !== password) {
        setError('Incorrect password. Please try again.');
        setIsLoading(false);
        return;
      }

      // Login successful
      setIsLoading(false);
      onLogin(foundUser);
    }, 500);
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-center text-slate-100 mb-6">Welcome Back</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-300">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 block w-full px-4 py-3 bg-slate-700 text-slate-100 border border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-300">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 block w-full px-4 py-3 bg-slate-700 text-slate-100 border border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
            placeholder="••••••••"
          />
        </div>
        {error && <p className="text-sm text-center text-red-400">{error}</p>}
        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full bg-amber-500 text-slate-900 font-bold py-3 px-4 rounded-lg hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 shadow-lg transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-slate-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Logging in...
            </div>
          ) : (
            'Log In'
          )}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-400">
        Don't have an account?{' '}
        <button onClick={onSwitchToSignup} className="font-semibold text-amber-400 hover:text-amber-500">
          Sign up
        </button>
      </p>
    </div>
  );
};

export default Login;
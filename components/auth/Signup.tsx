import React, { useState } from 'react';
import { User } from '../../types';

interface SignupProps {
  onSignup: (user: User) => void;
  onSwitchToLogin: () => void;
}

const Signup: React.FC<SignupProps> = ({ onSignup, onSwitchToLogin }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState('');

  const passwordsMatch =
    password.length > 0 &&
    confirmPassword.length > 0 &&
    password === confirmPassword;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!passwordsMatch) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    // Check if user already exists
    const users = JSON.parse(localStorage.getItem('happy_users') || '{}');
    if (users[email]) {
      setError('An account with this email already exists. Please log in.');
      return;
    }

    // Create new user object
    const newUser: User = {
      username,
      email,
      password, 
    };

    onSignup(newUser);
  };

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-semibold text-center text-slate-100 mb-2">
        Create Your Account
      </h2>

      <p className="text-center text-slate-400 mb-6">
        Welcome to Creativity and Emotional Expression Platform!
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Username */}
        <div>
          <label htmlFor="username" className="text-sm text-slate-300">
            Username
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="mt-1 w-full px-4 py-3 bg-slate-700 text-white border border-slate-600 rounded-lg focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="text-sm text-slate-300">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 w-full px-4 py-3 bg-slate-700 text-white border border-slate-600 rounded-lg focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* Password */}
        <div className="relative">
          <label htmlFor="password" className="text-sm text-slate-300">
            Password
          </label>
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 w-full px-4 py-3 pr-12 bg-slate-700 text-white border border-slate-600 rounded-lg focus:ring-2 focus:ring-amber-500"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-9 text-slate-400"
          >
            {showPassword ? '🙈' : '👁️'}
          </button>
        </div>

        {/* Confirm Password */}
        <div className="relative">
          <label htmlFor="confirmPassword" className="text-sm text-slate-300">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="mt-1 w-full px-4 py-3 pr-12 bg-slate-700 text-white border border-slate-600 rounded-lg focus:ring-2 focus:ring-amber-500"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((v) => !v)}
            className="absolute right-3 top-9 text-slate-400"
          >
            {showConfirmPassword ? '🙈' : '👁️'}
          </button>
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-red-400 text-center">{error}</p>
        )}
        {confirmPassword && password !== confirmPassword && (
          <p className="text-sm text-red-400">
            Password and Confirm Password do not match
          </p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={!passwordsMatch}
          className="w-full bg-amber-500 disabled:opacity-50 text-slate-900 font-bold py-3 rounded-lg hover:bg-amber-600 transition"
        >
          Sign Up
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        Already have an account?{' '}
        <button
          onClick={onSwitchToLogin}
          className="text-amber-400 hover:text-amber-500 font-semibold"
        >
          Log in
        </button>
      </p>
    </div>
  );
};

export default Signup;

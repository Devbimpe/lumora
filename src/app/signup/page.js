"use client";
import { useState } from 'react';
import Image from 'next/image';
import './signup.css';

export default function Page() {
  const [form, setForm] = useState({
    name: '',
    userName: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  function validateEmail(email) {
    return /\S+@\S+\.\S+/.test(email);
  }

  function validatePassword(password) {
    // Password must be 8+ chars, with at least 1 uppercase, 1 lowercase, 1 number, 1 special char
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    // Frontend validation
    if (!form.name || !form.userName || !form.email || !form.password) {
      setError('All fields are required.');
      setIsLoading(false);
      return;
    }
    if (!validateEmail(form.email)) {
      setError('Invalid email format.');
      setIsLoading(false);
      return;
    }
    if (!validatePassword(form.password)) {
      setError(
        'Password must be at least 8 characters long and include an uppercase letter, lowercase letter, number, and special character (e.g., @$!%*?&).'
      );
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/users/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userName: form.userName,
        email: form.email,
        password: form.password,
        name: form.name
  }),
});

      if (res.ok) {
        setSuccess('Signup successful! You can now log in.');
        setForm({ name: '', userName: '', email: '', password: '' });
      } else {
        const data = await res.json();
        setError(data.error || 'Signup failed.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="logo">
        <Image
          src="/Lumoralogo.jpeg"
          alt="Lumora Logo"
          width={300}
          height={80}
        />
      </div>
      <h1>Welcome to Lumora</h1>
      <h2>Sign up to your account</h2>
      {error && (
        <p id="form-error" className="error" role="alert" aria-live="assertive">
          {error}
        </p>
      )}
      {success && (
        <p id="form-success" className="success" role="alert" aria-live="assertive">
          {success}
        </p>
      )}
      <div className="form-card">
        <form
          className="form"
          onSubmit={handleSubmit}
          aria-describedby={error ? 'form-error' : undefined}
        >
          <div className="input-group">
            <label htmlFor="name" className="label">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              placeholder="Enter your full name"
              className="input"
              value={form.name}
              onChange={handleChange}
              required
              aria-required="true"
            />
          </div>
          <div className="input-group">
            <label htmlFor="userName" className="label">
              Username
            </label>
            <input
              id="userName"
              type="text"
              placeholder="Enter your username"
              className="input"
              value={form.userName}
              onChange={handleChange}
              required
              aria-required="true"
            />
          </div>
          <div className="input-group">
            <label htmlFor="email" className="label">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              className="input"
              value={form.email}
              onChange={handleChange}
              required
              aria-required="true"
              aria-describedby={error && error.includes('email') ? 'form-error' : undefined}
            />
          </div>
          <div className="input-group">
            <label htmlFor="password" className="label">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              className="input"
              value={form.password}
              onChange={handleChange}
              required
              aria-required="true"
              aria-describedby={error && error.includes('Password') ? 'form-error' : undefined}
            />
          </div>
          <button
            type="submit"
            className="submit-button"
            disabled={isLoading}
            aria-busy={isLoading}
            aria-label={isLoading ? 'Signing up, please wait' : 'Sign up'}
          >
            {isLoading ? 'Signing up...' : 'Signup'}
          </button>
        </form>
      </div>
      <p className="password-requirements">
        Password must be at least 8 characters long and include an uppercase letter, lowercase letter, number, and special character (e.g., @$!%*?&).
      </p>
    </div>
  );
}
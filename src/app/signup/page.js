"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import '../globals.css';
import '../login/login.css';
import { toast } from 'react-toastify';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Page() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    userName: '',
    email: '',
    password: '',
    confirmPassword: '', // Added confirmPassword to state
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const notifySuccess = () => toast.success('Check your email — we’ve sent you an activation link to complete your registration.');

  // Check if user is already authenticated and redirect if so
  useEffect(() => {
    const checkAuthentication = async () => {
      try {      
        const response = await fetch("/api/check-auth");
        const data = await response.json();
        if (data.authenticated) {
          console.log("User is already authenticated, redirecting...");
          if(data.user.role === "Admin") {
            router.push("/admin");
          } else {
            router.push("/");
          }
        } else {
          console.log("User is not authenticated, showing signup form.");
          setCheckingAuth(false);
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
        setCheckingAuth(false);
      }
    };
    checkAuthentication();
  }, [router]);



  function validateEmail(email) {
    return /\S+@\S+\.\S+/.test(email);
  }

  function validatePassword(password) {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.id]: e.target.value });
    setError(''); // Clear error on input change to avoid stale messages
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    // Frontend validation
    if (!form.name || !form.userName || !form.email || !form.password || !form.confirmPassword) {
      setError('All fields are required.');
      setIsLoading(false);
      return;
    }
    if (!validateEmail(form.email)) {
      setError('Invalid email format.');
      setIsLoading(false);
      return;
    }
    // Prevent submission if password does not meet requirements
    if (!validatePassword(form.password)) {
      setError('Password does not meet requirements.');
      setIsLoading(false);
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
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
          name: form.name,
        }),
      });

      if (res.ok) {
        notifySuccess();
        setSuccess('Success!');
        setForm({ name: '', userName: '', email: '', password: '', confirmPassword: '' });
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

  // Show checking auth state
  if (checkingAuth) {
    return (
      <div className="page">
        <main className="w-full">
          <div className="LoginPage">
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mb-4"></div>
              <span className="text-gray-600 text-lg font-medium">Checking authentication...</span>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="page">
      <main className="w-full">
        <div className="LoginPage">
          <div className="login-header">
            <h1>Sign up to your account</h1>
            <p className="login-subtitle">Create your account to get started with Lumora.</p>
          </div>
          <div className="Maininfo">
            <form
              className="form"
              onSubmit={handleSubmit}
              aria-describedby={error ? 'form-error' : undefined}
            >
              <div className="info">
                <label htmlFor="name">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  aria-required="true"
                />
              </div>
              <div className="info">
                <label htmlFor="userName">
                  Username
                </label>
                <input
                  id="userName"
                  name="userName"
                  type="text"
                  placeholder="Enter your username"
                  value={form.userName}
                  onChange={handleChange}
                  required
                  aria-required="true"
                />
              </div>
              <div className="info">
                <label htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  aria-required="true"
                  aria-describedby={error && error.includes('email') ? 'form-error' : undefined}
                />
              </div>
              <div className="info">
                <label htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  aria-required="true"
                  aria-describedby={error && error.includes('Password') ? 'form-error' : undefined}
                />
                {!validatePassword(form.password) && form.password && (
                  <small style={{ color: "#dc2626" }}>
                    Password must be at least 8 characters long and include an uppercase letter, lowercase letter, number, and special character (e.g., @$!%*?&).
                  </small>
                )}
              </div>
              <div className="info">
                <label htmlFor="confirmPassword">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                  aria-required="true"
                  aria-describedby={error && error.includes('Passwords do not match') ? 'form-error' : undefined}
                />
              </div>
              <div className="button">
                <button
                  type="submit"
                  disabled={isLoading}
                  aria-busy={isLoading}
                  aria-label={isLoading ? 'Signing up, please wait' : 'Sign up'}
                >
                  {isLoading ? 'Signing up...' : 'Sign up'}
                </button>
              </div>
            </form>
            <div className="register_link">
              Already have an account? <a href="/login">Login</a>
            </div>
            <ToastContainer position="top-center" />
              {error && (
                <div className="error-message" id="form-error" role="alert" aria-live="assertive">
                  {error}
                </div>
              )}
              {success && (
                <div className="success-message" id="form-success" role="alert" aria-live="assertive">
                  {success}
                </div>
              )}
          </div>
        </div>
      </main>
    </div>
  );
}
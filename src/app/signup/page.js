"use client";
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/components/AuthProvider';
import { Turnstile } from '@/app/components/Turnstile';
import '../globals.css';
import '../login/login.css';
import { api } from '@/app/_lib/api-client';
import { validatePasswordPolicy } from '@/app/_lib/auth-helper';
import { toast } from 'react-toastify';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Page() {
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
  const [isDisabled, setDisabled] = useState(false);
  const turnstile = useRef(null);
  const token = useRef(null);

  const router = useRouter();
  const { user: currentUser, loading: checkingAuth } = useAuth();
  const notifySuccess = () => toast.success('Check your email — we’ve sent you an activation link to complete your registration.');

  // Check if user is already authenticated and redirect if so
  useEffect(() => {
    if (!checkingAuth && currentUser) {
      console.log("User is authenticated, redirecting...");
      if (currentUser.account.email && !currentUser.account.emailVerified) {
        router.push("/login"); // Hasn't verified email yet
      } else if (callbackUrl && callbackUrl.startsWith("/") && !callbackUrl.startsWith("/login")) {
        router.push(callbackUrl);
      } else if(currentUser.role === "Admin") {
        router.push("/admin");
      } else {
        router.push("/");
      }
    }
  }, [router, checkingAuth, currentUser]);



  function validateEmail(email) {
    return /\S+@\S+\.\S+/.test(email);
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
    if (!form.name.trim() || !form.userName.trim() || !form.email || !form.password || !form.confirmPassword) {
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
    if (!validatePasswordPolicy(form.password)) {
      setError("Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.");
      setIsLoading(false);
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      setIsLoading(false);
      return;
    }

    if (!token.current) {
      setError("Please complete the security check first.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await api.post('/api/signup', {
        throwHttpErrors: false,
        json: {
          name: form.name,
          username: form.userName,
          email: form.email,
          password: form.password,
          token: token.current,
        }
      });
      token.current = null;

      const data = await res.json();
      if (res.ok) {
        notifySuccess();
        setSuccess('Sucess!');
        setForm({ name: '', userName: '', email: '', password: '', confirmPassword: '' });
        setDisabled(true); // Prevent additional sign ups without refreshing the page
        turnstile.current.remove();
      } else {
        setError(data.error || 'Signup failed.');
        turnstile.current.reset();
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      turnstile.current.reset();
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
                  autoComplete="name"
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
                  autoComplete="off"
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
                  autoComplete="username"
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
                  autoComplete="new-password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  aria-required="true"
                  aria-describedby={error && error.includes('Password') ? 'form-error' : undefined}
                />
                {!validatePasswordPolicy(form.password) && form.password && (
                  <small style={{ color: "#dc2626" }}>
                    Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.
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
                  autoComplete="new-password"
                  placeholder="Confirm your password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                  aria-required="true"
                  aria-describedby={error && error.includes('Passwords do not match') ? 'form-error' : undefined}
                />
              </div>
              <Turnstile
                ref={turnstile}
                config={{
                  action: 'signup',
                  callback: (newToken) => (token.current = newToken),
                  'expired-callback': () => {
                    token.current = null;
                    turnstile.current.reset();
                  },
                }}
              />
              <div className="button">
                <button
                  type="submit"
                  disabled={isLoading || isDisabled}
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
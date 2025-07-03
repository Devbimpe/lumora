'use client';
import Image from 'next/image';
import '../globals.css';

export default function Login() {
  return (
    <div className="page">
      <main>
        <div className="LoginPage">
          <h1>Welcome to LUMORA</h1>
          <h2>Login to your account.</h2>
          <div className="Maininfo">
            <form action="">
              <div className="info">
                <label htmlFor="email">Email</label>
                <input type="email" name="email" id="email" required />
              </div>

              <div className="info">
                <label htmlFor="password">Password</label>
                <input type="password" name="password" id="password" required />
              </div>

              <div className="remember_forget">
                <label>
                  <input type="checkbox" id="rememberMe" />
                  Remember me
                </label>
                <a href="#">Forgot password?</a>
              </div>

              <div className="button">
                <button type="submit" id="LoginButton">
                  Login
                </button>
              </div>

              <div className="register_link">
                Don’t have an account?
                <a href="\signup"> Sign up</a>
              </div>
            </form>
          </div>
        </div>
      </main>
   
    </div>
  );
}

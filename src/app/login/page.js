'use client';
import { css, Global } from '@emotion/react';
import Image from 'next/image';


const globalStyles = css`
  .page {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    background-color: #fdfaf5;
  }

  main {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .Maininfo {
    text-align: center;
    background-color: white;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    width: 40vw;
  }

  .LoginPage {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    max-width: 400px;
    margin: 0 auto;
  }

  img {
    align-self: center;
  }

  h1 {
    font-size: 1.5rem;
    color: #2f6633;
    margin: 0.5rem 0;
  }

  h2 {
    color: #888;
    font-size: 1rem;
    margin-bottom: 2rem;
  }

  .info {
    margin-bottom: 1rem;
    text-align: left;
  }

  label {
    display: block;
    margin-bottom: 0.3rem;
    font-weight: bold;
  }

  input[type='email'],
  input[type='password'] {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
  }

  .remember_forget {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.85rem;
    margin-bottom: 1rem;
  }

  .button button {
    background-color: orange;
    color: white;
    border: none;
    padding: 0.75rem;
    width: 100%;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
  }

  .register_link {
    margin-top: 1rem;
    font-size: 0.85rem;
  }

  .register_link a {
    color: orange;
    text-decoration: none;
    margin-left: 0.3rem;
  }
`;

export default function Login() {
  return (
    <>
      <Global styles={globalStyles} />
      <div className="page">
        <main>
          <div className="LoginPage">
            <Image src="/Lumora.jpeg" alt="LUMORA Logo" width={500} height={500} />
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
                  <a href="#"> Sign up</a>
                </div>
              </form>
            </div>
          </div>
        </main>
       
      </div>
    </>
  );
}

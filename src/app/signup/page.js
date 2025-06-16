import "./signup.css"
import Image from 'next/image';
export default function Page() {
  return (
      <div className="container">
      <div className="logo">
        <Image
        src="/Lumoralogo.jpeg" 
        alt="LumoraLogo"
        width={"300"} height={"80"}
        />
      </div>  
      <h1>Welcome to Lumora</h1>
      <h2>Sign up to your account</h2>
      <div className="form-card">
        <form className="form">
          <div className="input-group">
            <label className="label">
              Full Name
            </label>
            <input
              id="name"
              placeholder="Enter your full name"
              className="input"
              required
            />
          </div>
          <div className="input-group">
            <label className="label">
              Username
            </label>
            <input
              id="userName"
              
              placeholder="Enter your username"
              className="input"
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="email" className="label">
              Email
            </label>
            <input
              id="email"
              placeholder="Enter your email"
              className="input"
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="password" className="label">
              Password
            </label>
            <input
              id="password"
              placeholder="Enter your password"
              className="input"
              required
            />
          </div>
          <button
            type="button"
            className="submit-button"
          >
            Signup
          </button>
        </form>
      </div>
    </div>
  )
}
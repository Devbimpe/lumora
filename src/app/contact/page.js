'use client';
import '../globals.css';
import './contact.css';

export default function Contact() {
  return (
    <div className="page">
      <main>
        <div className="ContactPage">
          <div className="contact-header">
            <h1>Contact Us</h1>
            <p className="contact-subtitle">We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
          </div>

          <form className="contact-form" action="https://formsubmit.co/lumora460@gmail.com" method="POST">
            <input type="hidden" name="_captcha" value="false" />
            <input type="hidden" name="_next" value="/contact?success=true" />
            
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input 
                type="text" 
                name="name" 
                id="name" 
                placeholder="Enter your name"
                required 
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input 
                type="email" 
                name="email" 
                id="email" 
                placeholder="Enter your email"
                required 
              />
            </div>

            <div className="form-group">
              <label htmlFor="message">Message</label>
              <textarea 
                name="message" 
                id="message" 
                rows="6" 
                placeholder="Tell us what's on your mind..."
                required
              ></textarea>
            </div>

            <div className="form-actions">
              <button type="submit" id="SubmitButton">
                <span>Send Message</span>
                <svg className="button-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

'use client';
import '../contact.css';
import '../globals.css';


export default function Contact() {
return (
    <div className="page">
    <main>
        <div className="ContactPage">
        <h1>Contact us</h1>

        <form className="contact-form" action="https://formsubmit.co/lumora460@gmail.com" method="POST">
            <div className="info">
            <label htmlFor="name">Name</label>
            <input type="text" name="name" id="name" required / >
            </div>

            <div className="info">
            <label htmlFor="email">Email</label>
            <input type="email" name="email" id="email" required />
            </div>

            <div className="info">
            <label htmlFor="message">Message</label>
            <textarea name="message" id="message" rows="4" required></textarea>
            </div>

            <div className="button">
            <button type="submit" id="SubmitButton">Submit</button>
            </div>

            <input type="hidden" name="_captcha" value="false" />
        </form>
        </div>
    </main>
    </div>
);
}

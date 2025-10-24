import nodemailer from "nodemailer"

export async function sendResetEmail(to, token) {
  // Created transporter using Gmail SMTP - took the reference from src/app/api/users/signup/route.js
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })
}
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  // true for 465, false for other ports
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

// Verify reCAPTCHA token
import { verifyRecaptcha } from "@/lib/verifyRecaptcha";
// async function verifyRecaptcha(token: string) {
//   //   console.log("Token ", token);
//   const response = await fetch(
//     "https://www.google.com/recaptcha/api/siteverify",
//     {
//       method: "POST",
//       headers: { "Content-Type": "application/x-www-form-urlencoded" },
//       body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`,
//     }
//   );

//   const data = await response.json();
//   console.log("recaptcha data ", data);
//   // reCAPTCHA v3 returns a score from 0.0 to 1.0
//   return data.success && data.score >= 0.5;
// }

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, message, recaptchaToken } = body;
    console.log("Body content", body);

    // Verify reCAPTCHA
    const isHuman = await verifyRecaptcha(recaptchaToken);
    if (!isHuman) {
      return NextResponse.json(
        { error: "reCAPTCHA verification failed" },
        { status: 400 }
      );
    }
    console.log("isHuman check ", isHuman);

    // Email content
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: process.env.TO_EMAIL,
      subject: `New Contact Form Submission from ${name}`,
      text: `
        Name: ${name}
        Email: ${email}
        Message: ${message}
      `,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong> ${message}</p>
      `,
    };
    console.log("mailOptions ", mailOptions);

    // Send email
    await transporter.sendMail(mailOptions);
    console.log("Message sent!");

    return NextResponse.json(
      { message: "Email sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json({ error: "Error sending email" }, { status: 500 });
  }
}

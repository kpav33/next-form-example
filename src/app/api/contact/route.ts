import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

// Still doesn't work on Coolify deployed instance, maybe some sort of network wide blocking by the cloud provider?
// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  // port: 465,
  // true for 465, false for other ports
  secure: false,
  // secure: true,
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
    // console.log("SMTP Host:", process.env.SMTP_HOST);
    // console.log("SMTP Port:", process.env.SMTP_PORT);
    // console.log("SMTP User:", process.env.SMTP_USER);
    // console.log("SMTP Password:", process.env.SMTP_PASSWORD);
    // console.log("transporter ", transporter);

    const body = await request.json();
    const { name, email, message, recaptchaToken } = body;
    // console.log("Body content:", body);

    // Verify reCAPTCHA
    const isHuman = await verifyRecaptcha(recaptchaToken);
    if (!isHuman) {
      return NextResponse.json(
        { error: "reCAPTCHA verification failed" },
        { status: 400 }
      );
    }
    // console.log("isHuman check ", isHuman);

    // const transporterCheck = await new Promise((resolve, reject) => {
    //   // verify connection configuration
    //   transporter.verify(function (error, success) {
    //     if (error) {
    //       console.log(error);
    //       reject(error);
    //     } else {
    //       console.log("Server is ready to take our messages");
    //       resolve(success);
    //     }
    //   });
    // });
    // console.log("transporterCheck ", transporterCheck);

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
    // console.log("mailOptions ", mailOptions);

    // Send email
    await transporter.sendMail(mailOptions);
    // console.log("Message sent!");

    return NextResponse.json(
      { message: "Email sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    // console.error("Error sending email:", error);
    // return NextResponse.json({ error: "Error sending email" }, { status: 500 });

    if (error instanceof Error) {
      console.error("Error sending email:", error.message);
      return NextResponse.json(
        {
          error: "Error sending email",
          details: error.message,
        },
        { status: 500 }
      );
    } else {
      console.error("Unknown error:", error);
      return NextResponse.json(
        { error: "An unknown error occurred" },
        { status: 500 }
      );
    }
  }
}

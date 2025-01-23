"use client";

import { useState, useEffect } from "react";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";

export default function Home() {
  const [formStatus, setFormStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  // Netlify Forms
  //   const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
  //     event.preventDefault();
  //     setFormStatus("loading");

  //     const form = event.target as HTMLFormElement;
  //     const formData = new FormData(form);

  //     // Convert FormData to URLSearchParams properly
  //     const urlSearchParams = new URLSearchParams();
  //     for (const [key, value] of formData.entries()) {
  //       urlSearchParams.append(key, value.toString());
  //     }

  //     try {
  //       //   const response = await fetch("/", {
  //       //     method: "POST",
  //       //     headers: { "Content-Type": "application/x-www-form-urlencoded" },
  //       //     // body: new URLSearchParams(formData).toString()
  //       //     body: urlSearchParams.toString(),
  //       //   });

  //       // Fix build error
  //       const response = await fetch("/__forms.html", {
  //         method: "POST",
  //         headers: { "Content-Type": "application/x-www-form-urlencoded" },
  //         // body: new URLSearchParams(formData).toString()
  //         body: urlSearchParams.toString(),
  //       });

  //       if (!response.ok) {
  //         throw new Error("Network response was not ok");
  //       }

  //       setFormStatus("success");
  //       form.reset();
  //     } catch (error) {
  //       console.error("Error submitting form:", error);
  //       setFormStatus("error");
  //     }
  //   };

  // Nodemailer with Gmail
  // Gmail standard account allows sending up to 500 email per day
  // CAPTCHA for spam prevention
  const [errorMessage, setErrorMessage] = useState<string>("");
  const { executeRecaptcha } = useGoogleReCaptcha();

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    setFormStatus("loading");
    setErrorMessage("");

    if (!executeRecaptcha) {
      setFormStatus("error");
      setErrorMessage("reCAPTCHA not loaded");
      return;
    }

    try {
      // Get reCAPTCHA token
      const recaptchaToken = await executeRecaptcha();
      //   console.log("Clietn side token ", recaptchaToken);

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: event.target.name.value,
          email: event.target.email.value,
          message: event.target.message.value,
          recaptchaToken,
        }),
      });

      if (!response.ok) throw new Error("Failed to send message");

      setFormStatus("success");
      event.target.reset();
    } catch (error) {
      console.error("Error:", error);
      setFormStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to send message"
      );
    }
  };

  // We could also use a third party service like Formspree, but while there is a free tier, we might end up having to pay for it, if we go above it (In case of Formspree the free tier is 50 submissions per month, lowest tier is Personal with 200 submissions and 10$ per month)
  // Nodemailer with Google reCAPTCHA for protection should be a good free solution

  const handleSubmitResend = async (event: any) => {
    // console.log(event);
    event.preventDefault();
    setFormStatus("loading");
    setErrorMessage("");

    if (!executeRecaptcha) {
      setFormStatus("error");
      setErrorMessage("reCAPTCHA not loaded");
      return;
    }

    try {
      // Get reCAPTCHA token
      const recaptchaToken = await executeRecaptcha();

      const response = await fetch("/api/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: event.target.name.value,
          email: event.target.email.value,
          message: event.target.message.value,
          recaptchaToken,
        }),
      });

      if (!response.ok) throw new Error("Failed to send message");

      setFormStatus("success");
      event.target.reset();
    } catch (error) {
      console.error("Error:", error);
      setFormStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to send message"
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="p-4 bg-gray-100">Header</header>

      <main className="flex-1 container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Contact Us</h1>

        <p>Send message over gmail</p>
        <form
          name="contact"
          method="POST"
          data-netlify="true"
          netlify-honeypot="bot-field"
          className="max-w-md space-y-4"
          onSubmit={handleSubmit}
        >
          <input type="hidden" name="form-name" value="contact" />
          <input type="hidden" name="bot-field" />

          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium mb-1">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              required
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={formStatus === "loading"}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            {formStatus === "loading" ? "Sending..." : "Send Message"}
          </button>

          {formStatus === "success" && (
            <p className="text-green-600">
              Thank you for your message! We'll get back to you soon.
            </p>
          )}

          {formStatus === "error" && (
            <p className="text-red-600">
              There was an error sending your message. Please try again.{" "}
              {errorMessage}.
            </p>
          )}
        </form>

        <br />
        <br />
        <hr />
        <hr />
        <br />
        <br />

        <p style={{ marginBottom: "20px" }}>Send message over Resend API</p>
        <form
          name="contact"
          method="POST"
          className="max-w-md space-y-4"
          onSubmit={handleSubmitResend}
        >
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium mb-1">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              required
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={formStatus === "loading"}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            {formStatus === "loading" ? "Sending..." : "Send Message"}
          </button>

          {formStatus === "success" && (
            <p className="text-green-600">
              Thank you for your message! We'll get back to you soon.
            </p>
          )}

          {formStatus === "error" && (
            <p className="text-red-600">
              There was an error sending your message. Please try again.{" "}
              {errorMessage}.
            </p>
          )}
        </form>
      </main>

      {/* <button
        onClick={handleSubmitResend}
        disabled={formStatus === "loading"}
        className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300 disabled:cursor-not-allowed w-5/12"
      >
        Resent Test
      </button> */}
      <footer className="p-4 bg-gray-100">Footer</footer>
    </div>
  );
}

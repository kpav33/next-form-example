"use client";

import { useState } from "react";

export default function Home() {
  const [formStatus, setFormStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormStatus("loading");

    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);

    // Convert FormData to URLSearchParams properly
    const urlSearchParams = new URLSearchParams();
    for (const [key, value] of formData.entries()) {
      urlSearchParams.append(key, value.toString());
    }

    try {
      //   const response = await fetch("/", {
      //     method: "POST",
      //     headers: { "Content-Type": "application/x-www-form-urlencoded" },
      //     // body: new URLSearchParams(formData).toString()
      //     body: urlSearchParams.toString(),
      //   });

      // Fix build error
      const response = await fetch("/__forms.html", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        // body: new URLSearchParams(formData).toString()
        body: urlSearchParams.toString(),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      setFormStatus("success");
      form.reset();
    } catch (error) {
      console.error("Error submitting form:", error);
      setFormStatus("error");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="p-4 bg-gray-100">Header</header>

      <main className="flex-1 container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Contact Us</h1>

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
              There was an error sending your message. Please try again.
            </p>
          )}
        </form>
      </main>

      <footer className="p-4 bg-gray-100">Footer</footer>
    </div>
  );
}

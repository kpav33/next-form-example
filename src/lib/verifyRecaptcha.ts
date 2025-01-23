export async function verifyRecaptcha(token: string) {
  //   console.log("Token ", token);
  const response = await fetch(
    "https://www.google.com/recaptcha/api/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`,
    }
  );

  const data = await response.json();
  console.log("recaptcha data ", data);
  // reCAPTCHA v3 returns a score from 0.0 to 1.0
  return data.success && data.score >= 0.5;
}

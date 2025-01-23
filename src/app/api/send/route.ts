import { EmailTemplate } from "@/components/EmailTemplate";
import { Resend } from "resend";
import { verifyRecaptcha } from "@/lib/verifyRecaptcha";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, message, recaptchaToken } = body;
    // console.log("Body ", body);

    const isHuman = await verifyRecaptcha(recaptchaToken);
    if (!isHuman) {
      return NextResponse.json(
        { error: "reCAPTCHA verification failed" },
        { status: 400 }
      );
    }

    // const { data, error } = await resend.emails.send({
    //   from: "Dekrypt <info@dekrypt.si>",
    //   to: ["klemenpavlovic@gmail.com"],
    //   subject: "Hello world",
    //   // @ts-ignore
    //   react: EmailTemplate({ firstName: "John" }),
    // });

    const { data, error } = await resend.emails.send({
      from: "Dekrypt <info@dekrypt.si>",
      to: [email],
      subject: "Hello world",
      // @ts-ignore
      react: EmailTemplate({ name, message }),
    });

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}

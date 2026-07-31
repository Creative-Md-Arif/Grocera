import * as SibApiV3Sdk from "@getbrevo/brevo";
import dotenv from "dotenv";

dotenv.config();

// Brevo API Client Setup
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
const apiKey = apiInstance.authentications["apiKey"];
apiKey.apiKey = process.env.BREVO_API_KEY;

const sendEmail = async (params, subjectParam, textParam, htmlParam) => {
  let to, subject, text, html;

  // আপনার আগের লজিক (Object বা direct params)
  if (typeof params === "object" && params !== null && !Array.isArray(params)) {
    ({ to, subject, text, html } = params);
  } else {
    to = params;
    subject = subjectParam;
    text = textParam;
    html = htmlParam;
  }

  try {
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = html;
    sendSmtpEmail.textContent = text;
    sendSmtpEmail.sender = { name: "ArixGear", email: process.env.FROM_EMAIL };
    sendSmtpEmail.to = [{ email: to }];
    sendSmtpEmail.replyTo = { email: process.env.FROM_EMAIL };

    // API এর মাধ্যমে ইমেইল পাঠানো
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);

    console.log(`✅ Email sent successfully via Brevo API to: ${to}`);
    return data;
  } catch (error) {
    // Brevo API এর ডিটেইল এরর মেসেজ দেখা
    console.error(
      `❌ Brevo API Error for ${to}:`,
      error.response?.body?.message || error.message,
    );
    throw new Error("Email delivery failed");
  }
};

export default sendEmail;

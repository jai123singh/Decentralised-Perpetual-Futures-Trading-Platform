const dotenv = require("dotenv");
dotenv.config();

// importing brevo sdk
const SibApiV3Sdk = require("sib-api-v3-sdk");

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const SENDER_EMAIL = process.env.SENDER_EMAIL;
const RECEIVER_EMAIL = process.env.RECEIVER_EMAIL;

// Set up Brevo API client
const apiKey = BREVO_API_KEY;
const client = SibApiV3Sdk.ApiClient.instance;
client.authentications["api-key"].apiKey = apiKey;
const transactionalEmailsApi = new SibApiV3Sdk.TransactionalEmailsApi();

// following function is used to send mail on behalf of backend to me ( my personal email id)
async function sendMail(content) {
  const emailData = {
    sender: { email: SENDER_EMAIL },
    to: [{ email: RECEIVER_EMAIL }],
    subject: "Backend Notification",
    htmlContent: `<html><body><h1>${content}</h1></body></html>`,
  };

  try {
    const response = await transactionalEmailsApi.sendTransacEmail(emailData);
    // below line is for just testing
    // console.log("Email sent: ", response);
  } catch (error) {
    // below line is for just testing
    // console.error("Error sending email:", error);
  }
}

module.exports = sendMail;

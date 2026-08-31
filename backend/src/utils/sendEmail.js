import axios from "axios";
import { config } from "../config/config";

export const sendEmail = async ({ email, subject, message }) => {
  try {
    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "Asif",
          email: config.EMAIL_USER,
        },
        to: [{ email }],
        subject,
        htmlContent: message,
      },
      {
        headers: {
          "api-key": config.BREVO_API_KEY,
          "Content-Type": "application/json",
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error("❌ Email Error");
    if (error.response) {
      console.error(error.response.data);
    } else {
      console.error(error.message);
    }

    throw error;
  }
};

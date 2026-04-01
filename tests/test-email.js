import dotenv from "dotenv";
import { sendReminderEmail } from "../utils/send-email.js";

// Load our environment variables (including the EMAIL_PASSWORD)
dotenv.config({ path: "config/.env.development.local" });

const testEmail = async () => {
  try {
    console.log("🚀 Starting manual email test...");

    // We pass mock subscription data to the email sender
    await sendReminderEmail({
      to: "shamirk1212@gmail.com", // Let's send it directly to you!
      type: "7 days reminder",
      subscription: {
        name: "Netflix Premium (Test)",
        renewalDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        currency: "USD",
        price: "15.99",
        user: {
          name: "Shamir Khan",
          email: "shamirk1212@gmail.com",
        },
      },
    });

    console.log(
      "✅ Test email request dispatched successfully! Check your inbox.",
    );
  } catch (error) {
    console.error("❌ Test email failed:", error);
  }
};

testEmail();

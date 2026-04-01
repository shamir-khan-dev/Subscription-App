import { serve } from "@upstash/workflow/express";
import dayjs from "dayjs";
import Subscription from "../models/subscription.model.js";
import { sendReminderEmail } from "../utils/send-email.js";

const REMINDERS = [7, 5, 2, 1];

export const sendReminders = serve(async (context) => {
  const { subscriptionId } = context.requestPayload;

  const subscription = await context.run("get subscription", async () => {
    return Subscription.findById(subscriptionId).populate("user", "name email");
  });

  if (!subscription || subscription.status !== "active") return;

  const renewalDate = dayjs(subscription.renewalDate);

  if (renewalDate.isBefore(dayjs())) {
    console.log(`Renewal date has already passed for ${subscription.name}. Stopping workflow.`);
    return;
  }

  for (const daysBefore of REMINDERS) {
    const reminderDate = renewalDate.subtract(daysBefore, "day");

    if (reminderDate.isAfter(dayjs())) {
      await context.sleepUntil(
        `wait for ${daysBefore} days reminder`,
        reminderDate.toDate()
      );

      await context.run(`send ${daysBefore} days reminder`, async () => {
        console.log(`Sending ${daysBefore} days reminder for ${subscription.name}`);
        
        await sendReminderEmail({
          to: subscription.user.email,
          type: `${daysBefore} days reminder`,
          subscription,
        });
      });
    }
  }
});

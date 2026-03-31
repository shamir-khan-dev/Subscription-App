import { serve } from "@upstash/workflow/express";
import Subscription from "../models/subscription.model.js";

const REMINDERS = [7, 5, 2, 1];

export const sendReminders = serve(async (context) => {
  const { subscriptionId } = context.requestPayload;

  const subscription = await context.run("get subscription", async () => {
    return Subscription.findById(subscriptionId).populate("user", "name email");
  });

  if (!subscription || subscription.status !== "active") return;

  const renewalDate = new Date(subscription.renewalDate);

  for (const daysBefore of REMINDERS) {
    const reminderDate = new Date(renewalDate);
    reminderDate.setDate(renewalDate.getDate() - daysBefore);

    if (reminderDate > new Date()) {
      await context.sleepUntil(
        `wait for ${daysBefore} days reminder`,
        reminderDate
      );

      await context.run(`send ${daysBefore} days reminder`, async () => {
        console.log(`Sending ${daysBefore} days reminder for ${subscription.name}`);
        // Here we will call the email service later!
      });
    }
  }
});

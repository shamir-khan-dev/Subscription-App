export const emailTemplates = [
  {
    label: "7 days reminder",
    generateSubject: (subscription) => `🔥 Reminder: Your ${subscription.name} subscription is renewing in 7 days!`,
    generateBody: (subscription) => `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f9f9f9; padding: 20px;">
        <h2 style="color: #222;">Hello ${subscription.user.name},</h2>
        <p>Your <strong>${subscription.name}</strong> subscription is set to renew on <strong>${new Date(subscription.renewalDate).toLocaleDateString()}</strong>.</p>
        <p>Amount to be charged: <strong>${subscription.currency} ${subscription.price}</strong></p>
        <p>If you'd like to make changes, please do so before the renewal date.</p>
        <p>Best regards,<br>Subscription Tracker Team</p>
      </div>
    `,
  },
  {
    label: "5 days reminder",
    generateSubject: (subscription) => `🎉 Heads up! ${subscription.name} renews in 5 days!`,
    generateBody: (subscription) => `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; padding: 20px;">
         <h2>Heads up, ${subscription.user.name}!</h2>
         <p>Just a quick note that your <strong>${subscription.name}</strong> is renewing soon.</p>
         <p>Renewal Date: ${new Date(subscription.renewalDate).toLocaleDateString()}</p>
         <p>Thank you for using our service!</p>
      </div>
    `,
  },
  {
    label: "2 days reminder",
    generateSubject: (subscription) => `⏳ Renewal Incoming: ${subscription.name} in 2 days!`,
    generateBody: (subscription) => `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #e67e22; padding: 20px;">
         <h2>Almost there!</h2>
         <p>Your <strong>${subscription.name}</strong> subscription renews in just 48 hours.</p>
         <p>Make sure your payment method is ready!</p>
      </div>
    `,
  },
  {
    label: "1 days reminder",
    generateSubject: (subscription) => `🚀 Final Call: ${subscription.name} renews TOMORROW!`,
    generateBody: (subscription) => `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #c0392b; padding: 20px;">
         <h2>Final Reminder!</h2>
         <p>Your <strong>${subscription.name}</strong> subscription renews tomorrow!</p>
         <p>This is your last chance to review your plan before the charge.</p>
      </div>
    `,
  },
];

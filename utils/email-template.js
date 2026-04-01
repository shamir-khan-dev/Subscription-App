export const generateEmailTemplate = ({
  userName,
  subscriptionName,
  renewalDate,
  planName,
  price,
  paymentMethod,
  accountSettingsLink,
}) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 40px auto;
            background: #ffffff;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
            overflow: hidden;
        }
        .header {
            background-color: #2c3e50;
            color: #ffffff;
            padding: 30px 40px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
        }
        .content {
            padding: 40px;
        }
        .greeting {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 20px;
            color: #2c3e50;
        }
        .details-box {
            background-color: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 6px;
            padding: 20px;
            margin: 25px 0;
        }
        .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 12px;
            border-bottom: 1px solid #e9ecef;
            padding-bottom: 12px;
        }
        .detail-row:last-child {
            margin-bottom: 0;
            border-bottom: none;
            padding-bottom: 0;
        }
        .detail-label {
            color: #6c757d;
            font-size: 14px;
        }
        .detail-value {
            font-weight: 600;
            color: #2c3e50;
        }
        .btn-container {
            text-align: center;
            margin: 35px 0 20px;
        }
        .btn {
            background-color: #3498db;
            color: #ffffff;
            text-decoration: none;
            padding: 14px 28px;
            border-radius: 6px;
            font-weight: 600;
            font-size: 16px;
            display: inline-block;
            transition: background-color 0.3s ease;
        }
        .btn:hover {
            background-color: #2980b9;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 20px 40px;
            text-align: center;
            font-size: 13px;
            color: #6c757d;
            border-top: 1px solid #e9ecef;
        }
        .footer p {
            margin: 5px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Subscription Update</h1>
        </div>
        <div class="content">
            <div class="greeting">Hello ${userName},</div>
            
            <p>This is a quick notification regarding your upcoming subscription renewal. Your <strong>${subscriptionName}</strong> account is scheduled to renew soon.</p>
            
            <div class="details-box">
                <div class="detail-row">
                    <span class="detail-label">Subscription</span>
                    <span class="detail-value">${planName}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Renewal Date</span>
                    <span class="detail-value">${renewalDate}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Amount</span>
                    <span class="detail-value">${price}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Payment Method</span>
                    <span class="detail-value">${paymentMethod}</span>
                </div>
            </div>

            <p>Ensure your payment details are up to date so you don't experience any interruption in service. If you wish to modify or cancel your subscription, please visit your account dashboard before the renewal date.</p>
            
            <div class="btn-container">
                <a href="${accountSettingsLink}" class="btn">Manage Subscription</a>
            </div>
            
            <p style="margin-top: 30px; font-size: 14px; color: #6c757d;">
                Need help? Reply to this email or contact our active support team.
            </p>
        </div>
        
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Subscription Tracker. All rights reserved.</p>
            <p>If you did not expect this email, please secure your account immediately.</p>
        </div>
    </div>
</body>
</html>
`;

export const emailTemplates = [
  {
    label: "7 days reminder",
    generateSubject: (subscription) => `📅 Upcoming Renewal: ${subscription.name} in 7 Days`,
    generateBody: (subscription) => generateEmailTemplate({
      userName: subscription.user.name,
      subscriptionName: subscription.name,
      renewalDate: new Date(subscription.renewalDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      planName: subscription.name,
      price: `${subscription.currency} ${subscription.price}`,
      paymentMethod: subscription.paymentMethod || 'Credit Card',
      accountSettingsLink: "https://shamir-tracker.loca.lt",
    }),
  },
  {
    label: "5 days reminder",
    generateSubject: (subscription) => `⏳ Friendly Reminder: ${subscription.name} renews in 5 Days`,
    generateBody: (subscription) => generateEmailTemplate({
      userName: subscription.user.name,
      subscriptionName: subscription.name,
      renewalDate: new Date(subscription.renewalDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      planName: subscription.name,
      price: `${subscription.currency} ${subscription.price}`,
      paymentMethod: subscription.paymentMethod || 'Credit Card',
      accountSettingsLink: "https://shamir-tracker.loca.lt",
    }),
  },
  {
    label: "2 days reminder",
    generateSubject: (subscription) => `⚠️ Action Required: ${subscription.name} renews in 48 Hours`,
    generateBody: (subscription) => generateEmailTemplate({
      userName: subscription.user.name,
      subscriptionName: subscription.name,
      renewalDate: new Date(subscription.renewalDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      planName: subscription.name,
      price: `${subscription.currency} ${subscription.price}`,
      paymentMethod: subscription.paymentMethod || 'Credit Card',
      accountSettingsLink: "https://shamir-tracker.loca.lt",
    }),
  },
  {
    label: "1 days reminder",
    generateSubject: (subscription) => `🚨 FINAL NOTICE: ${subscription.name} renews TOMORROW!`,
    generateBody: (subscription) => generateEmailTemplate({
      userName: subscription.user.name,
      subscriptionName: subscription.name,
      renewalDate: new Date(subscription.renewalDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      planName: subscription.name,
      price: `${subscription.currency} ${subscription.price}`,
      paymentMethod: subscription.paymentMethod || 'Credit Card',
      accountSettingsLink: "https://shamir-tracker.loca.lt",
    }),
  },
];

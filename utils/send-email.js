import transporter, { accountEmail } from '../config/nodemailer.js';
import { emailTemplates } from './email-template.js';

export const sendReminderEmail = async ({ to, type, subscription }) => {
  if (!to || !type) throw new Error('Missing "to" or "type" parameters');

  const template = emailTemplates.find((t) => t.label === type);

  if (!template) throw new Error('Invalid email type');

  const mailOptions = {
    from: accountEmail,
    to: to,
    subject: template.generateSubject(subscription),
    html: template.generateBody(subscription),
  }

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) return console.log(error, 'Error sending email');

    console.log('Email sent: ' + info.response);
  })
}

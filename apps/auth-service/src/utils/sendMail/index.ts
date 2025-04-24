import { config } from 'dotenv';
import ejs from 'ejs';
import { createTransport } from 'nodemailer';
import path from 'path';

config();

const transporter = createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  service: process.env.SMTP_SERVICE,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

//Render the email template using ejs
export const renderEmailTemplate = async (
  templateName: string,
  data: Record<string, unknown>
) => {
  const templatePath = path.join(
    process.cwd(),
    'apps',
    'auth-service',
    'src',
    'utils',
    'email-templates',
    `${templateName}.ejs`
  );
  return ejs.renderFile(templatePath, data);
};

//Send the email using nodemailer
export const sendEmail = async (
  to: string,
  subject: string,
  templateName: string,
  data: Record<string, unknown>
) => {
  try {
    const html = await renderEmailTemplate(templateName, data);
    // Send the email using nodemailer
    await transporter.sendMail({
      from: `${process.env.SMTP_USER}`,
      to,
      subject,
      html,
    });
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

//Send the email using nodemailer with template

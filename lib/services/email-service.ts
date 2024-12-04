import { Resend } from 'resend';
import { type EmailTemplate } from '../templates/email-templates';

// Initialize Resend with your API key
const resend = new Resend(process.env.EMAIL_API_KEY!);

export class EmailService {
  // Static method to send email using Resend
  static async sendEmail(to: string, template: EmailTemplate): Promise<void> {
    try {
      const response = await resend.emails.send({
        from: process.env.NEXT_PUBLIC_EMAIL_FROM!, // Use your FROM email address
        to,
        subject: template.subject,
        html: template.body,
      });

      console.log('Email sent successfully:', response);
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  // Static method to send a templated email
  static async sendTemplatedEmail(
    to: string,
    templateName: string,
    data: Record<string, any>
  ): Promise<void> {
    try {
      // Fetch the template dynamically in a real application (e.g., from a database)
      const template: EmailTemplate = {
        subject: 'Test Email',
        body: 'This is a test email', // You can populate this dynamically using `data`
      };

      // Send the email with the fetched template
      await this.sendEmail(to, template);
    } catch (error) {
      console.error('Error sending templated email:', error);
      throw error;
    }
  }
}

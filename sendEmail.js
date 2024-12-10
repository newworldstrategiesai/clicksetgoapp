import { Resend } from 'resend';

// Initialize Resend with your API key
const resend = new Resend('re_cRejZU63_BBBaxgY7tax2LT2oEgbxnvFG');

// Define the email details
const sendEmail = async () => {
  try {
    const response = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'newworldstrategiesai@gmail.com',
      subject: 'Hello World',
      html: '<p>Congrats on sending your <strong>first email</strong>!</p>',
    });

    console.log('Email sent successfully:', response);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

// Call the function to send the email
sendEmail();

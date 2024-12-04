import { type Lead, type Event, type Client } from '../types';

export interface EmailTemplate {
  subject: string;
  body: string;
}

interface ExtendedLead extends Lead {
  client?: Client;
  event?: Event;
}

export const EMAIL_TEMPLATES: Record<string, (lead: ExtendedLead) => EmailTemplate> = {
  'welcome': (lead: ExtendedLead) => ({
    subject: 'Welcome to M10 DJ Company',
    body: `
Hi ${lead.client?.name},

Thank you for your interest in M10 DJ Company! We're excited to help make your event unforgettable.

Here's what happens next:
1. We'll review your requirements
2. Schedule a consultation call
3. Create a customized proposal

In the meantime, you can check out our most popular packages at [Package Link].

Best regards,
M10 DJ Company
    `.trim()
  }),

  'follow-up': (lead: ExtendedLead) => ({
    subject: 'Following Up on Your DJ Services Inquiry',
    body: `
Hi ${lead.client?.name},

I hope this email finds you well. I wanted to follow up on your inquiry about DJ services for your upcoming event.

Would you be available for a quick call this week to discuss your requirements in detail? You can book a time that works best for you using our scheduling link: [Calendar Link]

Looking forward to speaking with you!

Best regards,
M10 DJ Company
    `.trim()
  }),

  'proposal': (lead: ExtendedLead) => ({
    subject: 'Your Custom DJ Services Proposal',
    body: `
Hi ${lead.client?.name},

Thank you for taking the time to discuss your event with us. I'm excited to share our custom proposal based on your requirements.

You can view and download your proposal here: [Proposal Link]

Key highlights:
- Full DJ services
- Professional sound system
- Customized playlist
- Lighting package

Please review the proposal and let me know if you have any questions. The proposal is valid for the next 7 days.

Ready to proceed? You can secure your date with a deposit through this link: [Payment Link]

Best regards,
M10 DJ Company
    `.trim()
  }),

  'contract': (lead: ExtendedLead) => ({
    subject: 'Your DJ Services Contract',
    body: `
Hi ${lead.client?.name},

Great news! Your contract for DJ services is ready for review and signature.

Please review and sign the contract here: [Contract Link]

Next steps:
1. Review and sign the contract
2. Submit the deposit payment
3. Start planning your event playlist

The contract will be held for 48 hours. After that, we'll need to check date availability again.

If you have any questions, don't hesitate to reach out.

Best regards,
M10 DJ Company
    `.trim()
  }),

  'deposit-reminder': (lead: ExtendedLead) => ({
    subject: 'Complete Your DJ Booking - Deposit Due',
    body: `
Hi ${lead.client?.name},

This is a friendly reminder that your deposit payment is due to secure your event date.

Quick payment link: [Payment Link]

Your event details:
Date: ${lead.event?.date.toLocaleDateString()}
Venue: ${lead.event?.location}

The date will be held for the next 24 hours. After that, it will become available to other clients.

Need help? Just reply to this email or call us.

Best regards,
M10 DJ Company
    `.trim()
  }),

  'booking-confirmation': (lead: ExtendedLead) => ({
    subject: 'Booking Confirmed - Welcome to the M10 DJ Family!',
    body: `
Hi ${lead.client?.name},

Fantastic news! Your booking with M10 DJ Company is now confirmed.

Event Details:
Date: ${lead.event?.date.toLocaleDateString()}
Venue: ${lead.event?.location}

Next steps:
1. Complete our music preference form: [Form Link]
2. Schedule a planning call: [Calendar Link]
3. Join our client portal: [Portal Link]

We're excited to be part of your special day!

Best regards,
M10 DJ Company
    `.trim()
  })
};
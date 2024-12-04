import { type Lead, type Client, type Event } from '../types';

interface ExtendedLead extends Lead {
  client?: Client;
  event?: Event;
}

export const SMS_TEMPLATES: Record<string, (lead: ExtendedLead) => string> = {
  'welcome': (lead: ExtendedLead) => 
    `Welcome to M10 DJ Company! We've received your inquiry and will contact you shortly. Meanwhile, check out our packages: [Link]`,

  'follow-up': (lead: ExtendedLead) =>
    `Hi ${lead.client?.name}, following up on your DJ services inquiry. Would you like to schedule a quick call? Book here: [Link]`,

  'proposal-sent': (lead: ExtendedLead) =>
    `Your custom DJ proposal is ready! Check your email or view it here: [Link]. Valid for 7 days.`,

  'contract-sent': (lead: ExtendedLead) =>
    `Your DJ contract is ready for review! Sign here: [Link]. The date will be held for 48 hours.`,

  'deposit-reminder': (lead: ExtendedLead) =>
    `Reminder: Complete your DJ booking by submitting the deposit payment. Pay here: [Link]`,

  'booking-confirmation': (lead: ExtendedLead) =>
    `Booking confirmed! Your event on ${lead.event?.date.toLocaleDateString()} is locked in. Check your email for next steps.`,

  'meeting-reminder': (lead: ExtendedLead) =>
    `Reminder: Your consultation call with M10 DJ Company is scheduled. Need to reschedule? [Link]`
};
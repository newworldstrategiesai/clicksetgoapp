import type { CallLog } from '@/lib/types';
import { config } from '../config';

export class TwilioService {
  private static accountSid: string;
  private static authToken: string;
  private static phoneNumber: string;

  static initialize(params: {
    accountSid: string;
    authToken: string;
    phoneNumber: string;
  }) {
    this.accountSid = params.accountSid;
    this.authToken = params.authToken;
    this.phoneNumber = params.phoneNumber;
  }

  static async handleIncomingCall(callSid: string): Promise<void> {
    try {
      // Initialize Twilio client with credentials
      const client = require('twilio')(config.twilioAccountSid, config.twilioAuthToken);
      
      // Fetch call details
      const call = await client.calls(callSid).fetch();
      
      // Log call details
      console.log('Incoming call details:', {
        callSid,
        from: call.from,
        status: call.status,
        duration: call.duration,
      });
      
    } catch (error) {
      console.error('Error handling incoming call:', error);
      throw error;
    }
  }

  static async makeCall(phoneNumber: string): Promise<void> {
    try {
      const response = await fetch('/api/calls/make', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber }),
      });

      if (!response.ok) {
        throw new Error('Failed to initiate call');
      }
    } catch (error) {
      console.error('Error making call:', error);
      throw error;
    }
  }

  static async sendSMS(phoneNumber: string, message: string): Promise<void> {
    try {
      const response = await fetch('/api/sms/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber, message }),
      });

      if (!response.ok) {
        throw new Error('Failed to send SMS');
      }
    } catch (error) {
      console.error('Error sending SMS:', error);
      throw error;
    }
  }

  static async getCallLogs(): Promise<CallLog[]> {
    try {
      const response = await fetch('/api/calls/logs');
      if (!response.ok) {
        throw new Error('Failed to fetch call logs');
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching call logs:', error);
      throw error;
    }
  }

  static async storeCallRecording(
    callSid: string,
    recordingUrl: string
  ): Promise<void> {
    try {
      const response = await fetch('/api/calls/recording', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ callSid, recordingUrl }),
      });

      if (!response.ok) {
        throw new Error('Failed to store call recording');
      }
    } catch (error) {
      console.error('Error storing call recording:', error);
      throw error;
    }
  }

  static async storeCallTranscription(
    callSid: string,
    transcription: string
  ): Promise<void> {
    try {
      const response = await fetch('/api/calls/transcription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ callSid, transcription }),
      });

      if (!response.ok) {
        throw new Error('Failed to store call transcription');
      }
    } catch (error) {
      console.error('Error storing call transcription:', error);
      throw error;
    }
  }

  static async getContacts() {
    try {
      const client = require('twilio')(
        process.env.NEXT_PUBLIC_TWILIO_ACCOUNT_SID,
        process.env.NEXT_PUBLIC_TWILIO_AUTH_TOKEN
      );

      const conversations = await client.conversations.v1.conversations.list();
      
      return conversations.map((conv: any) => ({
        id: conv.sid,
        name: conv.friendlyName || conv.sid,
        channel: 'twilio',
        lastMessage: null, // You'll need to fetch this separately
        unreadCount: 0 // You'll need to implement this
      }));
    } catch (error) {
      console.error('Error fetching Twilio contacts:', error);
      throw error;
    }
  }

  static async getMessages(conversationId: string) {
    try {
      const client = require('twilio')(
        process.env.NEXT_PUBLIC_TWILIO_ACCOUNT_SID,
        process.env.NEXT_PUBLIC_TWILIO_AUTH_TOKEN
      );

      const messages = await client.conversations.v1
        .conversations(conversationId)
        .messages
        .list();

      return messages.map((msg: any) => ({
        id: msg.sid,
        content: msg.body,
        sender: msg.author,
        timestamp: new Date(msg.dateCreated),
        channel: 'twilio',
        read: true // You'll need to implement this
      }));
    } catch (error) {
      console.error('Error fetching Twilio messages:', error);
      throw error;
    }
  }

  static async sendMessage(recipientId: string, content: string) {
    try {
      const client = require('twilio')(
        process.env.NEXT_PUBLIC_TWILIO_ACCOUNT_SID,
        process.env.NEXT_PUBLIC_TWILIO_AUTH_TOKEN
      );

      const message = await client.conversations.v1
        .conversations(recipientId)
        .messages
        .create({ body: content });

      return message;
    } catch (error) {
      console.error('Error sending Twilio message:', error);
      throw error;
    }
  }
}
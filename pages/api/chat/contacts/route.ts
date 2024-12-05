// pages/api/chat/contacts/route.ts
import { NextResponse } from "next/server";
import { TwilioService } from "@/lib/services/twilio-service";
import { FacebookService } from "@/lib/services/facebook-service";
import { createClient } from '@/app/server.server';

interface Message {
  id: string;
  content: string;
  timestamp: string;
  read: boolean;
  sender: string;
}

interface Contact {
  id: string;
  name: string;
  avatar?: string;
  channel: 'twilio' | 'facebook';
  messages?: Message[];
  lastMessage?: Message;
  unreadCount?: number;
}

export async function GET() {
  try {
    // Get the Supabase session
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [twilioContacts, fbContacts] = await Promise.all([
      TwilioService.getContacts(),
      FacebookService.getContacts()
    ]);

    const contacts: Contact[] = [...twilioContacts, ...fbContacts].map(contact => ({
      ...contact,
      unreadCount: contact.messages?.filter((m: Message) => !m.read).length || 0
    }));

    return NextResponse.json(contacts);
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return NextResponse.json(
      { error: "Failed to fetch contacts" },
      { status: 500 }
    );
  }
}
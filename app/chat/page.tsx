"use client";

import { useEffect, useState } from "react";
import { Session } from '@supabase/supabase-js';
import { createClient } from '@/app/server.server';
import { useRouter } from "next/navigation";
import { Search, Phone, Video, MoreVertical, Send, Plus, Paperclip, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { type ChatContact, type ChatMessage } from "@/lib/types";

export default function ChatPage() {
  const [contacts, setContacts] = useState<ChatContact[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selectedContact, setSelectedContact] = useState<ChatContact | null>(null);
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChannel, setSelectedChannel] = useState<"all" | "twilio" | "facebook">("all");
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  // Initialize session
  useEffect(() => {
    const initializeSession = async () => {
      try {
        const supabase = await createClient();
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);
      } catch (error) {
        console.error("Session initialization error:", error);
        toast({
          title: "Error",
          description: "Failed to initialize session",
          variant: "destructive",
        });
      }
    };

    initializeSession();
  }, [toast]);

  // Load contacts when session is available
  useEffect(() => {
    if (!session) {
      router.push("/auth/signin");
      return;
    }

    const loadContacts = async () => {
      try {
        const response = await fetch("/api/chat/contacts");
        if (!response.ok) throw new Error("Failed to load contacts");
        const data = await response.json();
        setContacts(data);
      } catch (error) {
        console.error("Error loading contacts:", error);
        toast({
          title: "Error",
          description: "Failed to load contacts",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadContacts();
  }, [session, router, toast]);

  // Load messages when contact is selected
  useEffect(() => {
    if (!selectedContact) return;

    const loadMessages = async () => {
      try {
        const response = await fetch(`/api/chat/messages?contactId=${selectedContact.id}`);
        if (!response.ok) throw new Error("Failed to load messages");
        const data = await response.json();
        setMessages(data);
      } catch (error) {
        console.error("Error loading messages:", error);
        toast({
          title: "Error",
          description: "Failed to load messages",
          variant: "destructive",
        });
      }
    };

    loadMessages();
  }, [selectedContact, toast]);

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedContact) return;

    try {
      const response = await fetch("/api/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: message,
          recipientId: selectedContact.id,
          channel: selectedContact.channel,
        }),
      });

      if (!response.ok) throw new Error("Failed to send message");

      const newMessage = await response.json();
      setMessages(prev => [...prev, newMessage]);
      setMessage("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesChannel = selectedChannel === "all" || contact.channel === selectedChannel;
    return matchesSearch && matchesChannel;
  });

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="flex h-screen">
      {/* Left Sidebar */}
      <div className="w-80 border-r flex flex-col">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold mb-4">Messages</h1>
          <Tabs value={selectedChannel} onValueChange={(v) => setSelectedChannel(v as "all" | "twilio" | "facebook")} className="mb-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="twilio">SMS</TabsTrigger>
              <TabsTrigger value="facebook">FB</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        
        <ScrollArea className="flex-1">
          {filteredContacts.map((contact) => (
            <div key={contact.id}>
              <button
                className={cn(
                  "w-full p-4 flex items-center gap-3 hover:bg-muted/50",
                  selectedContact?.id === contact.id && "bg-muted"
                )}
                onClick={() => setSelectedContact(contact)}
              >
                <Avatar>
                  <AvatarImage src={contact.avatar} />
                  <AvatarFallback>{contact.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left">
                  <div className="flex justify-between">
                    <span className="font-medium">{contact.name}</span>
                    {contact.lastMessage && (
                      <span className="text-xs text-muted-foreground">
                        {new Date(contact.lastMessage.timestamp).toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                  {contact.lastMessage && (
                    <p className="text-sm text-muted-foreground truncate">
                      {contact.lastMessage.content}
                    </p>
                  )}
                </div>
                {contact.unreadCount > 0 && (
                  <div className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    {contact.unreadCount}
                  </div>
                )}
              </button>
              <Separator />
            </div>
          ))}
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedContact ? (
          <>
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={selectedContact.avatar} />
                  <AvatarFallback>{selectedContact.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-medium">{selectedContact.name}</h2>
                  <p className="text-sm text-muted-foreground capitalize">
                    via {selectedContact.channel}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Video className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "max-w-[70%] rounded-lg px-3 py-2 text-sm",
                      msg.sender === session?.user?.id
                        ? "ml-auto bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    {msg.content}
                    <span
                      className={cn(
                        "block mt-1 text-xs",
                        msg.sender === session?.user?.id
                          ? "text-primary-foreground/80"
                          : "text-muted-foreground"
                      )}
                    >
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="p-4 border-t">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <ImageIcon className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Input
                  placeholder="Type a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  className="flex-1"
                />
                <Button onClick={handleSendMessage}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Select a conversation to start messaging
          </div>
        )}
      </div>
    </div>
  );
}
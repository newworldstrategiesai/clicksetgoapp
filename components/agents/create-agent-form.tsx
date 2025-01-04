// components/agents/create-agent-form.tsx

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth/hooks";

interface AgentFormData {
  agent_name: string;
  company_name: string;
  company_description: string;
  role: string;
  tone_of_voice: string;
  default_voice: string;
  allow_emoji_usage: boolean;
  emoji_limit: string;
  message_length: string;
  ask_for_help: boolean;
  no_personal_info: boolean;
  no_competitors: boolean;
  technical_skills: string;
  company_phone: string;
  company_website: string;
  prompt: string;
}

const ROLES = [
  "Sales Representative",
  "Customer Service",
  "Appointment Scheduler",
  "Lead Qualifier",
  "Information Provider"
];

const VOICE_TONES = [
  "Professional",
  "Friendly",
  "Casual",
  "Formal",
  "Empathetic"
];

export function CreateAgentForm({ onSuccess }: { onSuccess: () => void }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<AgentFormData>({
    agent_name: "",
    company_name: "",
    company_description: "",
    role: ROLES[0],
    tone_of_voice: VOICE_TONES[0],
    default_voice: "nova",
    allow_emoji_usage: false,
    emoji_limit: "2",
    message_length: "medium",
    ask_for_help: true,
    no_personal_info: true,
    no_competitors: true,
    technical_skills: "",
    company_phone: "",
    company_website: "",
    prompt: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setLoading(true);
    try {
      const response = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          user_id: user.id
        })
      });

      if (!response.ok) throw new Error("Failed to create agent");

      toast({
        title: "Success",
        description: "Agent created successfully"
      });
      onSuccess();
    } catch (error) {
      console.error("Error creating agent:", error);
      toast({
        title: "Error",
        description: "Failed to create agent",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6">
        {/* ... other form fields ... */}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select
              value={formData.role}
              onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a role" /> {/* Added placeholder */}
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tone">Tone of Voice</Label>
            <Select
              value={formData.tone_of_voice}
              onValueChange={(value) => setFormData(prev => ({ ...prev, tone_of_voice: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a tone" /> {/* Added placeholder */}
              </SelectTrigger>
              <SelectContent>
                {VOICE_TONES.map((tone) => (
                  <SelectItem key={tone} value={tone}>
                    {tone}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* ... other form fields ... */}
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Creating Agent..." : "Create Agent"}
      </Button>
    </form>
  );
}

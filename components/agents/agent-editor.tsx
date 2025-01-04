// components/agents/agent-editor.tsx

"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { VoicePreview } from "@/components/voice/voice-preview";
import { VoiceAgent } from "@/lib/types";

interface AgentEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (agent: VoiceAgent) => Promise<void>; // Updated to return Promise<void>
  initialData?: VoiceAgent; // Renamed from initialAgent to initialData
}

export function AgentEditor({
  open,
  onOpenChange,
  onSave,
  initialData, // Renamed from initialAgent to initialData
}: AgentEditorProps) {
  const [formData, setFormData] = useState<Partial<VoiceAgent>>(
    initialData || {
      name: "",
      description: "",
      voiceId: "",
      personality: "",
      useCase: "",
      prompts: {
        greeting: "",
        fallback: "",
        closing: "",
      },
      active: true,
    }
  );

  // Update formData when initialData changes (e.g., when editing a different agent)
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        name: "",
        description: "",
        voiceId: "",
        personality: "",
        useCase: "",
        prompts: {
          greeting: "",
          fallback: "",
          closing: "",
        },
        active: true,
      });
    }
  }, [initialData, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (
      formData.name &&
      formData.description &&
      formData.voiceId &&
      formData.personality &&
      formData.useCase &&
      formData.prompts
    ) {
      // Construct the VoiceAgent object
      const agentToSave: VoiceAgent = {
        id: initialData?.id || crypto.randomUUID(), // Preserve id if editing
        name: formData.name,
        description: formData.description,
        voiceId: formData.voiceId,
        personality: formData.personality,
        useCase: formData.useCase,
        prompts: formData.prompts,
        active: formData.active ?? true,
        createdAt: initialData?.createdAt || new Date(), // Preserve createdAt if editing
        updatedAt: new Date(), // Update updatedAt
        user_id: initialData?.user_id || null, // Preserve user_id if editing
      };

      try {
        await onSave(agentToSave); // Await the onSave Promise
        onOpenChange(false); // Close the dialog upon successful save
      } catch (error) {
        console.error("Error saving agent:", error);
        alert("There was an error saving the agent.");
      }
    } else {
      alert("Please fill in all required fields.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Voice Agent" : "Create Voice Agent"}
          </DialogTitle>
          <DialogDescription>
            {initialData
              ? "Update the details of your voice agent."
              : "Configure a new AI voice assistant."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Agent Name and Voice ID */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Agent Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="voiceId">Voice ID</Label>
              <Input
                id="voiceId"
                value={formData.voiceId}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, voiceId: e.target.value }))
                }
                required
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              required
            />
          </div>

          {/* Personality */}
          <div className="space-y-2">
            <Label htmlFor="personality">Personality</Label>
            <Textarea
              id="personality"
              value={formData.personality}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  personality: e.target.value,
                }))
              }
              placeholder="Describe the agent's personality traits..."
              required
            />
          </div>

          {/* Use Case */}
          <div className="space-y-2">
            <Label htmlFor="useCase">Use Case</Label>
            <Textarea
              id="useCase"
              value={formData.useCase}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, useCase: e.target.value }))
              }
              placeholder="Describe when this agent should be used..."
              required
            />
          </div>

          {/* Prompts */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Prompts</h3>
            <div className="space-y-4">
              {/* Greeting Message */}
              <div className="space-y-2">
                <Label htmlFor="greeting">Greeting Message</Label>
                <Textarea
                  id="greeting"
                  value={formData.prompts?.greeting}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      prompts: {
                        ...prev.prompts!,
                        greeting: e.target.value,
                      },
                    }))
                  }
                  required
                />
                {/* Voice Preview for Greeting */}
                {formData.voiceId && (
                  <VoicePreview
                    text={formData.prompts?.greeting || ""}
                    voiceId={formData.voiceId}
                  />
                )}
              </div>

              {/* Fallback Message */}
              <div className="space-y-2">
                <Label htmlFor="fallback">Fallback Message</Label>
                <Textarea
                  id="fallback"
                  value={formData.prompts?.fallback}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      prompts: {
                        ...prev.prompts!,
                        fallback: e.target.value,
                      },
                    }))
                  }
                  required
                />
              </div>

              {/* Closing Message */}
              <div className="space-y-2">
                <Label htmlFor="closing">Closing Message</Label>
                <Textarea
                  id="closing"
                  value={formData.prompts?.closing}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      prompts: {
                        ...prev.prompts!,
                        closing: e.target.value,
                      },
                    }))
                  }
                  required
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {initialData ? "Update Agent" : "Save Agent"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

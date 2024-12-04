"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Mail, MessageSquare, Phone, PlayCircle, Send } from "lucide-react";
import { VoicePreview } from "@/components/voice/voice-preview";
import { useToast } from "@/hooks/use-toast";

type CampaignType = "email" | "sms" | "voice";

interface CampaignData {
  type: CampaignType;
  subject?: string;
  content: string;
  voiceId?: string;
  schedule?: Date;
  segment?: string;
}

export default function MarketingPage() {
  const [campaignType, setCampaignType] = useState<CampaignType>("email");
  const [campaignData, setCampaignData] = useState<CampaignData>({
    type: "email",
    subject: "",
    content: "",
  });
  const [previewMode, setPreviewMode] = useState(false);
  const { toast } = useToast();

  const handleSendCampaign = async () => {
    try {
      // In a real app, this would make an API call
      toast({
        title: "Campaign Scheduled",
        description: "Your campaign has been scheduled for sending.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to schedule campaign",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Marketing Campaigns</h1>
          <p className="text-muted-foreground mt-2">
            Create and manage your marketing campaigns
          </p>
        </div>
        <Button onClick={handleSendCampaign}>
          <Send className="mr-2 h-4 w-4" />
          Send Campaign
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <Card className="p-6">
            <Tabs
              value={campaignType}
              onValueChange={(value) => setCampaignType(value as CampaignType)}
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </TabsTrigger>
                <TabsTrigger value="sms" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  SMS
                </TabsTrigger>
                <TabsTrigger value="voice" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Voice
                </TabsTrigger>
              </TabsList>

              <TabsContent value="email" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject Line</Label>
                  <Input
                    id="subject"
                    value={campaignData.subject}
                    onChange={(e) =>
                      setCampaignData((prev) => ({
                        ...prev,
                        subject: e.target.value,
                      }))
                    }
                    placeholder="Enter email subject"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emailContent">Email Content</Label>
                  <Textarea
                    id="emailContent"
                    value={campaignData.content}
                    onChange={(e) =>
                      setCampaignData((prev) => ({
                        ...prev,
                        content: e.target.value,
                      }))
                    }
                    rows={10}
                    placeholder="Enter email content"
                  />
                </div>
              </TabsContent>

              <TabsContent value="sms" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="smsContent">Message Content</Label>
                  <Textarea
                    id="smsContent"
                    value={campaignData.content}
                    onChange={(e) =>
                      setCampaignData((prev) => ({
                        ...prev,
                        content: e.target.value,
                      }))
                    }
                    rows={4}
                    placeholder="Enter SMS content"
                  />
                  <p className="text-sm text-muted-foreground">
                    Characters: {campaignData.content.length}/160
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="voice" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="voiceId">Voice Selection</Label>
                  <Select
                    value={campaignData.voiceId}
                    onValueChange={(value) =>
                      setCampaignData((prev) => ({ ...prev, voiceId: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a voice" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="voice1">Sarah (Professional)</SelectItem>
                      <SelectItem value="voice2">John (Friendly)</SelectItem>
                      <SelectItem value="voice3">Emma (Energetic)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="voiceContent">Voice Script</Label>
                  <Textarea
                    id="voiceContent"
                    value={campaignData.content}
                    onChange={(e) =>
                      setCampaignData((prev) => ({
                        ...prev,
                        content: e.target.value,
                      }))
                    }
                    rows={6}
                    placeholder="Enter voice script"
                  />
                  {campaignData.voiceId && (
                    <div className="mt-4">
                      <Button
                        variant="outline"
                        onClick={() => setPreviewMode(!previewMode)}
                      >
                        <PlayCircle className="h-4 w-4 mr-2" />
                        Preview Voice
                      </Button>
                      {previewMode && (
                        <VoicePreview
                          text={campaignData.content}
                          voiceId={campaignData.voiceId}
                        />
                      )}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Campaign Settings</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="segment">Audience Segment</Label>
                <Select
                  value={campaignData.segment}
                  onValueChange={(value) =>
                    setCampaignData((prev) => ({ ...prev, segment: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select audience segment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Contacts</SelectItem>
                    <SelectItem value="leads">Active Leads</SelectItem>
                    <SelectItem value="clients">Current Clients</SelectItem>
                    <SelectItem value="past-clients">Past Clients</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="schedule">Schedule</Label>
                <Input
                  id="schedule"
                  type="datetime-local"
                  onChange={(e) =>
                    setCampaignData((prev) => ({
                      ...prev,
                      schedule: new Date(e.target.value),
                    }))
                  }
                />
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Campaign Preview</h2>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">Campaign Details</h3>
              <dl className="space-y-2">
                <div className="grid grid-cols-3">
                  <dt className="text-muted-foreground">Type:</dt>
                  <dd className="col-span-2 capitalize">{campaignType}</dd>
                </div>
                {campaignType === "email" && (
                  <div className="grid grid-cols-3">
                    <dt className="text-muted-foreground">Subject:</dt>
                    <dd className="col-span-2">{campaignData.subject}</dd>
                  </div>
                )}
                <div className="grid grid-cols-3">
                  <dt className="text-muted-foreground">Content:</dt>
                  <dd className="col-span-2 whitespace-pre-wrap">
                    {campaignData.content}
                  </dd>
                </div>
                <div className="grid grid-cols-3">
                  <dt className="text-muted-foreground">Segment:</dt>
                  <dd className="col-span-2 capitalize">
                    {campaignData.segment || "Not selected"}
                  </dd>
                </div>
                <div className="grid grid-cols-3">
                  <dt className="text-muted-foreground">Schedule:</dt>
                  <dd className="col-span-2">
                    {campaignData.schedule
                      ? formatDate(campaignData.schedule)
                      : "Send immediately"}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="p-4 border rounded-lg">
              <h3 className="font-medium mb-2">Estimated Reach</h3>
              <dl className="space-y-2">
                <div className="grid grid-cols-3">
                  <dt className="text-muted-foreground">Recipients:</dt>
                  <dd className="col-span-2">250 contacts</dd>
                </div>
                <div className="grid grid-cols-3">
                  <dt className="text-muted-foreground">Estimated Cost:</dt>
                  <dd className="col-span-2">$25.00</dd>
                </div>
              </dl>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function formatDate(date: Date): string {
  return date.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
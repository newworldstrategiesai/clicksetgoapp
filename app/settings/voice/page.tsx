// app/settings/voice/page.tsx

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VoicePreview } from "@/components/voice/voice-preview";
import { useToast } from "@/hooks/use-toast";

export default function VoiceSettingsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    useCustomVoice: false,
    defaultGreeting: "Hello, thank you for calling M10 DJ Company. How can I help you today?",
    elevenlabsApiKey: "",
    voiceId: "",
    maxRecordingDuration: 300,
    transcribeRecordings: true,
    notificationEmail: "",
    notificationSMS: "",
    businessHours: {
      start: "09:00",
      end: "17:00",
    },
    responses: {
      afterHours: "We're currently closed. Please leave a message and we'll get back to you during business hours.",
      voicemail: "Please leave a message after the tone.",
      unavailable: "Sorry, we're unable to take your call right now. Please try again later.",
    },
  });

  // Add any additional logic or hooks here

  return (
    <div className="p-8">
      <Tabs defaultValue="voice">
        <TabsList className="mb-4">
          <TabsTrigger value="voice">Voice Configuration</TabsTrigger>
          <TabsTrigger value="responses">Response Templates</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="hours">Business Hours</TabsTrigger>
        </TabsList>

        <TabsContent value="voice">
          <Card className="p-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Use Custom Voice</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable ElevenLabs voice synthesis
                  </p>
                </div>
                <Switch
                  checked={settings.useCustomVoice}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({ ...prev, useCustomVoice: checked }))
                  }
                />
              </div>

              {settings.useCustomVoice && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="elevenlabsApiKey">ElevenLabs API Key</Label>
                    <Input
                      id="elevenlabsApiKey"
                      type="password"
                      value={settings.elevenlabsApiKey}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          elevenlabsApiKey: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="voiceId">Voice ID</Label>
                    <Input
                      id="voiceId"
                      value={settings.voiceId}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          voiceId: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <VoicePreview
                    text={settings.defaultGreeting}
                    voiceId={settings.voiceId}
                  />
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="defaultGreeting">Default Greeting</Label>
                <Textarea
                  id="defaultGreeting"
                  value={settings.defaultGreeting}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      defaultGreeting: e.target.value,
                    }))
                  }
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxRecordingDuration">
                  Max Recording Duration (seconds)
                </Label>
                <Input
                  id="maxRecordingDuration"
                  type="number"
                  min="60"
                  max="600"
                  value={settings.maxRecordingDuration}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      maxRecordingDuration: parseInt(e.target.value, 10),
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Transcribe Recordings</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically transcribe voice messages
                  </p>
                </div>
                <Switch
                  checked={settings.transcribeRecordings}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({
                      ...prev,
                      transcribeRecordings: checked,
                    }))
                  }
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="responses">
          <Card className="p-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="afterHours">After Hours Message</Label>
                <Textarea
                  id="afterHours"
                  value={settings.responses.afterHours}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      responses: {
                        ...prev.responses,
                        afterHours: e.target.value,
                      },
                    }))
                  }
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="voicemail">Voicemail Prompt</Label>
                <Textarea
                  id="voicemail"
                  value={settings.responses.voicemail}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      responses: {
                        ...prev.responses,
                        voicemail: e.target.value,
                      },
                    }))
                  }
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unavailable">Unavailable Message</Label>
                <Textarea
                  id="unavailable"
                  value={settings.responses.unavailable}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      responses: {
                        ...prev.responses,
                        unavailable: e.target.value,
                      },
                    }))
                  }
                  rows={3}
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="p-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="notificationEmail">Notification Email</Label>
                <Input
                  id="notificationEmail"
                  type="email"
                  value={settings.notificationEmail}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      notificationEmail: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notificationSMS">Notification SMS Number</Label>
                <Input
                  id="notificationSMS"
                  type="tel"
                  value={settings.notificationSMS}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      notificationSMS: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="hours">
          <Card className="p-6">
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="businessStart">Business Hours Start</Label>
                  <Input
                    id="businessStart"
                    type="time"
                    value={settings.businessHours.start}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        businessHours: {
                          ...prev.businessHours,
                          start: e.target.value,
                        },
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessEnd">Business Hours End</Label>
                  <Input
                    id="businessEnd"
                    type="time"
                    value={settings.businessHours.end}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        businessHours: {
                          ...prev.businessHours,
                          end: e.target.value,
                        },
                      }))
                    }
                  />
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

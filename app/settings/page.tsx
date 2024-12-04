
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    twilio: {
      accountSid: "",
      authToken: "",
      phoneNumber: "",
    },
    sendgrid: {
      apiKey: "",
      fromEmail: "",
      fromName: "",
    },
    elevenlabs: {
      apiKey: "",
    },
    stripe: {
      publishableKey: "",
      secretKey: "",
    },
    business: {
      name: "",
      address: "",
      phone: "",
      email: "",
      website: "",
      timezone: "",
      businessHours: {
        start: "09:00",
        end: "17:00",
      },
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: true,
      notificationEmail: "",
      notificationPhone: "",
    },
  });

  const handleSave = async () => {
    try {
      // In a real app, this would make an API call to save settings
      toast({
        title: "Settings saved",
        description: "Your settings have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-2">
            Configure your DJ Management Tool settings and integrations
          </p>
        </div>
        <Button onClick={handleSave}>Save Changes</Button>
      </div>

      <Tabs defaultValue="integrations">
        <TabsList className="mb-4">
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="business">Business Details</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="voice">Voice Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="integrations">
          <div className="grid gap-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Twilio Integration</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="twilioAccountSid">Account SID</Label>
                    <Input
                      id="twilioAccountSid"
                      type="password"
                      value={settings.twilio.accountSid}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          twilio: {
                            ...prev.twilio,
                            accountSid: e.target.value,
                          },
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="twilioAuthToken">Auth Token</Label>
                    <Input
                      id="twilioAuthToken"
                      type="password"
                      value={settings.twilio.authToken}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          twilio: {
                            ...prev.twilio,
                            authToken: e.target.value,
                          },
                        }))
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="twilioPhone">Phone Number</Label>
                  <Input
                    id="twilioPhone"
                    value={settings.twilio.phoneNumber}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        twilio: {
                          ...prev.twilio,
                          phoneNumber: e.target.value,
                        },
                      }))
                    }
                  />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">SendGrid Integration</h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sendgridApiKey">API Key</Label>
                  <Input
                    id="sendgridApiKey"
                    type="password"
                    value={settings.sendgrid.apiKey}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        sendgrid: {
                          ...prev.sendgrid,
                          apiKey: e.target.value,
                        },
                      }))
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fromEmail">From Email</Label>
                    <Input
                      id="fromEmail"
                      type="email"
                      value={settings.sendgrid.fromEmail}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          sendgrid: {
                            ...prev.sendgrid,
                            fromEmail: e.target.value,
                          },
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fromName">From Name</Label>
                    <Input
                      id="fromName"
                      value={settings.sendgrid.fromName}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          sendgrid: {
                            ...prev.sendgrid,
                            fromName: e.target.value,
                          },
                        }))
                      }
                    />
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Stripe Integration</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="stripePublishable">Publishable Key</Label>
                    <Input
                      id="stripePublishable"
                      type="password"
                      value={settings.stripe.publishableKey}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          stripe: {
                            ...prev.stripe,
                            publishableKey: e.target.value,
                          },
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stripeSecret">Secret Key</Label>
                    <Input
                      id="stripeSecret"
                      type="password"
                      value={settings.stripe.secretKey}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          stripe: {
                            ...prev.stripe,
                            secretKey: e.target.value,
                          },
                        }))
                      }
                    />
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="business">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Business Information</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    value={settings.business.name}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        business: {
                          ...prev.business,
                          name: e.target.value,
                        },
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessPhone">Business Phone</Label>
                  <Input
                    id="businessPhone"
                    value={settings.business.phone}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        business: {
                          ...prev.business,
                          phone: e.target.value,
                        },
                      }))
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessAddress">Business Address</Label>
                <Input
                  id="businessAddress"
                  value={settings.business.address}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      business: {
                        ...prev.business,
                        address: e.target.value,
                      },
                    }))
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="businessEmail">Business Email</Label>
                  <Input
                    id="businessEmail"
                    type="email"
                    value={settings.business.email}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        business: {
                          ...prev.business,
                          email: e.target.value,
                        },
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessWebsite">Website</Label>
                  <Input
                    id="businessWebsite"
                    value={settings.business.website}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        business: {
                          ...prev.business,
                          website: e.target.value,
                        },
                      }))
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="businessHoursStart">Business Hours Start</Label>
                  <Input
                    id="businessHoursStart"
                    type="time"
                    value={settings.business.businessHours.start}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        business: {
                          ...prev.business,
                          businessHours: {
                            ...prev.business.businessHours,
                            start: e.target.value,
                          },
                        },
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessHoursEnd">Business Hours End</Label>
                  <Input
                    id="businessHoursEnd"
                    type="time"
                    value={settings.business.businessHours.end}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        business: {
                          ...prev.business,
                          businessHours: {
                            ...prev.business.businessHours,
                            end: e.target.value,
                          },
                        },
                      }))
                    }
                  />
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Notification Settings</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="notificationEmail">Notification Email</Label>
                  <Input
                    id="notificationEmail"
                    type="email"
                    value={settings.notifications.notificationEmail}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        notifications: {
                          ...prev.notifications,
                          notificationEmail: e.target.value,
                        },
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notificationPhone">Notification Phone</Label>
                  <Input
                    id="notificationPhone"
                    value={settings.notifications.notificationPhone}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        notifications: {
                          ...prev.notifications,
                          notificationPhone: e.target.value,
                        },
                      }))
                    }
                  />
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="voice">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">ElevenLabs Integration</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="elevenlabsApiKey">API Key</Label>
                <Input
                  id="elevenlabsApiKey"
                  type="password"
                  value={settings.elevenlabs.apiKey}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      elevenlabs: {
                        ...prev.elevenlabs,
                        apiKey: e.target.value,
                      },
                    }))
                  }
                />
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

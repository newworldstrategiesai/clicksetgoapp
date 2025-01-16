  "use client";

  import React, { useState } from "react";
  import { useRouter } from "next/navigation";
  import { Button } from "@/components/ui/button";
  import { Card } from "@/components/ui/card";
  import { Input } from "@/components/ui/input";
  import { Label } from "@/components/ui/label";
  import { Switch } from "@/components/ui/switch";
  import { useToast } from "@/hooks/use-toast";

    const NotificationPreferencesPage: React.FC<{ userId: string}>=({userId}) => {
    const [preferences, setPreferences] = useState({
      smsEnabled: true,
      emailEnabled: false,
      email: "",
    });
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      if (preferences.emailEnabled && !preferences.email) {
        toast({
          title: "Error",
          description: "Please enter an email address for notifications",
          variant: "destructive",
        });
        return;
      }

      setLoading(true);
      console.log(preferences);
      try {
        const response = await fetch("/api/notification-preferences", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...preferences, userId }),
        });

        if (!response.ok) throw new Error("Failed to save preferences");

        toast({
          title: "Success",
          description: "Notification preferences saved successfully",
        });
        
        router.push("/onboarding/assistant");
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to save preferences. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="container max-w-md mx-auto p-8">
        <Card className="p-6 space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-bold">Notification Preferences</h1>
            <p className="text-muted-foreground">
              Choose how you want to receive notifications about calls and messages
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>SMS Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications about missed calls and messages via SMS
                  </p>
                </div>
                <Switch
                  checked={preferences.smsEnabled}
                  onCheckedChange={(checked) =>
                    setPreferences((prev) => ({ ...prev, smsEnabled: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive detailed notifications and summaries via email
                  </p>
                </div>
                <Switch
                  checked={preferences.emailEnabled}
                  onCheckedChange={(checked) =>
                    setPreferences((prev) => ({ ...prev, emailEnabled: checked }))
                  }
                />
              </div>

              {preferences.emailEnabled && (
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={preferences.email}
                    onChange={(e) =>
                      setPreferences((prev) => ({ ...prev, email: e.target.value }))
                    }
                    placeholder="Enter your email address"
                    required
                  />
                </div>
              )}
            </div>

            <Button type="submit" className="w-full bg-black text-white dark:bg-white dark:text-black" disabled={loading}>
              {loading ? "Saving..." : "Save Preferences"}
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  export default NotificationPreferencesPage
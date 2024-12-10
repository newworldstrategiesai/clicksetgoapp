// app/onboarding/assistant/page.tsx

"use client";
import { Phone, Calendar } from "lucide-react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useOnboarding } from "@/context/OnboardingContext";
import { useUser } from "@/context/UserContext";

export default function AssistantSetupPage() {
  const [formData, setFormData] = useState({
    businessName: "",
    description: "",
    role: "receptionist",
    allowAppointments: false,
    defaultDuration: 30,
    breakTime: 15,
  });
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const { toast } = useToast();
  const { setStep } = useOnboarding();
  const { userId } = useUser();

  useEffect(() => {
    if (!userId) {
      router.push("/sign-in");
    }

    // Optionally, fetch existing assistant setup data
    const fetchAssistantData = async () => {
      try {
        const response = await fetch("/api/assistant-setup", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) throw new Error("Failed to fetch assistant settings");

        const data = await response.json();
        setFormData({
          businessName: data.businessName || "",
          description: data.description || "",
          role: data.role || "receptionist",
          allowAppointments: data.allowAppointments || false,
          defaultDuration: data.defaultDuration || 30,
          breakTime: data.breakTime || 15,
        });
      } catch (error) {
        console.error("Error fetching assistant settings:", error);
        // Optionally, handle the error (e.g., show a toast)
      }
    };

    fetchAssistantData();
  }, [userId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.businessName) {
      toast({
        title: "Error",
        description: "Please enter your business name",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/assistant-setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to save assistant settings");

      toast({
        title: "Success",
        description: "AI Assistant configured successfully",
      });

      // Update onboarding step
      setStep(5);

      router.push("/onboarding/trial");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to configure assistant. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto p-8">
      <Card className="p-6 space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">Configure Your AI Assistant</h1>
          <p className="text-muted-foreground">
            Customize how your AI assistant handles calls and appointments
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6">
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name</Label>
              <Input
                id="businessName"
                value={formData.businessName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    businessName: e.target.value,
                  }))
                }
                placeholder="Enter your business name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Business Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Briefly describe your business and services"
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-0.5">
                <div className="font-medium">Call Forwarding Setup</div>
                <p className="text-sm text-muted-foreground">
                  Dial **21*{process.env.NEXT_PUBLIC_TWILIO_PHONE}# to forward missed calls
                </p>
              </div>
              <Phone className="h-5 w-5 text-muted-foreground" />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Appointment Scheduling</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow the AI assistant to schedule appointments with callers
                  </p>
                </div>
                <Switch
                  checked={formData.allowAppointments}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      allowAppointments: checked,
                    }))
                  }
                />
              </div>

              {formData.allowAppointments && (
                <div className="grid gap-4 p-4 border rounded-lg">
                  <div className="space-y-2">
                    <Label htmlFor="defaultDuration">Default Event Duration (minutes)</Label>
                    <Input
                      id="defaultDuration"
                      type="number"
                      min={15}
                      step={15}
                      value={formData.defaultDuration}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          defaultDuration: parseInt(e.target.value),
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="breakTime">Break Time Between Events (minutes)</Label>
                    <Input
                      id="breakTime"
                      type="number"
                      min={0}
                      step={5}
                      value={formData.breakTime}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          breakTime: parseInt(e.target.value),
                        }))
                      }
                    />
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() =>
                      window.open(
                        "https://calendar.google.com/calendar/u/0/r/settings/addcalendar"
                      )
                    }
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Connect Google Calendar
                  </Button>
                </div>
              )}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Saving..." : "Continue"}
          </Button>
        </form>
      </Card>
    </div>
  );
}

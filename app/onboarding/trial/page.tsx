"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Star, Calendar, MessageSquare, Phone, Bot } from "lucide-react";

const TRIAL_FEATURES = [
  {
    icon: Phone,
    title: "AI Call Handling",
    description: "Professional AI assistant handles your missed calls",
  },
  {
    icon: Calendar,
    title: "Smart Scheduling",
    description: "Automated appointment booking and management",
  },
  {
    icon: MessageSquare,
    title: "SMS & Email Updates",
    description: "Real-time notifications and call summaries",
  },
  {
    icon: Bot,
    title: "Custom Voice Assistant",
    description: "Personalized AI voice and responses",
  },
];

export default function TrialInformationPage() {
  const router = useRouter();

  const handleStart = () => {
    router.push("/dashboard");
  };

  return (
    <div className="container max-w-3xl mx-auto p-8">
      <Card className="p-8 space-y-8">
        <div className="space-y-2 text-center">
          <div className="flex justify-center">
            <div className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800">
              <Star className="h-4 w-4 mr-1" />
              90-Day Free Trial
            </div>
          </div>
          <h1 className="text-3xl font-bold">Welcome to Click Set Go</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            You're all set! Your 90-day trial starts now. Experience the full power
            of our AI-powered DJ business management platform.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {TRIAL_FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="flex items-start gap-4 p-4 rounded-lg border"
            >
              <div className="rounded-lg bg-primary/10 p-2">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <div className="space-y-1">
                <h3 className="font-medium">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-muted/50 rounded-lg p-6 space-y-4">
          <h2 className="font-semibold">During Your Trial:</h2>
          <ul className="space-y-3">
            {[
              "Full access to all premium features",
              "Unlimited AI-handled calls",
              "SMS summaries with marketing URLs",
              "Priority support via email and chat",
              "No credit card required",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span className="text-sm">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="text-center space-y-4">
          <Button onClick={handleStart} size="lg" className="px-8">
            Start Using Click Set Go
          </Button>
          <p className="text-sm text-muted-foreground">
            You can upgrade or modify your plan at any time during the trial
          </p>
        </div>
      </Card>
    </div>
  );
}
// app/onboarding/phone/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import PhoneInput from "react-phone-number-input";
import { isValidPhoneNumber } from "libphonenumber-js";
import { useToast } from "@/hooks/use-toast";
import "react-phone-number-input/style.css";
import { useOnboarding } from "@/context/OnboardingContext";

  const PhoneVerificationPage : React.FC<{ userId: string}> = ({userId}) =>{
  const [mounted, setMounted] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const { toast } = useToast();
  const { setStep } = useOnboarding();
  
  useEffect(() => {
    setMounted(true);
    if (!userId) {
      router.push("/sign-in");
    }
  }, [userId]);

  if (!mounted) {
    return (
      <div className="container max-w-md mx-auto p-8">
        <Card className="p-6 space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded mb-4" />
            <div className="h-32 bg-muted rounded" />
          </div>
        </Card>
      </div>
    );
  }

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!isValidPhoneNumber(phoneNumber)) {
    toast({
      title: "Invalid Phone Number",
      description: "Please enter a valid phone number",
      variant: "destructive",
    });
    return;
  }

  try {
    const response = await fetch("/api/send-verification-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phoneNumber }),
    });

    if (!response.ok) throw new Error("Failed to send verification code");

    toast({
      title: "Verification Code Sent",
      description: "Please check your phone for the verification code",
    });

    setStep(1, "phone");
    router.push(`/onboarding/verify?phone=${encodeURIComponent(phoneNumber)}`);
  } catch (error) {
    toast({
      title: "Error",
      description: "Failed to send verification code. Please try again.",
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
          <h1 className="text-2xl font-bold">Verify Your Phone Number</h1>
          <p className="text-muted-foreground">
            Enter your phone number to receive a verification code
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <PhoneInput
              international
              defaultCountry="US"
              value={phoneNumber}
              onChange={(value) => setPhoneNumber(value || "")}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Enter phone number"
              required
            />
          </div>

          <Button type="submit" className="w-full bg-black text-white dark:bg-white dark:text-black" disabled={!phoneNumber || loading}>
            {loading ? "Sending Code..." : "Send Verification Code"}
          </Button>
        </form>
      </Card>
    </div>
  );
}

export default PhoneVerificationPage
"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useOnboarding } from "@/context/OnboardingContext";

// Helper function to parse the phone number into country code and phone number
const parsePhoneNumber = (phoneNumber: string) => {
  // Remove spaces, dashes, or parentheses to simplify matching
  phoneNumber = phoneNumber.replace(/[\s\(\)\-]/g, '');

  // Ensure the phone number has at least 10 digits
  if (phoneNumber.length < 10) {
    return ['', phoneNumber];  // Return empty country code if the number is too short
  }

  // Get the last 10 digits as the phone number
  const phoneWithoutCountryCode = phoneNumber.slice(-10);

  // Get the rest of the number as the country code
  const countryCode = phoneNumber.slice(0, phoneNumber.length - 10);

  return [countryCode, phoneWithoutCountryCode];
};

const VerifyCodePage:React.FC<{ userId: string}> = ({userId}) =>{
  const [code, setCode] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [attemptsLeft, setAttemptsLeft] = useState<number>(5); // Match backend MAX_ATTEMPTS
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { setStep } = useOnboarding();
  const phoneNumber = searchParams?.get("phone") || "";

  // Assuming the phone number includes the country code
  const [countryCode, phoneWithoutCountryCode] = parsePhoneNumber(phoneNumber);
  console.log(countryCode, phoneWithoutCountryCode);

  useEffect(() => {
    if (!userId) {
      router.push("/sign-in");
      return;
    }

    if (!phoneNumber) {
      toast({
        title: "Error",
        description: "Phone number is missing from the URL parameters.",
        variant: "destructive",
      });
      router.push("/onboarding/phone");
      return;
    }

    // Countdown timer for resend cooldown
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [phoneNumber, toast, router, userId]);

  const handleResend = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/send-verification-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber }),
      });

      if (!response.ok) throw new Error("Failed to resend code");

      toast({
        title: "Code Resent",
        description: "A new verification code has been sent to your phone",
      });
      setTimeLeft(60);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resend code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/verify-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          phoneNumber,
          phoneWithoutCC: phoneWithoutCountryCode, 
          countryCode,
          userId, 
          code 
        }),
        credentials: "same-origin",
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Invalid verification code");

      toast({
        title: "Success",
        description: "Phone number verified successfully.",
      });

      setStep(2, "carrier");
      router.push(`/onboarding/carrier?phone=${encodeURIComponent(phoneNumber)}`);
    } catch (error: any) {
      setAttemptsLeft((prev) => (prev > 0 ? prev - 1 : 0));

      if (attemptsLeft <= 1) {
        toast({
          title: "Error",
          description: "Maximum attempts reached. Please request a new OTP.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Invalid verification code. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Rest of the component remains the same...
  return (
    <div className="container max-w-md mx-auto p-8">
      <Card className="p-6 space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">Enter Verification Code</h1>
          <p className="text-muted-foreground">
            We sent a code to {phoneNumber}
          </p>
          {attemptsLeft < 5 && (
            <p className="text-sm text-red-600">
              {attemptsLeft} attempt{attemptsLeft !== 1 ? "s" : ""} left
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="Enter 6-digit code"
              className="text-center text-2xl tracking-widest"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-black text-white dark:bg-white dark:text-black"
            disabled={code.length !== 6 || loading || attemptsLeft <= 0}
          >
            {loading ? "Verifying..." : "Verify Code"}
          </Button>

          <div className="text-center">
            <Button
              type="button"
              variant="ghost"
              disabled={timeLeft > 0 || loading}
              onClick={handleResend}
            >
              {timeLeft > 0
                ? `Resend code in ${timeLeft}s`
                : "Resend verification code"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default VerifyCodePage;
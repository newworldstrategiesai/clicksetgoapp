// app/onboarding/verify/page.tsx

"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useOnboarding } from "@/context/OnboardingContext";
import { useUser } from "@/context/UserContext";

export default function VerifyCodePage() {
  const [code, setCode] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { setStep } = useOnboarding();
  const { userId } = useUser();

  const phoneNumber = searchParams?.get("phone") || "";

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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber, code }),
      });

      if (!response.ok) throw new Error("Invalid verification code");

      toast({
        title: "Success",
        description: "Phone number verified successfully",
      });

      // Update onboarding step
      setStep(2);

      router.push("/onboarding/carrier");
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid verification code. Please try again.",
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
          <h1 className="text-2xl font-bold">Enter Verification Code</h1>
          <p className="text-muted-foreground">
            We sent a code to {phoneNumber}
          </p>
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
            className="w-full"
            disabled={code.length !== 6 || loading}
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

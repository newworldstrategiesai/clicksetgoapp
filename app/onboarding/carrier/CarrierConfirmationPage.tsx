// app/onboarding/carrier/page.tsx

"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { AddCallerIDModal } from "@/components/onboarding/add-caller-id-modal";
import { useOnboarding } from "@/context/OnboardingContext";

const CARRIERS = [
  "AT&T",
  "Verizon",
  "T-Mobile",
  "Sprint",
  "US Cellular",
  "Other",
];

  const CarrierConfirmationPage : React.FC<{ userId: string}> = ({userId}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [carrier, setCarrier] = useState<string>("");
  const [detectedCarrier, setDetectedCarrier] = useState<string>("");
  const [showCallerIdModal, setShowCallerIdModal] = useState<boolean>(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { setStep } = useOnboarding();

  const phoneNumber = searchParams?.get("phone");

  useEffect(() => {
    if (!userId) {
      router.push("/sign-in");
      return;
    }

    if (!phoneNumber) {
      setLoading(false);
      toast({
        title: "Error",
        description: "Phone number is missing from the URL parameters.",
        variant: "destructive",
      });
      router.push("/onboarding/phone");
      return;
    }

    const detectCarrier = async () => {
      try {
        const response = await fetch("/api/carrier-lookup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phoneNumber }),
        });

        if (!response.ok) throw new Error("Failed to detect carrier");

        const data = await response.json();
        setDetectedCarrier(data.carrier);
        setCarrier(data.carrier);
      } catch (error) {
        console.error("Error detecting carrier:", error);
        toast({
          title: "Error",
          description: "Failed to detect carrier. Please select manually.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    detectCarrier();
  }, [phoneNumber, toast, router, userId]);

  const handleConfirm = () => {
    if (!carrier) {
      toast({
        title: "Error",
        description: "Please select your carrier",
        variant: "destructive",
      });
      return;
    }

    setShowCallerIdModal(true);
  };

  const handleCallerIdSuccess = () => {
    toast({
      title: "Success",
      description: "Phone number verified successfully",
    });

    // Update onboarding step
    setStep(3);

    router.push("/onboarding/notifications");
  };

  if (loading) {
    return (
      <div className="container max-w-md mx-auto p-8">
        <Card className="p-6">
          <div className="text-center">Loading carrier information...</div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-md mx-auto p-8">
      <Card className="p-6 space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">Confirm Your Carrier</h1>
          <p className="text-muted-foreground">
            We detected your carrier as {detectedCarrier || "Unknown"}. Is this correct?
          </p>
        </div>

        <div className="space-y-4">
          <Select value={carrier} onValueChange={setCarrier}>
            <SelectTrigger>
              <SelectValue placeholder="Select your carrier" />
            </SelectTrigger>
            <SelectContent>
              {CARRIERS.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            onClick={handleConfirm}
            className="w-full"
            disabled={!carrier}
          >
            Confirm & Continue
          </Button>
        </div>
      </Card>

      {showCallerIdModal && phoneNumber && (
        <AddCallerIDModal
          isOpen={showCallerIdModal}
          onClose={() => setShowCallerIdModal(false)}
          onSuccess={handleCallerIdSuccess}
          phoneNumber={phoneNumber}
        />
      )}
    </div>
  );
}

export default CarrierConfirmationPage
// components/onboarding/add-caller-id-modal.tsx

'use client';

import React, { useState } from "react";
import Modal from "@/components/ui/Modal"; // Ensure correct path and export
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card"; // **Import Card**
import { Calendar, Phone } from "lucide-react"; // **Import Icons**

interface AddCallerIDModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  phoneNumber: string;
}

export const AddCallerIDModal: React.FC<AddCallerIDModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  phoneNumber,
}) => {
  const [verificationCode, setVerificationCode] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const { toast } = useToast();

  const handleVerify = async () => {
    if (!verificationCode) {
      toast({
        title: "Error",
        description: "Please enter the verification code.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/verify-caller-id", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber, verificationCode }),
      });

      if (!response.ok) throw new Error("Verification failed");

      toast({
        title: "Success",
        description: "Caller ID verified successfully.",
      });

      onSuccess();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to verify Caller ID. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Card className="p-6 space-y-6">
        <div className="space-y-2 text-center">
          <h2 className="text-xl font-bold">Verify Caller ID</h2>
          <p className="text-muted-foreground">
            Enter the verification code sent to {phoneNumber}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="verificationCode">Verification Code</Label>
          <Input
            id="verificationCode"
            type="text"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            placeholder="Enter the 6-digit code"
            maxLength={6}
            required
          />
        </div>

        <Button onClick={handleVerify} disabled={loading}>
          {loading ? "Verifying..." : "Verify"}
        </Button>
      </Card>
    </Modal>
  );
};

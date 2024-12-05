// components/AddCallerIDModal.tsx

"use client";

import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

interface AddCallerIDModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  twilioSid: string;
  twilioAuthToken: string;
}

const AddCallerIDModal: React.FC<AddCallerIDModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  twilioSid,
  twilioAuthToken,
}) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [validationCode, setValidationCode] = useState<number | null>(null);

  const initiateVerification = async () => {
    setLoading(true);
    try {
      const response = await axios.post("/api/initiate-caller-id-verification", {
        phoneNumber,
        twilioSid,
        twilioAuthToken,
      });

      const { validationCode } = response.data;

      setValidationCode(validationCode);

      toast.success(
        "Verification initiated. You will receive a call shortly."
      );
    } catch (error) {
      console.error("Error initiating verification:", error);
      toast.error("Failed to initiate verification.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center dark:bg-black bg-opacity-70 z-50">
      <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md mx-auto relative shadow-lg">
        <h2 className="text-2xl font-semibold mb-4 dark:text-white">
          Add Verified Caller ID
        </h2>
        {!validationCode ? (
          <>
            <label className="block mb-2 dark:text-white">
              Phone Number:
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full mt-1 p-2 dark:bg-black rounded border border-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
              />
            </label>
            <button
              onClick={initiateVerification}
              className="mt-4 px-4 py-2 bg-blue-600 dark:text-white font-semibold rounded hover:bg-blue-500"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Verification Code"}
            </button>
          </>
        ) : (
          <div className="text-white">
            <p>
              You will receive a call from Twilio shortly. When prompted, please enter the following validation code:
            </p>
            <p className="text-4xl font-bold my-4">{validationCode}</p>
            <p>
              After completing the call, your number will be verified and added to your Twilio account.
            </p>
            <button
              onClick={() => {
                onSuccess();
                onClose();
                setValidationCode(null);
                setPhoneNumber(""); // Reset phone number input
              }}
              className="mt-4 px-4 py-2 bg-green-600 dark:text-white font-semibold rounded hover:bg-green-500"
            >
              Done
            </button>
          </div>
        )}
        <button
          onClick={() => {
            onClose();
            setValidationCode(null);
            setPhoneNumber("");
          }}
          className="absolute top-2 right-2 text-gray-400 hover:text-white focus:outline-none"
          aria-label="Close"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default AddCallerIDModal;

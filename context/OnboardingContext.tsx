"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useUser } from "@/context/UserContext"; // Assumes you have an AuthContext
import { supabase } from "@/utils/supabaseClient"; // Assumes you are using Supabase

interface OnboardingContextType {
  step: number;
  stepName: string;
  setStep: (step: number, name: string) => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

const stepNames: Record<number, string> = {
  1: "phone",
  2: "verify",
  3: "carriers",
  4: "notifications",
  5: "assistants",
  6: "trial",
};

export const OnboardingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [step, setStepState] = useState<number>(1);
  const [stepName, setStepName] = useState<string>(stepNames[1]);
  const { userId } = useUser();

  useEffect(() => {
    // Fetch onboarding step name from localStorage
    const savedStep = localStorage.getItem("onboardingStep");
    const savedStepName = localStorage.getItem("onboardingStepName");
    if (savedStep) {
      setStepState(Number(savedStep));
      setStepName(savedStepName || stepNames[Number(savedStep)]);
    }
    console.log(stepNames[1])
    // Optionally, fetch from the database
    const fetchOnboardingStep = async () => {
      if (userId) {
        const { data, error } = await supabase
          .from("onboarding_steps")
          .select("name")
          .eq("user_id", userId)
          .single();
        if (error) {
          console.error("Error fetching onboarding step:", error);
        } else if (data) {
          setStepName(data.name || stepNames[1]); // Default to step 1 if no name found
          localStorage.setItem("onboardingStepName",stepNames[1]);
        }
      }
    };

    fetchOnboardingStep();
  }, [userId]);

  const setStep = async (newStep: number, name: string) => {
    if (!stepNames[newStep]) {
      console.error(`Invalid step number: ${newStep}`);
      return;
    }

    setStepState(newStep);
    setStepName(name);
    localStorage.setItem("onboardingStep", newStep.toString());
    localStorage.setItem("onboardingStepName", name);

    // Only update the `name` in the database (no need to track step number)
    if (userId) {
      const { data, error } = await supabase
        .from("onboarding_steps")
        .upsert(
          { user_id: userId, name: name }, // Only store name in the database
          );

      if (error) {
        console.error("Error upserting onboarding step:", error);
      } else {
        console.log("Onboarding step updated or inserted:", data);
      }
    }
  };

  return (
    <OnboardingContext.Provider value={{ step, stepName, setStep }}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = (): OnboardingContextType => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  return context;
};

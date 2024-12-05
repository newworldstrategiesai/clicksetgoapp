// contexts/OnboardingContext.tsx

"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useUser } from "@/context/UserContext"; // Assumes you have an AuthContext
import { supabase } from "@/utils/supabaseClient"; // Assumes you are using Supabase

interface OnboardingContextType {
  step: number;
  setStep: (step: number) => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [step, setStepState] = useState<number>(1);
  const { userId } = useUser();

  useEffect(() => {
    // Fetch onboarding step from localStorage
    const savedStep = localStorage.getItem("onboardingStep");
    if (savedStep) {
      setStepState(Number(savedStep));
    }

    // Optionally, fetch from the database
    const fetchOnboardingStep = async () => {
      if (userId) {
        const { data, error } = await supabase
          .from("users")
          .select("onboarding_step")
          .eq("id", userId)
          .single();
        if (error) {
          console.error("Error fetching onboarding step:", error);
        } else if (data) {
          setStepState(data.onboarding_step || 1);
          localStorage.setItem("onboardingStep", (data.onboarding_step || 1).toString());
        }
      }
    };

    fetchOnboardingStep();
  }, [userId]);

  const setStep = (newStep: number) => {
    setStepState(newStep);
    localStorage.setItem("onboardingStep", newStep.toString());

    // Optionally, update the database
    if (userId) {
      supabase
        .from("users")
        .update({ onboarding_step: newStep })
        .eq("id", userId)
        .then(({ error }) => {
          if (error) {
            console.error("Error updating onboarding step:", error);
          }
        });
    }
  };

  return (
    <OnboardingContext.Provider value={{ step, setStep }}>
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

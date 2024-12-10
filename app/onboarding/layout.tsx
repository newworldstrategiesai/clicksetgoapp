// app/onboarding/layout.tsx
'use client';

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useOnboarding } from "@/context/OnboardingContext";
import { useRouter } from "next/navigation";
import { OnboardingProvider } from "@/context/OnboardingContext";

const STEPS = [
  { path: "/onboarding/phone", label: "Phone" },
  { path: "/onboarding/verify", label: "Verify" },
  { path: "/onboarding/carrier", label: "Carrier" },
  { path: "/onboarding/notifications", label: "Notifications" },
  { path: "/onboarding/assistant", label: "Assistant" },
  { path: "/onboarding/trial", label: "Trial" },
];

function OnboardingLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "";
  const { step } = useOnboarding();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentStepIndex = STEPS.findIndex((stepItem) =>
    pathname.startsWith(stepItem.path)
  );

  const handleStepClick = (index: number) => {
    if (index < step) {
      router.push(STEPS[index].path);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-muted/10">
        <div className="container max-w-4xl mx-auto py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded mb-4" />
            <div className="h-64 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/10">
      <div className="container max-w-4xl mx-auto py-8">
        <div className="mb-8">
          {/* Progress Bar */}
          <div className="flex justify-between items-center mb-4">
            {STEPS.map((stepItem, index) => (
              <div key={stepItem.path} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium cursor-pointer ${
                    index <= currentStepIndex
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  } ${index < step ? "hover:bg-primary/90" : ""}`}
                  onClick={() => handleStepClick(index)}
                >
                  {index + 1}
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`w-full h-1 mx-2 ${
                      index < currentStepIndex ? "bg-primary" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          {/* Step Labels */}
          <div className="flex justify-between px-2">
            {STEPS.map((stepItem, index) => (
              <div
                key={stepItem.path}
                className={`text-xs font-medium ${
                  index <= currentStepIndex
                    ? "text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {stepItem.label}
              </div>
            ))}
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <OnboardingProvider>
      <OnboardingLayoutContent>{children}</OnboardingLayoutContent>
    </OnboardingProvider>
  );
}
// app/onboarding/root.tsx
import { redirect } from "next/navigation";

export default function OnboardingRoot() {
  redirect("/onboarding/phone");
}
"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { OnboardingProgress } from "./components/OnboardingProgress";
import { WelcomeScreen } from "./components/WelcomeScreen";
import { FeatureWalkthrough } from "./components/FeatureWalkthrough";
import { PersonalizationStep } from "./components/PersonalizationStep";
import { CompletionScreen } from "./components/CompletionScreen";

const steps = ["welcome", "features", "personalization", "completion"];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState("welcome");

  useEffect(() => {
    // Fetch initial onboarding progress
    fetch("/api/onboarding/progress")
      .then((res) => res.json())
      .then((data) => {
        if (data.onboardingComplete) {
          router.push("/dashboard");
        } else if (data.onboardingStep) {
          setCurrentStep(data.onboardingStep);
        }
      });
  }, []);

  const updateProgress = async (step: string) => {
    await fetch("/api/onboarding/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ step }),
    });
  };

  const handleNext = async () => {
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      const nextStep = steps[currentIndex + 1];
      setCurrentStep(nextStep);
      await updateProgress(nextStep);

      // If moving to completion step, mark onboarding as complete
      if (nextStep === "completion") {
        await fetch("/api/onboarding/complete", {
          method: "POST",
        });
      }
    }
  };

  const handleSkip = async () => {
    setCurrentStep("completion");
    await updateProgress("completion");
    await fetch("/api/onboarding/complete", {
      method: "POST",
    });
  };

  return (
    <div className="h-[80vh] bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="container mx-auto px-4 py-8 max-w-4xl"
      >
        <OnboardingProgress currentStep={currentStep} steps={steps} />

        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="mt-8"
        >
          {currentStep === "welcome" && (
            <WelcomeScreen onNext={handleNext} onSkip={handleSkip} />
          )}
          {currentStep === "features" && (
            <FeatureWalkthrough onNext={handleNext} onSkip={handleSkip} />
          )}
          {currentStep === "personalization" && (
            <PersonalizationStep onNext={handleNext} onSkip={handleSkip} />
          )}
          {currentStep === "completion" && <CompletionScreen />}
        </motion.div>
      </motion.div>
    </div>
  );
}

"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { OnboardingProgress } from "./components/OnboardingProgress";
import { WelcomeScreen } from "./components/WelcomeScreen";
import { FeatureWalkthrough } from "./components/FeatureWalkthrough";
import { PersonalizationStep } from "./components/PersonalizationStep";
import { CompletionScreen } from "./components/CompletionScreen";

const steps = ["welcome", "features", "personalization", "completion"];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState("welcome");

  const handleNext = () => {
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const handleSkip = () => {
    setCurrentStep("completion");
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

"use client";

import { motion } from "framer-motion";

interface OnboardingProgressProps {
  currentStep: string;
  steps: string[];
}

export function OnboardingProgress({
  currentStep,
  steps,
}: OnboardingProgressProps) {
  const currentIndex = steps.indexOf(currentStep);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="relative">
        {/* Progress bar background */}
        <div className="h-2 bg-secondary rounded-full">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: "0%" }}
            animate={{
              width: `${((currentIndex + 1) / steps.length) * 100}%`,
            }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </div>

        {/* Step indicators */}
        <div className="absolute top-0 w-full flex justify-between transform -translate-y-1/2">
          {steps.map((step, index) => {
            const isCompleted = index <= currentIndex;
            const isCurrent = index === currentIndex;

            return (
              <motion.div
                key={step}
                className={`w-8 h-8 rounded-full flex items-center justify-center
                  ${isCompleted ? "bg-primary" : "bg-secondary"}
                  ${isCurrent ? "ring-4 ring-primary/20" : ""}`}
                initial={false}
                animate={{
                  scale: isCurrent ? 1.2 : 1,
                }}
                transition={{ duration: 0.2 }}
              >
                <span
                  className={`text-sm font-semibold
                  ${
                    isCompleted
                      ? "text-primary-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {index + 1}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Step labels */}
      <div className="flex justify-between mt-6 px-2">
        {steps.map((step, index) => (
          <div
            key={step}
            className={`text-sm font-medium capitalize
              ${
                index <= currentIndex ? "text-primary" : "text-muted-foreground"
              }`}
          >
            {step}
          </div>
        ))}
      </div>
    </div>
  );
}

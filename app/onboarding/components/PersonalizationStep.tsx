"use client";

import { motion } from "framer-motion";
import { useState } from "react";

interface PersonalizationStepProps {
  onNext: () => void;
  onSkip: () => void;
}

const themes = [
  {
    id: "light",
    name: "Light",
    color: "hsl(var(--background))",
    textColor: "hsl(var(--foreground))",
  },
  {
    id: "dark",
    name: "Dark",
    color: "hsl(var(--background))",
    textColor: "hsl(var(--foreground))",
  },
  {
    id: "green",
    name: "Green",
    color: "hsl(var(--primary))",
    textColor: "hsl(var(--primary-foreground))",
  },
  {
    id: "forest",
    name: "Forest",
    color: "hsl(var(--secondary))",
    textColor: "hsl(var(--secondary-foreground))",
  },
];

const preferences = [
  { id: "notifications", label: "Enable Notifications", icon: "🔔" },
  { id: "analytics", label: "Share Analytics", icon: "📊" },
  { id: "updates", label: "Automatic Updates", icon: "🔄" },
];

export function PersonalizationStep({
  onNext,
  onSkip,
}: PersonalizationStepProps) {
  const [selectedTheme, setSelectedTheme] = useState("light");
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([
    "notifications",
  ]);
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const togglePreference = (id: string) => {
    setSelectedPreferences((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleContinue = async () => {
    if (!name.trim()) {
      return; // Don't proceed if name is empty
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          theme: selectedTheme,
          preferences: selectedPreferences,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save preferences");
      }

      onNext();
    } catch (error) {
      console.error("Error saving preferences:", error);
      // You might want to show an error message to the user here
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Name Input */}
        <div>
          <label className="block text-lg font-medium text-foreground mb-4">
            What should we call you?
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground
              focus:ring-2 focus:ring-ring focus:border-ring transition-colors duration-200"
          />
        </div>

        {/* Theme Selection */}
        <div>
          <label className="block text-lg font-medium text-foreground mb-4">
            Choose your theme
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {themes.map((theme) => (
              <motion.button
                key={theme.id}
                onClick={() => setSelectedTheme(theme.id)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  selectedTheme === theme.id
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-border hover:border-muted-foreground"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  backgroundColor: theme.color,
                  color: theme.textColor,
                }}
              >
                {theme.name}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Preferences */}
        <div>
          <label className="block text-lg font-medium text-foreground mb-4">
            Set your preferences
          </label>
          <div className="space-y-3">
            {preferences.map((pref) => (
              <motion.button
                key={pref.id}
                onClick={() => togglePreference(pref.id)}
                className={`w-full p-4 rounded-lg border-2 transition-all duration-200
                  flex items-center space-x-3 ${
                    selectedPreferences.includes(pref.id)
                      ? "border-primary bg-secondary"
                      : "border-border hover:border-muted-foreground"
                  }`}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <span className="text-2xl">{pref.icon}</span>
                <span className="text-foreground">{pref.label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-6">
          <button
            onClick={onSkip}
            className="text-muted-foreground hover:text-foreground font-medium"
            disabled={isLoading}
          >
            Skip
          </button>
          <button
            onClick={handleContinue}
            disabled={isLoading || !name.trim()}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg
              font-semibold hover:bg-primary/90 transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Saving..." : "Continue"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

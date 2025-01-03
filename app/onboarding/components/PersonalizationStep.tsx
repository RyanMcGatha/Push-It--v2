"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

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
    icon: "☀️",
  },
  {
    id: "dark",
    name: "Dark",
    color: "hsl(var(--background))",
    textColor: "hsl(var(--foreground))",
    icon: "🌙",
  },
  {
    id: "green",
    name: "Green",
    color: "hsl(var(--primary))",
    textColor: "hsl(var(--primary-foreground))",
    icon: "🌿",
  },
  {
    id: "forest",
    name: "Forest",
    color: "hsl(var(--secondary))",
    textColor: "hsl(var(--secondary-foreground))",
    icon: "🌲",
  },
];

const layouts = [
  { id: "modern", name: "Modern", icon: "✨" },
  { id: "classic", name: "Classic", icon: "📚" },
  { id: "minimal", name: "Minimal", icon: "🎯" },
];

export function PersonalizationStep({
  onNext,
  onSkip,
}: PersonalizationStepProps) {
  const [formData, setFormData] = useState({
    displayName: "",
    bio: "",
    location: "",
    themeColor: "",
    bannerImage: "",
    layout: "modern",
  });

  const [selectedTheme, setSelectedTheme] = useState("light");

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          theme: selectedTheme,
        }),
      });

      if (response.ok) {
        onNext();
      }
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  };

  return (
    <div className="w-full  mx-auto px-4 py-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-8"
      >
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60"
          >
            Personalize Your Profile
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-muted-foreground text-lg leading-relaxed"
          >
            Make your profile uniquely yours with custom themes and personal
            details
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column - Basic Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-1"
          >
            <Card className="shadow-lg border-2">
              <CardHeader className="space-y-2 pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-1 bg-primary rounded-full" />
                  <div>
                    <CardTitle className="text-2xl">
                      Basic Information
                    </CardTitle>
                    <CardDescription className="text-base">
                      Tell us about yourself
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label
                      htmlFor="displayName"
                      className="text-sm font-medium"
                    >
                      Display Name
                    </Label>
                    <Input
                      id="displayName"
                      name="displayName"
                      value={formData.displayName}
                      onChange={handleInputChange}
                      placeholder="How should we call you?"
                      className="h-11 transition-all border-2 focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-sm font-medium">
                      Location
                    </Label>
                    <Input
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="Where are you based?"
                      className="h-11 transition-all border-2 focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-sm font-medium">
                    Bio
                  </Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Tell us about yourself"
                    rows={4}
                    className="resize-none transition-all border-2 focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Right Column - Appearance */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-1 "
          >
            <Card className="shadow-lg border-2 sticky top-8 ">
              <CardHeader className="space-y-2 pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-1 bg-primary rounded-full" />
                  <div>
                    <CardTitle className="text-2xl">Appearance</CardTitle>
                    <CardDescription className="text-base">
                      Choose your preferred theme and layout
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Label>Theme</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {themes.map((theme) => (
                      <motion.button
                        key={theme.id}
                        onClick={() => setSelectedTheme(theme.id)}
                        className={`p-4 rounded-lg border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
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
                        <span className="text-3xl">{theme.icon}</span>
                        <span className="font-medium">{theme.name}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Layout Style</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {layouts.map((layout) => (
                      <motion.button
                        key={layout.id}
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            layout: layout.id,
                          }))
                        }
                        className={`p-4 rounded-lg border-2 transition-all duration-200 flex flex-col items-center gap-2 ${
                          formData.layout === layout.id
                            ? "border-primary ring-2 ring-primary/20"
                            : "border-border hover:border-muted-foreground"
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <span className="text-3xl">{layout.icon}</span>
                        <span className="font-medium">{layout.name}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex justify-between items-center max-w-4xl mx-auto pt-12"
        >
          <Button
            variant="outline"
            onClick={onSkip}
            className="w-[160px] h-11 text-base hover:bg-secondary/20"
          >
            Skip for now
          </Button>
          <Button
            onClick={handleSubmit}
            size="lg"
            className="w-[160px] h-11 text-base shadow-md hover:shadow-lg transition-all"
          >
            Continue
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}

"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

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

const layouts = [
  { id: "modern", name: "Modern" },
  { id: "classic", name: "Classic" },
  { id: "minimal", name: "Minimal" },
];

export function PersonalizationStep({
  onNext,
  onSkip,
}: PersonalizationStepProps) {
  const [formData, setFormData] = useState({
    displayName: "",
    bio: "",
    location: "",
    website: "",
    twitterHandle: "",
    githubHandle: "",
    company: "",
    jobTitle: "",
    phoneNumber: "",
    customUrl: "",
    themeColor: "",
    bannerImage: "",
    layout: "modern",
    skills: [] as string[],
    achievements: [] as string[],
  });

  const [currentSkill, setCurrentSkill] = useState("");
  const [currentAchievement, setCurrentAchievement] = useState("");
  const [selectedTheme, setSelectedTheme] = useState("light");

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSkillAdd = () => {
    if (currentSkill.trim()) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, currentSkill.trim()],
      }));
      setCurrentSkill("");
    }
  };

  const handleAchievementAdd = () => {
    if (currentAchievement.trim()) {
      setFormData((prev) => ({
        ...prev,
        achievements: [...prev.achievements, currentAchievement.trim()],
      }));
      setCurrentAchievement("");
    }
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
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Personalize Your Profile
          </h2>
          <p className="text-muted-foreground mb-6">
            Let's make your profile unique and help others get to know you
            better.
          </p>
        </div>

        {/* Basic Information */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              name="displayName"
              value={formData.displayName}
              onChange={handleInputChange}
              placeholder="How should we call you?"
            />
          </div>

          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              placeholder="Tell us about yourself"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="Where are you based?"
            />
          </div>
        </div>

        {/* Professional Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Professional Details</h3>

          <div>
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              name="company"
              value={formData.company}
              onChange={handleInputChange}
              placeholder="Where do you work?"
            />
          </div>

          <div>
            <Label htmlFor="jobTitle">Job Title</Label>
            <Input
              id="jobTitle"
              name="jobTitle"
              value={formData.jobTitle}
              onChange={handleInputChange}
              placeholder="What's your role?"
            />
          </div>
        </div>

        {/* Social Links */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Social Links</h3>

          <div>
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              name="website"
              value={formData.website}
              onChange={handleInputChange}
              placeholder="Your personal website"
            />
          </div>

          <div>
            <Label htmlFor="twitterHandle">Twitter Handle</Label>
            <Input
              id="twitterHandle"
              name="twitterHandle"
              value={formData.twitterHandle}
              onChange={handleInputChange}
              placeholder="@username"
            />
          </div>

          <div>
            <Label htmlFor="githubHandle">GitHub Handle</Label>
            <Input
              id="githubHandle"
              name="githubHandle"
              value={formData.githubHandle}
              onChange={handleInputChange}
              placeholder="Your GitHub username"
            />
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Contact Information</h3>

          <div>
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              placeholder="Your phone number"
            />
          </div>

          <div>
            <Label htmlFor="customUrl">Custom URL</Label>
            <Input
              id="customUrl"
              name="customUrl"
              value={formData.customUrl}
              onChange={handleInputChange}
              placeholder="Your custom profile URL"
            />
          </div>
        </div>

        {/* Skills and Achievements */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Skills & Achievements</h3>

          <div>
            <Label htmlFor="skills">Skills</Label>
            <div className="flex gap-2 mb-2">
              <Input
                id="skills"
                value={currentSkill}
                onChange={(e) => setCurrentSkill(e.target.value)}
                placeholder="Add a skill"
              />
              <Button type="button" onClick={handleSkillAdd}>
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="achievements">Achievements</Label>
            <div className="flex gap-2 mb-2">
              <Input
                id="achievements"
                value={currentAchievement}
                onChange={(e) => setCurrentAchievement(e.target.value)}
                placeholder="Add an achievement"
              />
              <Button type="button" onClick={handleAchievementAdd}>
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.achievements.map((achievement, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md"
                >
                  {achievement}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Theme Selection */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Appearance</h3>

          <div>
            <Label>Theme</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-2">
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

          <div>
            <Label htmlFor="layout">Layout Style</Label>
            <div className="grid grid-cols-3 gap-4 mt-2">
              {layouts.map((layout) => (
                <motion.button
                  key={layout.id}
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, layout: layout.id }))
                  }
                  className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                    formData.layout === layout.id
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-border hover:border-muted-foreground"
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {layout.name}
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between pt-6">
          <Button variant="ghost" onClick={onSkip}>
            Skip for now
          </Button>
          <Button onClick={handleSubmit}>Save & Continue</Button>
        </div>
      </motion.div>
    </div>
  );
}

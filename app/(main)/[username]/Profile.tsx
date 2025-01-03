"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Pencil } from "lucide-react";
import { useSession } from "next-auth/react";
import { ProfileProps } from "./components/types";
import { ProfileHeader } from "./components/ProfileHeader";
import { ProfileSidebar } from "./components/ProfileSidebar";
import { CustomSections } from "./components/CustomSections";

export function Profile({ profile: initialProfile }: ProfileProps) {
  const session = useSession();
  const isUser = session.data?.user?.email === initialProfile.user.email;
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [profile, setProfile] = useState(initialProfile);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.4,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  const handleProfileChange = (updates: Partial<typeof profile>) => {
    setProfile((prev) => ({ ...prev, ...updates }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profile),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      setSuccessMessage("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative min-h-screen"
    >
      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {error && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="p-4 bg-destructive/10 text-destructive rounded-lg shadow-lg backdrop-blur-sm"
          >
            {error}
          </motion.div>
        )}
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="p-4 bg-green-500/10 text-green-500 rounded-lg shadow-lg backdrop-blur-sm"
          >
            {successMessage}
          </motion.div>
        )}
      </div>

      {/* Profile Content */}
      <div className="space-y-8 pb-24">
        <ProfileHeader
          profile={profile}
          isEditing={isEditing}
          onProfileChange={handleProfileChange}
        />

        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mt-24 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <motion.div variants={itemVariants} className="lg:col-span-1">
              <div className="sticky top-8">
                <ProfileSidebar
                  profile={profile}
                  isEditing={isEditing}
                  onProfileChange={handleProfileChange}
                />
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="lg:col-span-2">
              <CustomSections
                sections={profile.customSections}
                isEditing={isEditing}
                onSectionsChange={(sections) =>
                  handleProfileChange({ customSections: sections })
                }
              />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Edit/Save Controls */}
      {isUser && (
        <motion.div
          variants={itemVariants}
          className="fixed bottom-8 right-8 flex space-x-4 z-50"
        >
          {isEditing ? (
            <>
              <button
                onClick={() => {
                  setProfile(initialProfile);
                  setIsEditing(false);
                }}
                className="px-6 py-2.5 rounded-lg border bg-background/80 hover:bg-background backdrop-blur-sm transition-all duration-200 shadow-lg"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 flex items-center space-x-2 shadow-lg transition-all duration-200"
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 flex items-center space-x-2 shadow-lg transition-all duration-200"
            >
              <Pencil className="w-4 h-4" />
              <span>Edit Profile</span>
            </button>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

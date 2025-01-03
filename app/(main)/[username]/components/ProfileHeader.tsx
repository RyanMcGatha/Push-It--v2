import { useState } from "react";
import { HexColorPicker } from "react-colorful";
import { ImageIcon, Camera } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ProfileData } from "./types";
import { cn } from "@/lib/utils";

interface ProfileHeaderProps {
  profile: ProfileData;
  isEditing: boolean;
  onProfileChange: (updates: Partial<ProfileData>) => void;
}

export function ProfileHeader({
  profile,
  isEditing,
  onProfileChange,
}: ProfileHeaderProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative"
    >
      <div
        className="w-full h-64 md:h-80 rounded-xl bg-cover bg-center relative overflow-hidden transition-all duration-500 ease-in-out group"
        style={{
          backgroundColor: profile.themeColor,
          backgroundImage: profile.bannerImage
            ? `url(${profile.bannerImage})`
            : undefined,
        }}
      >
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/60" />

        {isEditing && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute top-4 right-4 space-y-3 z-10"
          >
            <div className="relative">
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="p-3 rounded-lg bg-background/90 hover:bg-background/95 backdrop-blur-sm transition-all duration-200 shadow-lg group"
              >
                <div
                  className="w-6 h-6 rounded-md group-hover:scale-110 transition-transform duration-200"
                  style={{ backgroundColor: profile.themeColor }}
                />
              </button>
              {showColorPicker && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute right-0 mt-2 z-50 shadow-xl rounded-lg overflow-hidden"
                >
                  <div className="p-3 bg-background/95 backdrop-blur-sm">
                    <HexColorPicker
                      color={profile.themeColor}
                      onChange={(color) =>
                        onProfileChange({ themeColor: color })
                      }
                    />
                  </div>
                </motion.div>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={profile.bannerImage}
                onChange={(e) =>
                  onProfileChange({ bannerImage: e.target.value })
                }
                placeholder="Banner Image URL"
                className="w-56 px-4 py-3 text-sm rounded-lg bg-background/90 backdrop-blur-sm hover:bg-background/95 transition-all duration-200 shadow-lg focus:ring-2 focus:ring-primary/50 outline-none"
              />
              <button className="p-3 rounded-lg bg-background/90 hover:bg-background/95 backdrop-blur-sm transition-all duration-200 shadow-lg">
                <ImageIcon className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Profile Info Section */}
      <div className="absolute -bottom-20 left-0 right-0 px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col md:flex-row md:items-end space-y-4 md:space-y-0 md:space-x-6"
        >
          {/* Profile Image */}
          <div className="relative group">
            <div className="w-36 h-36 rounded-full border-4 border-background overflow-hidden shadow-xl transition-transform duration-300 ease-in-out group-hover:scale-105">
              {profile.user.image ? (
                <Image
                  src={profile.user.image}
                  alt={profile.user.name || "Profile"}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center text-5xl font-bold text-muted-foreground">
                  {profile.user.name?.[0]}
                </div>
              )}
              {isEditing && (
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                  <Camera className="w-8 h-8 text-white" />
                </div>
              )}
            </div>
          </div>

          {/* Name and Title */}
          <div className="md:mb-6 space-y-3">
            {isEditing ? (
              <input
                type="text"
                value={profile.user.name || ""}
                onChange={(e) =>
                  onProfileChange({
                    user: { ...profile.user, name: e.target.value },
                  })
                }
                className="text-3xl md:text-4xl font-bold bg-background/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg focus:ring-2 focus:ring-primary/50 outline-none w-full md:w-auto"
              />
            ) : (
              <h1 className="text-3xl md:text-4xl font-bold text-black drop-shadow-lg">
                {profile.user.name}
              </h1>
            )}
            {isEditing ? (
              <input
                type="text"
                value={profile.jobTitle}
                onChange={(e) => onProfileChange({ jobTitle: e.target.value })}
                placeholder="Job Title"
                className="text-lg bg-background/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg focus:ring-2 focus:ring-primary/50 outline-none w-full md:w-auto"
              />
            ) : (
              profile.jobTitle && (
                <p className="text-xl text-black/90 drop-shadow-lg font-medium">
                  {profile.jobTitle}
                </p>
              )
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

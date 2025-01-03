import { useState, useRef } from "react";
import { HexColorPicker } from "react-colorful";
import { ImageIcon, Camera, Upload, Move, ZoomIn } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ProfileData, ImageSettings } from "./types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ProfileHeaderProps {
  profile: ProfileData;
  isEditing: boolean;
  onProfileChange: (updates: Partial<ProfileData>) => void;
  bannerSettings: ImageSettings;
  profileSettings: ImageSettings;
  onBannerSettingsChange: (settings: ImageSettings) => void;
  onProfileSettingsChange: (settings: ImageSettings) => void;
}

export function ProfileHeader({
  profile,
  isEditing,
  onProfileChange,
  bannerSettings,
  profileSettings,
  onBannerSettingsChange,
  onProfileSettingsChange,
}: ProfileHeaderProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (file: File, type: "banner" | "avatar") => {
    if (!file) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to upload image");
      }

      const { url } = await response.json();

      if (type === "banner") {
        onProfileChange({ bannerImage: url });
      } else {
        onProfileChange({ user: { ...profile.user, image: url } });
      }

      toast.success(
        `${
          type === "banner" ? "Banner" : "Profile picture"
        } updated successfully`
      );
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const updateBannerSettings = (settings: Partial<ImageSettings>) => {
    onBannerSettingsChange({ ...bannerSettings, ...settings });
  };

  const updateProfileSettings = (settings: Partial<ImageSettings>) => {
    onProfileSettingsChange({ ...profileSettings, ...settings });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative"
    >
      {/* Hidden file inputs */}
      <input
        type="file"
        ref={bannerInputRef}
        className="hidden"
        accept="image/jpeg,image/png,image/webp"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleImageUpload(file, "banner");
        }}
      />
      <input
        type="file"
        ref={avatarInputRef}
        className="hidden"
        accept="image/jpeg,image/png,image/webp"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleImageUpload(file, "avatar");
        }}
      />

      {/* Banner */}
      <div
        className="w-full h-72 md:h-96 rounded-xl bg-cover relative overflow-hidden transition-all duration-500 ease-in-out group"
        style={{
          backgroundColor: profile.themeColor,
          backgroundImage: profile.bannerImage
            ? `url(${profile.bannerImage})`
            : undefined,
          backgroundPosition: `${bannerSettings.position.x}% ${bannerSettings.position.y}%`,
          backgroundSize: `${bannerSettings.scale * 100}%`,
        }}
      >
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/60" />

        {/* Banner controls */}
        {isEditing && (
          <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
            <div className="flex items-center gap-2">
              {/* Color picker */}
              <div className="relative">
                <button
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  className="p-3 rounded-lg bg-background/90 hover:bg-background/95 backdrop-blur-sm transition-all duration-200 shadow-lg"
                >
                  <div
                    className="w-6 h-6 rounded-md hover:scale-110 transition-transform duration-200"
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

              {/* Banner upload button */}
              <button
                onClick={() => bannerInputRef.current?.click()}
                disabled={isUploading}
                className="p-3 rounded-lg bg-background/90 hover:bg-background/95 backdrop-blur-sm transition-all duration-200 shadow-lg flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                <span>{isUploading ? "Uploading..." : "Change Banner"}</span>
              </button>
            </div>

            {/* Banner URL input */}
            <input
              type="text"
              value={profile.bannerImage || ""}
              onChange={(e) => onProfileChange({ bannerImage: e.target.value })}
              placeholder="Or enter banner image URL"
              className="w-full px-4 py-2 text-sm rounded-lg bg-background/90 backdrop-blur-sm hover:bg-background/95 transition-all duration-200 shadow-lg focus:ring-2 focus:ring-primary/50 outline-none"
            />

            {/* Banner image controls */}
            {profile.bannerImage && (
              <div className="flex gap-2 bg-background/90 backdrop-blur-sm p-3 rounded-lg shadow-lg">
                {/* Position controls */}
                <div className="flex-1 space-y-2">
                  <label className="text-xs text-foreground/90 flex items-center gap-1">
                    <Move className="w-3 h-3" /> Position
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={bannerSettings.position.x}
                      onChange={(e) =>
                        updateBannerSettings({
                          position: {
                            x: parseInt(e.target.value),
                            y: bannerSettings.position.y,
                          },
                        })
                      }
                      className="w-full"
                    />
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={bannerSettings.position.y}
                      onChange={(e) =>
                        updateBannerSettings({
                          position: {
                            x: bannerSettings.position.x,
                            y: parseInt(e.target.value),
                          },
                        })
                      }
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Scale control */}
                <div className="flex-1 space-y-2">
                  <label className="text-xs text-foreground/90 flex items-center gap-1">
                    <ZoomIn className="w-3 h-3" /> Zoom
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="2"
                    step="0.1"
                    value={bannerSettings.scale}
                    onChange={(e) =>
                      updateBannerSettings({
                        scale: parseFloat(e.target.value),
                      })
                    }
                    className="w-full"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Profile Info Section */}
      <div className="absolute -bottom-24 left-0 right-0 px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col md:flex-row md:items-end space-y-4 md:space-y-0 md:space-x-8"
        >
          {/* Profile Image */}
          <div className="relative group">
            <div
              className="w-40 h-40 rounded-full border-4 border-background overflow-hidden shadow-xl transition-transform duration-300 ease-in-out group-hover:scale-105"
              onClick={() => isEditing && avatarInputRef.current?.click()}
            >
              {profile.user.image ? (
                <div className="relative w-full h-full">
                  <Image
                    src={profile.user.image}
                    alt={profile.user.name || "Profile"}
                    fill
                    className="object-cover"
                    style={{
                      objectPosition: profileSettings.position
                        ? `${profileSettings.position.x}% ${profileSettings.position.y}%`
                        : "center",
                      transform: `scale(${profileSettings.scale || 1})`,
                    }}
                  />
                </div>
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center text-5xl font-bold text-muted-foreground">
                  {profile.user.name?.[0]}
                </div>
              )}
              {isEditing && (
                <button
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={isUploading}
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center cursor-pointer"
                >
                  <Camera className="w-8 h-8 text-white" />
                </button>
              )}
            </div>

            {/* Profile image controls */}
            {isEditing && profile.user.image && (
              <div className="mt-2 p-3 rounded-lg bg-background/90 backdrop-blur-sm space-y-2">
                {/* Position controls */}
                <div className="space-y-1">
                  <label className="text-xs text-foreground/90 flex items-center gap-1">
                    <Move className="w-3 h-3" /> Position
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={profileSettings.position?.x || 50}
                      onChange={(e) =>
                        updateProfileSettings({
                          position: {
                            x: parseInt(e.target.value),
                            y: profileSettings.position?.y || 50,
                          },
                        })
                      }
                      className="w-full"
                    />
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={profileSettings.position?.y || 50}
                      onChange={(e) =>
                        updateProfileSettings({
                          position: {
                            x: profileSettings.position?.x || 50,
                            y: parseInt(e.target.value),
                          },
                        })
                      }
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Scale control */}
                <div className="space-y-1">
                  <label className="text-xs text-foreground/90 flex items-center gap-1">
                    <ZoomIn className="w-3 h-3" /> Zoom
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="2"
                    step="0.1"
                    value={profileSettings.scale || 1}
                    onChange={(e) =>
                      updateProfileSettings({
                        scale: parseFloat(e.target.value),
                      })
                    }
                    className="w-full"
                  />
                </div>
              </div>
            )}

            {/* Profile image URL input */}
            {isEditing && (
              <input
                type="text"
                value={profile.user.image || ""}
                onChange={(e) =>
                  onProfileChange({
                    user: { ...profile.user, image: e.target.value },
                  })
                }
                placeholder="Or enter profile image URL"
                className="mt-2 w-full px-4 py-2 text-sm rounded-lg bg-background/90 backdrop-blur-sm hover:bg-background/95 transition-all duration-200 shadow-lg focus:ring-2 focus:ring-primary/50 outline-none"
              />
            )}
          </div>

          {/* Name and Title */}
          <div className="md:mb-8 space-y-3">
            {isEditing ? (
              <input
                type="text"
                value={profile.user.name || ""}
                onChange={(e) =>
                  onProfileChange({
                    user: { ...profile.user, name: e.target.value },
                  })
                }
                className="text-3xl md:text-5xl font-bold bg-background/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg focus:ring-2 focus:ring-primary/50 outline-none w-full md:w-auto"
              />
            ) : (
              <h1 className="text-3xl md:text-5xl font-bold text-black drop-shadow-lg">
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

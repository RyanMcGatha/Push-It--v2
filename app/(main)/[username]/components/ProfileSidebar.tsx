import {
  Plus,
  X,
  Globe,
  Twitter,
  Github,
  Building2,
  MapPin,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ProfileData } from "./types";

interface ProfileSidebarProps {
  profile: ProfileData;
  isEditing: boolean;
  onProfileChange: (updates: Partial<ProfileData>) => void;
}

export function ProfileSidebar({
  profile,
  isEditing,
  onProfileChange,
}: ProfileSidebarProps) {
  const handleSkillAdd = (skill: string) => {
    if (skill && !profile.skills.includes(skill)) {
      onProfileChange({ skills: [...profile.skills, skill] });
    }
  };

  const handleSkillRemove = (skillToRemove: string) => {
    onProfileChange({
      skills: profile.skills.filter((skill) => skill !== skillToRemove),
    });
  };

  const handleAchievementAdd = (achievement: string) => {
    if (achievement) {
      onProfileChange({
        achievements: [...profile.achievements, achievement],
      });
    }
  };

  const handleAchievementRemove = (achievementToRemove: string) => {
    onProfileChange({
      achievements: profile.achievements.filter(
        (a) => a !== achievementToRemove
      ),
    });
  };

  return (
    <div className="space-y-10">
      {/* Bio */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="prose dark:prose-invert max-w-none bg-background/50 backdrop-blur-sm rounded-xl p-6 shadow-sm"
      >
        <h3 className="text-xl font-semibold mb-4 flex items-center space-x-2">
          <span>About</span>
        </h3>
        {isEditing ? (
          <textarea
            value={profile.bio}
            onChange={(e) => onProfileChange({ bio: e.target.value })}
            placeholder="Write your bio..."
            rows={4}
            className="w-full px-4 py-3 rounded-lg border bg-background/50 hover:bg-background/80 focus:bg-background transition-colors duration-200 focus:ring-2 focus:ring-primary/50 outline-none resize-none"
          />
        ) : (
          profile.bio && (
            <p className="text-muted-foreground leading-relaxed">
              {profile.bio}
            </p>
          )
        )}
      </motion.section>

      {/* Location & Company */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-background/50 backdrop-blur-sm rounded-xl p-6 shadow-sm space-y-4"
      >
        <h3 className="text-xl font-semibold">Details</h3>
        {isEditing ? (
          <div className="space-y-3">
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={profile.location}
                onChange={(e) => onProfileChange({ location: e.target.value })}
                placeholder="Location"
                className="w-full pl-11 pr-4 py-2.5 rounded-lg border bg-background/50 hover:bg-background/80 focus:bg-background transition-colors duration-200 focus:ring-2 focus:ring-primary/50 outline-none"
              />
            </div>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={profile.company}
                onChange={(e) => onProfileChange({ company: e.target.value })}
                placeholder="Company"
                className="w-full pl-11 pr-4 py-2.5 rounded-lg border bg-background/50 hover:bg-background/80 focus:bg-background transition-colors duration-200 focus:ring-2 focus:ring-primary/50 outline-none"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {profile.location && (
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-muted-foreground flex items-center space-x-3"
              >
                <MapPin className="w-5 h-5" />
                <span>{profile.location}</span>
              </motion.p>
            )}
            {profile.company && (
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-muted-foreground flex items-center space-x-3"
              >
                <Building2 className="w-5 h-5" />
                <span>{profile.company}</span>
              </motion.p>
            )}
          </div>
        )}
      </motion.section>

      {/* Social Links */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-background/50 backdrop-blur-sm rounded-xl p-6 shadow-sm space-y-4"
      >
        <h3 className="text-xl font-semibold">Connect</h3>
        {isEditing ? (
          <div className="space-y-3">
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={profile.website}
                onChange={(e) => onProfileChange({ website: e.target.value })}
                placeholder="Website URL"
                className="w-full pl-11 pr-4 py-2.5 rounded-lg border bg-background/50 hover:bg-background/80 focus:bg-background transition-colors duration-200 focus:ring-2 focus:ring-primary/50 outline-none"
              />
            </div>
            <div className="relative">
              <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={profile.twitterHandle}
                onChange={(e) =>
                  onProfileChange({ twitterHandle: e.target.value })
                }
                placeholder="Twitter Handle"
                className="w-full pl-11 pr-4 py-2.5 rounded-lg border bg-background/50 hover:bg-background/80 focus:bg-background transition-colors duration-200 focus:ring-2 focus:ring-primary/50 outline-none"
              />
            </div>
            <div className="relative">
              <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={profile.githubHandle}
                onChange={(e) =>
                  onProfileChange({ githubHandle: e.target.value })
                }
                placeholder="GitHub Handle"
                className="w-full pl-11 pr-4 py-2.5 rounded-lg border bg-background/50 hover:bg-background/80 focus:bg-background transition-colors duration-200 focus:ring-2 focus:ring-primary/50 outline-none"
              />
            </div>
          </div>
        ) : (
          <div className="flex space-x-4">
            {profile.website && (
              <Link
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-lg border bg-background/50 hover:bg-background/80 transition-colors duration-200 group"
              >
                <Globe className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
              </Link>
            )}
            {profile.twitterHandle && (
              <Link
                href={`https://twitter.com/${profile.twitterHandle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-lg border bg-background/50 hover:bg-background/80 transition-colors duration-200 group"
              >
                <Twitter className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
              </Link>
            )}
            {profile.githubHandle && (
              <Link
                href={`https://github.com/${profile.githubHandle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-lg border bg-background/50 hover:bg-background/80 transition-colors duration-200 group"
              >
                <Github className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
              </Link>
            )}
          </div>
        )}
      </motion.section>

      {/* Skills */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-background/50 backdrop-blur-sm rounded-xl p-6 shadow-sm"
      >
        <h3 className="text-xl font-semibold mb-4">Skills</h3>
        {isEditing && (
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Add a skill"
                className="w-full pl-4 pr-10 py-2.5 rounded-lg border bg-background/50 hover:bg-background/80 focus:bg-background transition-colors duration-200 focus:ring-2 focus:ring-primary/50 outline-none"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSkillAdd((e.target as HTMLInputElement).value);
                    (e.target as HTMLInputElement).value = "";
                  }
                }}
              />
              <button
                onClick={() => {
                  const input = document.querySelector(
                    'input[placeholder="Add a skill"]'
                  ) as HTMLInputElement;
                  if (input?.value) {
                    handleSkillAdd(input.value);
                    input.value = "";
                  }
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md hover:bg-muted/80 transition-colors duration-200"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          <AnimatePresence>
            {profile.skills.map((skill, index) => (
              <motion.span
                key={skill}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className="px-3 py-1.5 rounded-full bg-primary/10 hover:bg-primary/15 text-sm font-medium flex items-center space-x-1.5 transition-colors duration-200 group"
              >
                <span>{skill}</span>
                {isEditing && (
                  <button
                    onClick={() => handleSkillRemove(skill)}
                    className="opacity-0 group-hover:opacity-100 hover:text-destructive transition-all duration-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </motion.span>
            ))}
          </AnimatePresence>
        </div>
      </motion.section>

      {/* Achievements */}
      {(profile.achievements.length > 0 || isEditing) && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-background/50 backdrop-blur-sm rounded-xl p-6 shadow-sm"
        >
          <h3 className="text-xl font-semibold mb-4">Achievements</h3>
          {isEditing && (
            <div className="flex items-center space-x-2 mb-4">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Add an achievement"
                  className="w-full pl-4 pr-10 py-2.5 rounded-lg border bg-background/50 hover:bg-background/80 focus:bg-background transition-colors duration-200 focus:ring-2 focus:ring-primary/50 outline-none"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAchievementAdd(
                        (e.target as HTMLInputElement).value
                      );
                      (e.target as HTMLInputElement).value = "";
                    }
                  }}
                />
                <button
                  onClick={() => {
                    const input = document.querySelector(
                      'input[placeholder="Add an achievement"]'
                    ) as HTMLInputElement;
                    if (input?.value) {
                      handleAchievementAdd(input.value);
                      input.value = "";
                    }
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md hover:bg-muted/80 transition-colors duration-200"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
          <ul className="space-y-3">
            <AnimatePresence>
              {profile.achievements.map((achievement, index) => (
                <motion.li
                  key={achievement}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-center space-x-3 group"
                >
                  <span className="text-xl">🏆</span>
                  <span className="flex-1 text-muted-foreground">
                    {achievement}
                  </span>
                  {isEditing && (
                    <button
                      onClick={() => handleAchievementRemove(achievement)}
                      className="opacity-0 group-hover:opacity-100 hover:text-destructive transition-all duration-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </motion.section>
      )}
    </div>
  );
}

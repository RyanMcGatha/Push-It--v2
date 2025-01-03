"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Profile {
  displayName: string;
  bio: string;
  location: string;
  website: string;
  twitterHandle: string;
  githubHandle: string;
  company: string;
  jobTitle: string;
  phoneNumber: string;
  customUrl: string;
  themeColor: string;
  bannerImage: string;
  layout: string;
  skills: string[];
  achievements: string[];
}

export function CompletionScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    // Fetch the user's profile data
    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/me");
        if (response.ok) {
          const data = await response.json();
          setProfile(data.profile);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchProfile();
  }, []);

  const goToDashboard = () => {
    router.push("/dashboard");
  };

  return (
    <div className="max-w-4xl mx-auto text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 0.5,
          ease: "easeOut",
        }}
        className="space-y-8"
      >
        {/* Success Animation */}
        <div className="relative w-32 h-32 mx-auto">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{
              duration: 0.5,
              times: [0, 0.6, 1],
              ease: "easeOut",
            }}
            className="absolute inset-0 bg-secondary rounded-full"
          />
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.2 }}
            className="absolute inset-0 flex items-center justify-center text-4xl"
          >
            ✨
          </motion.div>
        </div>

        {/* Celebration Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-3xl font-bold text-foreground mb-4">
            {profile?.displayName
              ? `You're All Set, ${profile.displayName}!`
              : "You're All Set!"}
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Your profile is complete and ready to go. Let's start connecting!
          </p>
        </motion.div>

        {/* Profile Summary */}
        {profile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left bg-card rounded-xl p-6 border border-border"
          >
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Basic Information</h3>
              <div className="space-y-2">
                {profile.bio && (
                  <p className="text-muted-foreground">{profile.bio}</p>
                )}
                {profile.location && (
                  <p className="text-sm">
                    📍{" "}
                    <span className="text-foreground">{profile.location}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Professional Details */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Professional Details</h3>
              <div className="space-y-2">
                {profile.company && (
                  <p className="text-sm">
                    🏢{" "}
                    <span className="text-foreground">{profile.company}</span>
                  </p>
                )}
                {profile.jobTitle && (
                  <p className="text-sm">
                    💼{" "}
                    <span className="text-foreground">{profile.jobTitle}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Social Links */}
            {(profile.website ||
              profile.twitterHandle ||
              profile.githubHandle) && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Social Links</h3>
                <div className="space-y-2">
                  {profile.website && (
                    <p className="text-sm">
                      🌐{" "}
                      <a
                        href={profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {profile.website}
                      </a>
                    </p>
                  )}
                  {profile.twitterHandle && (
                    <p className="text-sm">
                      🐦{" "}
                      <a
                        href={`https://twitter.com/${profile.twitterHandle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        @{profile.twitterHandle}
                      </a>
                    </p>
                  )}
                  {profile.githubHandle && (
                    <p className="text-sm">
                      💻{" "}
                      <a
                        href={`https://github.com/${profile.githubHandle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {profile.githubHandle}
                      </a>
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Skills */}
            {profile.skills && profile.skills.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Achievements */}
            {profile.achievements && profile.achievements.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Achievements</h3>
                <div className="space-y-2">
                  {profile.achievements.map((achievement, index) => (
                    <p key={index} className="text-sm">
                      🏆 <span className="text-foreground">{achievement}</span>
                    </p>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Action Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="pt-6"
        >
          <button
            onClick={goToDashboard}
            className="px-8 py-3 bg-primary text-primary-foreground rounded-lg
              font-semibold hover:bg-primary/90 transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            Go to Dashboard
          </button>
        </motion.div>

        {/* Confetti Animation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, 1, 0],
            y: [0, -100],
            scale: [1, 1.2, 0.8],
          }}
          transition={{
            duration: 2,
            times: [0, 0.5, 1],
            repeat: Infinity,
            repeatDelay: 1,
          }}
          className="absolute top-0 left-1/2 transform -translate-x-1/2"
        >
          <div className="text-4xl">🎉</div>
        </motion.div>
      </motion.div>
    </div>
  );
}

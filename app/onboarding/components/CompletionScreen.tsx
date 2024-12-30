"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function CompletionScreen() {
  const router = useRouter();
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    // Fetch the user's profile data
    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/me");
        if (response.ok) {
          const data = await response.json();
          setUserName(data.name || "");
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
    <div className="max-w-2xl mx-auto text-center">
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
            {userName ? `You're All Set, ${userName}!` : "You're All Set!"}
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Your workspace is ready. Let's start creating amazing things
            together!
          </p>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="grid grid-cols-3 gap-6"
        >
          {[
            { label: "Profile", value: "Complete", icon: "👤" },
            { label: "Preferences", value: "Saved", icon: "⚙️" },
            { label: "Tutorial", value: "Done", icon: "📚" },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + index * 0.1 }}
              className="p-4 bg-card text-card-foreground rounded-lg border border-border"
            >
              <div className="text-2xl mb-2">{stat.icon}</div>
              <div className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </div>
              <div className="text-sm text-primary">{stat.value}</div>
            </motion.div>
          ))}
        </motion.div>

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

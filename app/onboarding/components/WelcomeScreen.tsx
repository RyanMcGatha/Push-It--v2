"use client";

import { motion } from "framer-motion";

interface WelcomeScreenProps {
  onNext: () => void;
  onSkip: () => void;
}

export function WelcomeScreen({ onNext, onSkip }: WelcomeScreenProps) {
  return (
    <div className="text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-12"
      >
        <div className="w-32 h-32 mx-auto mb-8 relative">
          {/* Animated logo/icon placeholder */}
          <motion.div
            className="absolute inset-0 rounded-full bg-secondary"
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute inset-4 rounded-full bg-primary/60"
            animate={{
              scale: [1, 1.15, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.2,
            }}
          />
          <motion.div
            className="absolute inset-8 rounded-full bg-primary"
            animate={{
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.4,
            }}
          />
        </div>

        <motion.h1
          className="text-4xl font-bold text-foreground mb-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Welcome to Push It!
        </motion.h1>

        <motion.p
          className="text-xl text-muted-foreground mb-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Your new favorite way to stay connected and chat with friends
        </motion.p>

        <motion.div
          className="space-y-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <button
            onClick={onNext}
            className="w-full sm:w-auto px-8 py-3 bg-primary text-primary-foreground rounded-lg
              font-semibold hover:bg-primary/90 transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            Let&apos;s Get Started
          </button>

          <div className="mt-4">
            <button
              onClick={onSkip}
              className="text-muted-foreground hover:text-foreground font-medium"
            >
              Skip for now
            </button>
          </div>
        </motion.div>
      </motion.div>

      {/* Feature preview cards */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12"
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {[
          {
            title: "Instant Messaging",
            description: "Send messages in real-time",
          },
          {
            title: "Group Chats",
            description: "Connect with multiple friends at once",
          },
          {
            title: "Rich Media",
            description: "Share photos, videos, and more",
          },
        ].map((feature, index) => (
          <motion.div
            key={feature.title}
            className="p-6 bg-card rounded-xl shadow-sm hover:shadow-md transition-shadow
              duration-200 border border-border"
            whileHover={{ y: -5 }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 + index * 0.1 }}
          >
            <h3 className="font-semibold text-lg mb-2 text-foreground">
              {feature.title}
            </h3>
            <p className="text-muted-foreground">{feature.description}</p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

"use client";

import { motion } from "framer-motion";
import Image from "next/image";
interface WelcomeScreenProps {
  onNext: () => void;
  onSkip: () => void;
}

export function WelcomeScreen({ onNext, onSkip }: WelcomeScreenProps) {
  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <div className="w-40 h-40 mx-auto mb-10 relative">
          {/* Animated background elements */}
          <motion.div
            className="absolute inset-0 rounded-full bg-secondary/80 backdrop-blur-sm"
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 10, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute inset-4 rounded-full bg-primary/70 backdrop-blur-sm"
            animate={{
              scale: [1, 1.15, 1],
              rotate: [0, -10, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.3,
            }}
          />
          <motion.div
            className="absolute inset-8 rounded-full bg-primary/60 shadow-lg"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 15, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.6,
            }}
          />
          {/* Logo overlay */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: 1,
              scale: [1, 1.05, 1],
              rotate: [0, -5, 0],
            }}
            transition={{
              opacity: { delay: 0.8, duration: 0.5 },
              scale: {
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.8,
              },
              rotate: {
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.8,
              },
            }}
          >
            <Image
              src="/pushitt.png"
              alt="Push It!"
              width={120}
              height={120}
              className="z-10 drop-shadow-lg"
            />
          </motion.div>
        </div>

        <motion.h1
          className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Welcome to Push It!
        </motion.h1>

        <motion.p
          className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Experience the next level of communication with real-time messaging,
          seamless file sharing, and a beautiful interface designed for modern
          conversations.
        </motion.p>

        <motion.div
          className="space-y-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <button
            onClick={onNext}
            className="w-full sm:w-auto px-10 py-4 bg-primary text-primary-foreground rounded-full
              font-semibold hover:bg-primary/90 transition-all duration-200 shadow-lg hover:shadow-xl
              focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-lg"
          >
            Get Started in Minutes →
          </button>

          <div className="mt-6">
            <button
              onClick={onSkip}
              className="text-muted-foreground hover:text-foreground font-medium transition-colors duration-200"
            >
              I&apos;ll explore on my own
            </button>
          </div>
        </motion.div>
      </motion.div>

      {/* Feature preview cards */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-16 max-w-6xl mx-auto px-4"
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {[
          {
            title: "Real-time Messaging",
            description:
              "Experience instant communication with zero lag. Messages are delivered the moment you hit send.",
            icon: "⚡️",
          },
          {
            title: "Collaborative Groups",
            description:
              "Create dynamic group chats for teams, friends, or projects with powerful organization tools.",
            icon: "👥",
          },
          {
            title: "Rich Media Sharing",
            description:
              "Share photos, videos, files, and more with drag-and-drop simplicity and instant preview.",
            icon: "🎯",
          },
        ].map((feature, index) => (
          <motion.div
            key={feature.title}
            className="p-8 bg-card/50 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all
              duration-300 border border-border/50 hover:border-primary/20 group"
            whileHover={{ y: -8, scale: 1.02 }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 + index * 0.1 }}
          >
            <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
              {feature.icon}
            </div>
            <h3 className="font-semibold text-xl mb-3 text-foreground">
              {feature.title}
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

"use client";

import { motion } from "framer-motion";
import { useState } from "react";

interface FeatureWalkthroughProps {
  onNext: () => void;
  onSkip: () => void;
}

const features = [
  {
    title: "Instant Messaging",
    description:
      "Experience lightning-fast communication with real-time message delivery, read receipts, and typing indicators. Stay connected with friends and colleagues seamlessly.",
    icon: "⚡",
    demoContent: (
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-pushit-100 flex items-center justify-center">
            <span className="text-2xl">👤</span>
          </div>
          <div className="flex-1">
            <div className="bg-secondary rounded-2xl p-3 max-w-[80%] animate-fade-in">
              Hey there! How are you?
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3 justify-end">
          <div className="flex-1">
            <div className="bg-pushit-500 text-primary-foreground rounded-2xl p-3 max-w-[80%] ml-auto animate-fade-in-delay">
              I'm doing great, thanks for asking!
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Rich Media Experience",
    description:
      "Share your world through photos, videos, and files. Express yourself with a vast library of emojis, animated GIFs, and custom stickers. Make every conversation more engaging.",
    icon: "✨",
    demoContent: (
      <div className="grid grid-cols-2 gap-4">
        <div className="aspect-square bg-gradient-to-br from-pushit-50 to-pushit-100 rounded-xl animate-float flex items-center justify-center">
          <span className="text-4xl">🖼️</span>
        </div>
        <div className="aspect-square bg-gradient-to-br from-pushit-100 to-pushit-200 rounded-xl animate-float-delay flex items-center justify-center">
          <span className="text-4xl">🎥</span>
        </div>
      </div>
    ),
  },
  {
    title: "Smart Group Management",
    description:
      "Create and manage group chats effortlessly. Add members, set roles, and customize group settings. Perfect for team collaboration, event planning, or staying connected with your inner circle.",
    icon: "🌟",
    demoContent: (
      <div className="flex -space-x-4">
        {[..."👥👤🧑‍💻👩‍💻"].map((emoji, i) => (
          <div
            key={i}
            className="w-12 h-12 rounded-full bg-gradient-to-br from-pushit-50 to-pushit-100 flex items-center justify-center animate-slide-in"
            style={{ animationDelay: `${i * 150}ms` }}
          >
            <span className="text-2xl">{emoji}</span>
          </div>
        ))}
      </div>
    ),
  },
];

export function FeatureWalkthrough({
  onNext,
  onSkip,
}: FeatureWalkthroughProps) {
  const [currentFeature, setCurrentFeature] = useState(0);

  const nextFeature = () => {
    if (currentFeature < features.length - 1) {
      setCurrentFeature(currentFeature + 1);
    } else {
      onNext();
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center mb-12"
      >
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-4xl font-bold bg-gradient-to-r from-pushit-500 to-pushit-600 bg-clip-text text-transparent mb-4">
            Welcome to Push It!
          </h2>
          <p className="text-xl text-muted-foreground">
            Discover a new way to connect and communicate
          </p>
        </motion.div>
      </motion.div>

      <div className="relative max-w-4xl mx-auto">
        <motion.div
          key={currentFeature}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-3xl shadow-xl p-8 mb-8 border border-gray-100"
        >
          <div className="flex items-start space-x-6">
            <div className="text-5xl bg-gradient-to-br from-pushit-50 to-pushit-100 p-4 rounded-2xl">
              {features[currentFeature].icon}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-3">
                {features[currentFeature].title}
              </h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                {features[currentFeature].description}
              </p>
            </div>
          </div>

          <div className="mt-8 h-64 bg-gradient-to-br from-background to-secondary rounded-xl border border-border flex items-center justify-center p-6">
            {features[currentFeature].demoContent}
          </div>
        </motion.div>

        <div className="flex justify-between items-center mt-8">
          <div className="flex space-x-3">
            {features.map((_, index) => (
              <motion.button
                key={index}
                className={`w-4 h-4 rounded-full transition-all duration-300 ${
                  index === currentFeature
                    ? "bg-gradient-to-r from-pushit-500 to-pushit-600 scale-125"
                    : "bg-secondary hover:bg-secondary/80"
                }`}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setCurrentFeature(index)}
              />
            ))}
          </div>

          <div className="flex space-x-4">
            <button
              onClick={onSkip}
              className="text-muted-foreground hover:text-foreground font-medium px-6 py-2 rounded-lg hover:bg-secondary transition-all duration-200"
            >
              Skip
            </button>
            <motion.button
              onClick={nextFeature}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-2 bg-gradient-to-r from-pushit-500 to-pushit-600 text-primary-foreground rounded-lg
                font-semibold transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-pushit-500/50 focus:ring-offset-2
                hover:shadow-lg hover:from-pushit-400 hover:to-pushit-500"
            >
              {currentFeature === features.length - 1 ? "Get Started" : "Next"}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}

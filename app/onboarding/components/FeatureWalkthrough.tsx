"use client";

import { motion } from "framer-motion";
import { useState } from "react";

interface FeatureWalkthroughProps {
  onNext: () => void;
  onSkip: () => void;
}

const features = [
  {
    title: "Real-time Messaging",
    description:
      "Send and receive messages instantly with friends and groups. Experience seamless communication with live typing indicators and delivery status.",
    icon: "💬",
  },
  {
    title: "Rich Media Sharing",
    description:
      "Share photos, videos, and files effortlessly. Express yourself with emojis, GIFs, and stickers.",
    icon: "🖼️",
  },
  {
    title: "Group Features",
    description:
      "Create group chats, manage members, and coordinate with multiple friends at once. Perfect for planning events or staying in touch.",
    icon: "👥",
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
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Discover Push It!
        </h2>
        <p className="text-lg text-gray-600">
          Let&apos;s explore what makes messaging better with Push It!
        </p>
      </motion.div>

      <div className="relative">
        {/* Feature showcase area */}
        <motion.div
          key={currentFeature}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-white rounded-2xl shadow-lg p-8 mb-8"
        >
          <div className="flex items-start space-x-6">
            <div className="text-4xl">{features[currentFeature].icon}</div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {features[currentFeature].title}
              </h3>
              <p className="text-gray-600">
                {features[currentFeature].description}
              </p>
            </div>
          </div>

          {/* Interactive demo area */}
          <div className="mt-8 h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <motion.div
              animate={{
                scale: [1, 1.02, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="text-gray-400 text-lg"
            >
              Interactive Demo Placeholder
            </motion.div>
          </div>
        </motion.div>

        {/* Navigation controls */}
        <div className="flex justify-between items-center mt-8">
          <div className="flex space-x-2">
            {features.map((_, index) => (
              <motion.button
                key={index}
                className={`w-3 h-3 rounded-full ${
                  index === currentFeature ? "bg-indigo-600" : "bg-gray-300"
                }`}
                whileHover={{ scale: 1.2 }}
                onClick={() => setCurrentFeature(index)}
              />
            ))}
          </div>

          <div className="flex space-x-4">
            <button
              onClick={onSkip}
              className="text-gray-500 hover:text-gray-700 font-medium"
            >
              Skip
            </button>
            <button
              onClick={nextFeature}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg
                font-semibold hover:bg-indigo-700 transition-colors duration-200
                focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              {currentFeature === features.length - 1 ? "Continue" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

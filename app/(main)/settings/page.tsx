"use client";

import { motion } from "framer-motion";

export default function SettingsPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container max-w-4xl mx-auto py-8"
    >
      <h1 className="text-3xl font-bold mb-8">Settings</h1>
      <div className="bg-card rounded-lg p-6 shadow-sm">
        <p className="text-muted-foreground">
          Settings page content coming soon...
        </p>
      </div>
    </motion.div>
  );
}

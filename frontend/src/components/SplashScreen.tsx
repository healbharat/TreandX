'use client';

import { motion } from 'framer-motion';

export default function SplashScreen() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center space-y-6">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative w-32 h-32 flex items-center justify-center"
      >
        <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="text-6xl font-black gradient-text">TX</div>
      </motion.div>
      
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold tracking-tighter">TreandX</h1>
        <p className="text-muted-foreground mt-2 font-medium">Voices That Matter.</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-12 flex flex-col items-center space-y-4"
      >
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </motion.div>
    </div>
  );
}

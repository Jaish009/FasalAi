"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const images = [
  "https://images.pexels.com/photos/2165688/pexels-photo-2165688.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
  "https://images.pexels.com/photos/259280/pexels-photo-259280.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
  "https://images.pexels.com/photos/265216/pexels-photo-265216.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
  "https://images.pexels.com/photos/164828/pexels-photo-164828.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
  "https://images.pexels.com/photos/1112048/pexels-photo-1112048.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop",
];

const topPositions = [15, 45, 25, 55, 35];

export function HeroSection() {
  return (
    <section className="relative w-full h-screen bg-[#d3dbbd] dark:bg-gray-900 transition-colors duration-300 flex flex-col justify-center items-center overflow-hidden pt-20 pb-10">
      {/* Background Circular Images (Floating) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {images.map((src, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, delay: i * 0.2 }}
            className={`absolute rounded-full overflow-hidden shadow-2xl dark:opacity-60`}
            style={{
              width: i % 2 === 0 ? "300px" : "200px",
              height: i % 2 === 0 ? "300px" : "200px",
              top: `${topPositions[i % topPositions.length]}%`,
              left: `${(i * 20) + 5}%`,
              zIndex: 0,
            }}
          >
            <Image
              src={src}
              alt={`Agricultural background ${i + 1}`}
              fill
              className="object-cover"
            />
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-5xl">
        <motion.h1
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-6xl md:text-8xl font-bold tracking-tight text-[#2d3a24] dark:text-white mb-6 drop-shadow-lg transition-colors"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          Empowering Farmers <br /> with AI Insights
        </motion.h1>
        
        <motion.p
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="text-lg md:text-2xl text-[#3b4c30] dark:text-gray-100 max-w-2xl bg-white/40 dark:bg-black/50 backdrop-blur-md px-6 py-3 rounded-full font-medium mb-8 transition-colors"
        >
          Smart Crop Analysis, Real-Time Mandi Prices, & Data-Driven Decisions.
        </motion.p>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
        >
          <a
            href="/sign-up"
            className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white text-lg font-bold rounded-full shadow-xl transition-all hover:scale-105 hover:shadow-2xl"
          >
            Get Started
          </a>
        </motion.div>
      </div>
    </section>
  );
}

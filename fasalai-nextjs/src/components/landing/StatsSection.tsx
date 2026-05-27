"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const stats = [
  { value: "95%", label: "AI Accuracy" },
  { value: "500+", label: "Mandis Tracked" },
  { value: "Instant", label: "Crop Reports" }
];

export function StatsSection() {
  return (
    <section className="relative w-full py-32 bg-gray-900 flex items-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="https://images.pexels.com/photos/2165688/pexels-photo-2165688.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop"
          alt="Agriculture Field Background"
          fill
          className="object-cover opacity-30 mix-blend-overlay filter blur-sm scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/80 to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-24 w-full">
        <div className="grid md:grid-cols-3 gap-12">
          {stats.map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2, duration: 0.8 }}
              className="flex flex-col border-l-2 border-[#d3dbbd]/30 pl-8"
            >
              <h2 className="text-6xl md:text-7xl font-bold text-[#d3dbbd] mb-4 tracking-tighter">
                {stat.value}
              </h2>
              <p className="text-xl text-gray-300 font-medium">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="mt-20 pt-12 border-t border-gray-700/50"
        >
          <h3 className="text-3xl md:text-5xl font-bold text-white max-w-2xl leading-tight">
            From Soil to Harvest — <br />
            <span className="text-[#d3dbbd]">Our Full Service AI Range</span>
          </h3>
        </motion.div>
      </div>
    </section>
  );
}

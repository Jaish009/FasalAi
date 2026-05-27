"use client";

import { motion } from "framer-motion";
import { Leaf, BarChart3, CloudRain } from "lucide-react";

const features = [
  {
    title: "Smart Crop Analysis",
    description: "Leverage advanced AI models to monitor crop health, predict yields, and optimize your harvesting schedule with unparalleled accuracy.",
    icon: <Leaf className="w-8 h-8 text-green-600" />
  },
  {
    title: "Live Mandi Prices",
    description: "Get real-time market data from over 500+ mandis. Make informed decisions on when and where to sell your produce for maximum profit.",
    icon: <BarChart3 className="w-8 h-8 text-green-600" />
  },
  {
    title: "Data-Driven Decisions",
    description: "Combine weather forecasts, soil health reports, and market trends into one unified dashboard for proactive farm management.",
    icon: <CloudRain className="w-8 h-8 text-green-600" />
  }
];

export function FeaturesSection() {
  return (
    <section className="w-full py-24 bg-white px-6 md:px-12 lg:px-24">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16">
        {/* Left Title Area */}
        <div className="lg:w-1/3">
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight"
          >
            AI-Powered Farming for Maximum Yield
          </motion.h2>
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-8"
          >
            <a href="/dashboard" className="inline-flex items-center gap-2 px-6 py-3 bg-green-100 text-green-800 font-semibold rounded-full hover:bg-green-200 transition-colors">
              Explore Dashboard
            </a>
          </motion.div>
        </div>

        {/* Right Features Area */}
        <div className="lg:w-2/3 grid md:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2, duration: 0.6 }}
              className="flex flex-col border-t-2 border-gray-100 pt-6"
            >
              <div className="mb-6 p-3 bg-green-50 rounded-lg inline-block w-fit">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

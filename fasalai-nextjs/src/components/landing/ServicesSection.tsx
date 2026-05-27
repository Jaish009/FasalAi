"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

const services = [
  {
    title: "Mandi Price Finder",
    image: "https://images.pexels.com/photos/1367243/pexels-photo-1367243.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&fit=crop",
    link: "/dashboard"
  },
  {
    title: "AI Price Forecast",
    image: "https://images.pexels.com/photos/265216/pexels-photo-265216.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&fit=crop",
    link: "/dashboard"
  },
  {
    title: "Personalized Dashboard",
    image: "https://images.pexels.com/photos/259280/pexels-photo-259280.jpeg?auto=compress&cs=tinysrgb&w=600&h=800&fit=crop",
    link: "/dashboard"
  }
];

export function ServicesSection() {
  return (
    <section className="w-full py-24 bg-[#f8f9f5] px-6 md:px-12 lg:px-24">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 text-center lg:text-left"
        >
          <p className="text-sm font-semibold tracking-widest text-gray-500 uppercase mb-4">Features</p>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 max-w-2xl">
            FasalAI Core Features
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {services.map((service, i) => (
            <motion.a
              href={service.link}
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2, duration: 0.5 }}
              className="group block relative overflow-hidden rounded-2xl aspect-[4/5] bg-gray-100 shadow-lg hover:shadow-xl transition-all"
            >
              <Image 
                src={service.image} 
                alt={service.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              
              <div className="absolute bottom-0 left-0 w-full p-8 flex items-end justify-between">
                <h3 className="text-2xl font-bold text-white max-w-[200px]">
                  {service.title}
                </h3>
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-green-500 group-hover:text-white transition-colors">
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}

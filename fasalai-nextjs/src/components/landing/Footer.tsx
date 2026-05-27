"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Twitter, Instagram, Linkedin, Github } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full bg-[#202020] text-white pt-24 pb-12 px-6 md:px-12 lg:px-24">
      <div className="max-w-7xl mx-auto flex flex-col">
        {/* Top Info Area */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-24">
          <div className="lg:col-span-2">
            <h4 className="text-xl font-bold mb-4">Empowering Farmers with AI</h4>
            <p className="text-gray-400 max-w-sm mb-6">
              Driven by purpose. Grounded in AI. Empowering agriculture for a sustainable future.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition"><Twitter className="w-5 h-5" /></a>
              <a href="#" className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition"><Instagram className="w-5 h-5" /></a>
              <a href="#" className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition"><Linkedin className="w-5 h-5" /></a>
              <a href="#" className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition"><Github className="w-5 h-5" /></a>
            </div>
          </div>
          
          <div>
            <h4 className="text-xl font-bold mb-6">Platform</h4>
            <ul className="space-y-4 text-gray-400">
              <li><Link href="/dashboard" className="hover:text-white transition">Dashboard</Link></li>
              <li><Link href="/dashboard" className="hover:text-white transition">Mandi Prices</Link></li>
              <li><Link href="/dashboard" className="hover:text-white transition">Crop Analytics</Link></li>
              <li><Link href="/dashboard" className="hover:text-white transition">Alerts</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xl font-bold mb-6">Company</h4>
            <ul className="space-y-4 text-gray-400">
              <li><Link href="#" className="hover:text-white transition">About Us</Link></li>
              <li><Link href="#" className="hover:text-white transition">Contact</Link></li>
              <li><Link href="#" className="hover:text-white transition">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-white transition">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        {/* Big Branding Area */}
        <div className="border-t border-white/10 pt-12 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="text-[12vw] font-bold leading-none tracking-tighter text-[#d3dbbd]"
          >
            FasalAI
          </motion.h1>
          <p className="mt-8 text-gray-500 text-sm">
            © {new Date().getFullYear()} FasalAI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { SignInButton, SignUpButton, useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { useEffect, useState } from "react";

export function Header() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { isSignedIn } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="fixed top-0 w-full z-50 px-6 py-4 flex items-center justify-between bg-white/50 dark:bg-black/50 backdrop-blur-md">
      <Link href="/" className="text-2xl font-bold tracking-tight dark:text-white text-forest">
        Fasal<span className="text-green-600">AI</span>
      </Link>
      
      <div className="flex items-center gap-4">
        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-colors"
          >
            {theme === "dark" ? <Sun className="w-5 h-5 text-white" /> : <Moon className="w-5 h-5 text-forest" />}
          </button>
        )}
        
        {isSignedIn ? (
          <Link
            href="/dashboard"
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-full transition-colors"
          >
            Dashboard
          </Link>
        ) : (
          <div className="flex items-center gap-3">
            <SignInButton mode="modal">
              <button className="px-4 py-2 font-medium text-forest dark:text-white hover:text-green-600 dark:hover:text-green-400 transition-colors">
                Login
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-full shadow-lg transition-all hover:scale-105">
                Sign Up
              </button>
            </SignUpButton>
          </div>
        )}
      </div>
    </header>
  );
}

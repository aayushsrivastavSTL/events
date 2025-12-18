"use client";
import React, { useState, useEffect, useContext } from "react";
import Image from "next/image";
import ProfileIcon from "@/components/Navbar/ProfileIcon";
import { UserContext } from "@/context/UserContext";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const { user } = useContext(UserContext);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white shadow-lg py-2"
          : "bg-white/95 backdrop-blur-sm py-3"
      }`}
    >
      <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12">
          {/* Left side: Logo + Title */}
          <a
            href="/"
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <Image
              src="/jyot_logo.png"
              alt="JYOT Logo"
              width={48}
              height={48}
              priority
              className="rounded-full object-contain"
            />
            <h3 className="font-bold ml-2 pr-5 border-l border-gray-400 pl-5 hidden lg:block">
              Jyot - Event'26
            </h3>
          </a>

          {/* Right side: Profile Icon */}
          <div className="flex items-center">{user && <ProfileIcon />}</div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

"use client";
import Link from "next/link";
import React from "react";
import { Home, Search, ArrowLeft } from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50 via-white to-yellow-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full text-center">
        {/* Animated 404 */}
        <div className="flex justify-center items-center mb-8">
          <img
            src="/jyot_logo.png"
            alt="Jyot Logo"
            className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 object-contain"
          />
        </div>

        {/* Message */}
        <div className="mb-8 space-y-3">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800">
            Oops! Page Not Found
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-md mx-auto">
            The page you're looking for seems to have wandered off on a
            spiritual journey. Let's get you back on track!
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Link
            href="/"
            className="group flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg w-full sm:w-auto"
          >
            <Home size={20} />
            <span>Go to Home</span>
          </Link>

          <button
            onClick={() => window.history.back()}
            className="group flex items-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 text-gray-800 font-semibold rounded-lg border-2 border-gray-200 transition-all duration-300 transform hover:scale-105 hover:shadow-lg w-full sm:w-auto"
          >
            <ArrowLeft size={20} />
            <span>Go Back</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;

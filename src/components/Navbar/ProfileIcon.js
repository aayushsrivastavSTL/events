"use client";
import { useState, useRef, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import { FaMapMarkerAlt } from "react-icons/fa";
import { UserContext } from "@/context/UserContext";
import { useCookies } from "react-cookie";

const ProfileIcon = () => {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const popoverRef = useRef(null);
  const [accessCookie, setAccessCookie, removeAccessCookie] = useCookies([
    "accessToken",
  ]);
  const { user, role } = useContext(UserContext);

  // Close popover on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleChangeCheckpoint = () => {
    setOpen(false);
    router.push("/checkpoint");
  };

  const handleLogout = async () => {
    try {
      // Clear local storage
      localStorage.removeItem("checkpointID");
      //clear cookie
      removeAccessCookie("accessToken");

      // Call logout API
      const encodedPath = encodeURIComponent("/auth/logout");
      await fetch(`/api/proxy?path=${encodedPath}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Redirect to login
      router.replace("/");
    } catch (error) {
      console.error("Logout error:", error);
      // Clear token anyway and redirect
      localStorage.removeItem("checkpointID");
      router.replace("/");
    }
  };

  // Get initials from user name
  const getInitials = () => {
    if (!user?.name) return "U";
    const names = user.name.split(" ");
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return names[0][0].toUpperCase();
  };

  return (
    <div className="relative" ref={popoverRef}>
      {/* Profile Button */}
      <button
        className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-orange-400 bg-orange-50 hover:bg-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Open profile menu"
      >
        <span className="text-orange-600 font-bold text-sm">
          {getInitials()}
        </span>
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 animate-fadeIn">
          <div className="p-4">
            {/* User Info */}
            <div className="pb-3 border-b border-gray-200">
              <p className="text-sm font-semibold text-gray-800">
                {user?.name || "User"}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {user?.phone || "No phone"}
              </p>
              <div className="mt-2 inline-block px-2 py-1 rounded-full bg-orange-100 text-orange-600 text-xs font-medium">
                {role || "role"}
              </div>
            </div>

            {/* Change Checkpoint Button */}
            <button
              onClick={handleChangeCheckpoint}
              className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-orange-500 text-white font-medium text-sm hover:bg-orange-600 transition-colors"
            >
              <FaMapMarkerAlt className="text-base" />
              Change Checkpoint
            </button>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full mt-3 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileIcon;

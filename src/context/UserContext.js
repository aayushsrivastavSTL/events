"use client";
import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import { useCookies } from "react-cookie";

export const UserContext = createContext({});

export const UserContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accessCookie, setAccessCookie, removeAccessCookie] = useCookies([
    "accessToken",
  ]);
  const path = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
  const accessToken = accessCookie.accessToken; //jwt

  useEffect(() => {
    const accessToken = accessCookie.accessToken; //jwt
    if (accessToken) {
      //logged in
      fetchUserProfile(accessToken);
    } else {
      setLoading(false);
    }
  }, [accessToken]);

  const fetchUserProfile = async (accessToken) => {
    try {
      const response = await axios.get(`${path}/auth/get`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      const userData = await response.data;
      console.log("userData", userData);
      setUser(userData.user);
      setRole(userData.userType);
    } catch (error) {
      console.error("Error fetching user profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    removeAccessCookie("accessToken");
    setUser(null);
    setRole(null);
    localStorage.removeItem("checkpoint");
  };

  const value = {
    user,
    setUser,
    role,
    accessToken,
    loading,
    logout,
    path,
    isAuthenticated: !!accessToken,
  };

  console.log("role from context file", role);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

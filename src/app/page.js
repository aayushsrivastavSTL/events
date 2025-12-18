"use client";
import React, { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserContext } from "@/context/UserContext";
import { ImSpinner2 } from "react-icons/im";

const Home = () => {
  const router = useRouter();
  const { user, role, loading } = useContext(UserContext);
  const [checkpoint, setCheckpoint] = useState(null);
  const [isClient, setIsClient] = useState(false);

  // Read checkpoint from localStorage only on client side
  useEffect(() => {
    setIsClient(true);
    const storedCheckpoint = localStorage.getItem("checkpoint");
    if (storedCheckpoint) {
      try {
        setCheckpoint(JSON.parse(storedCheckpoint));
      } catch (error) {
        console.error("Failed to parse checkpoint:", error);
        setCheckpoint(null);
      }
    }
  }, []);

  useEffect(() => {
    // Wait for client-side hydration and loading to complete
    if (!isClient || loading) return;

    console.log("user from home", user);
    console.log("role from home", role);
    console.log("checkpoint from home", checkpoint);

    // user not logged in
    if (user === null) {
      router.push("/SignIn");
      return;
    }

    // user logged in → redirect by role
    if (role === "VOLUNTEER") {
      if (checkpoint) {
        router.push("/scan");
      } else {
        router.push("/checkpoint");
      }
    } else if (role === "ADMIN") {
      router.push("/admin");
    } else {
      router.push("/not-found");
    }
  }, [role, loading, router, user, checkpoint, isClient]);

  return (
    <div className="w-full h-screen flex justify-center items-center">
      {(loading || !isClient) && (
        <div className="flex flex-col items-center gap-3">
          <ImSpinner2 className="animate-spin text-4xl text-orange-500" />
          <p className="text-gray-600">Loading...</p>
        </div>
      )}
    </div>
  );
};

export default Home;
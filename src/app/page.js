"use client";
import React, { useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserContext } from "@/context/UserContext";
import { ImSpinner2 } from "react-icons/im";
const Home = () => {
  const router = useRouter();
  const { user, role, loading } = useContext(UserContext);
  console.log("user from home", user);
  console.log("role from home", role);

  useEffect(() => {
    if (loading) return;

    // user not logged in
    if (user === null) {
      router.push("/SignIn");
      return;
    }

    // user logged in → redirect by role
    if (role === "VOLUNTEER") {
      router.push("/scan");
    } else if (role === "ADMIN") {
      router.push("/admin");
    }
  }, [role, loading, router]);

  return (
    <div className="w-full h-full flex justify-center items-center">
      {loading && (
        <div>
          <ImSpinner2 className="animate-spin text-2xl text-orange-500" />
        </div>
      )}
    </div>
  );
};

export default Home;

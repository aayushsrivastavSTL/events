"use client";
import React, { useContext, useState, useEffect } from "react";
import { UserContextProvider } from "@/context/UserContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { CookiesProvider } from "react-cookie";

const ClientProvider = ({ children }) => {
  return (
    <CookiesProvider>
      <UserContextProvider>
        {children}
        <ToastContainer
          position="top-right"
          autoClose={2500}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          pauseOnHover
          draggable
        />
      </UserContextProvider>
    </CookiesProvider>
  );
};

export default ClientProvider;

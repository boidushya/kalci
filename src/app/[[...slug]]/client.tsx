"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Toaster } from "@/components/ui/sonner";
import "@/styles/globals.css";

const App = dynamic(() => import("../../App"), { ssr: false });
const ThemeProvider = dynamic(() => import("../../components/ThemeProvider"), {
  ssr: false,
});

export function ClientOnly() {
  return (
    <ThemeProvider
      defaultTheme="system"
      attribute="class"
      enableSystem
      disableTransitionOnChange
    >
      <App />
      <Toaster richColors />
    </ThemeProvider>
  );
}

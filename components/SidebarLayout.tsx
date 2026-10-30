"use client";

import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import MainContent from "./MainContent";

const SIDEBAR_STORAGE_KEY = "maya_sidebar_open";

export default function SidebarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [hasLoadedPreference, setHasLoadedPreference] = useState(false);

  useEffect(() => {
    let storedPreference = null;
    try { storedPreference = window.localStorage.getItem(SIDEBAR_STORAGE_KEY); }
    catch { /* A blocked preference store must not prevent navigation. */ }

    if (storedPreference !== null) {
      setSidebarOpen(storedPreference === "true");
    } else {
      setSidebarOpen(window.matchMedia("(min-width: 768px)").matches);
    }

    setHasLoadedPreference(true);
  }, []);

  useEffect(() => {
    if (!hasLoadedPreference) {
      return;
    }

    try { window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(sidebarOpen)); }
    catch { /* Keep the current navigation usable without persistent preferences. */ }
  }, [hasLoadedPreference, sidebarOpen]);

  return (
    <>
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((o) => !o)}
      />
      <MainContent
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((o) => !o)}
      >
        {children}
      </MainContent>
    </>
  );
}

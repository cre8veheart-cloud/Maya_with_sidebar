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
    const storedPreference = window.localStorage.getItem(SIDEBAR_STORAGE_KEY);

    if (storedPreference !== null) {
      setSidebarOpen(storedPreference === "true");
    }

    setHasLoadedPreference(true);
  }, []);

  useEffect(() => {
    if (!hasLoadedPreference) {
      return;
    }

    window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(sidebarOpen));
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

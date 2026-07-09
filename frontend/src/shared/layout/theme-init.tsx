"use client";

import { useEffect } from "react";

type WorkspaceSettings = {
  softDarkMode?: boolean;
};

export function ThemeInit() {
  useEffect(() => {
    const raw = window.localStorage.getItem("smartdiet-settings");
    const settings = raw ? (JSON.parse(raw) as WorkspaceSettings) : {};
    document.documentElement.dataset.theme = settings.softDarkMode ? "dark" : "light";
  }, []);

  return null;
}

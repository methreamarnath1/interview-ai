
import { Moon, Sun } from "lucide-react";
import { useState, useEffect } from "react";
import { getThemePreference, saveThemePreference } from "@/utils/localStorage";

export const DarkModeToggle = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Initialize from localStorage
    const storedPreference = getThemePreference();
    setIsDarkMode(storedPreference);

    // Apply theme to document
    if (storedPreference) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    saveThemePreference(newMode);
    
    if (newMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <button
      onClick={toggleDarkMode}
      className="fixed top-4 right-4 z-50 p-2 rounded-full bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg hover:scale-110 transition-all duration-300 dark:bg-black/20"
      aria-label="Toggle dark mode"
    >
      {isDarkMode ? (
        <Sun className="h-5 w-5 text-yellow-400" />
      ) : (
        <Moon className="h-5 w-5 text-blue-700" />
      )}
    </button>
  );
};

export default DarkModeToggle;

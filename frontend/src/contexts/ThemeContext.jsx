import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext(null);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

const getTheme = () => {
  if (typeof window === "undefined") return "dark";
  const dataTheme = document.documentElement.getAttribute("data-theme");
  return dataTheme || localStorage.getItem("theme") || "dark";
};

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => getTheme());

  useEffect(() => {
    // Set initial theme
    if (typeof window !== "undefined") {
      document.documentElement.setAttribute("data-theme", theme);
      localStorage.setItem("theme", theme);
    }
  }, [theme]);

  useEffect(() => {
    // Listen for storage changes (from other tabs/windows)
    const handleStorageChange = (e) => {
      if (e.key === "theme") {
        const newTheme = e.newValue || getTheme();
        setThemeState(newTheme);
        document.documentElement.setAttribute("data-theme", newTheme);
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Listen for DOM attribute changes
    const observer = new MutationObserver(() => {
      const currentTheme = getTheme();
      if (currentTheme !== theme) {
        setThemeState(currentTheme);
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      observer.disconnect();
    };
  }, [theme]);

  const setTheme = (newTheme) => {
    setThemeState(newTheme);
    if (typeof window !== "undefined") {
      document.documentElement.setAttribute("data-theme", newTheme);
      localStorage.setItem("theme", newTheme);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "nord" : "dark";
    setTheme(newTheme);
  };

  const value = {
    theme,
    setTheme,
    toggleTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

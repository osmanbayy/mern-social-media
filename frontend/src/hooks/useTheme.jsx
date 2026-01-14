import { useState, useEffect } from "react";

const getTheme = () => {
  const dataTheme = document.documentElement.getAttribute("data-theme");
  return dataTheme || localStorage.getItem("theme") || "dark";
};

export const useTheme = () => {
  const [theme, setTheme] = useState(getTheme);

  useEffect(() => {
    const updateTheme = () => {
      setTheme(getTheme());
    };

    updateTheme();

    const observer = new MutationObserver(() => {
      setTheme(getTheme());
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    const handleStorageChange = () => {
      setTheme(getTheme());
    };
    window.addEventListener("storage", handleStorageChange);

    return () => {
      observer.disconnect();
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return theme;
};

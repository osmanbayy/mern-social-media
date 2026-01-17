// src/components/ToggleTheme.jsx
import { LuMoon, LuSun } from "react-icons/lu";
import { useTheme } from "../contexts/ThemeContext";

const ToggleTheme = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative w-16 h-8 rounded-full bg-base-300 transition-colors duration-500 focus:outline-none"
      aria-label="Toggle theme"
    >
      <div
        className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-base-100 flex items-center justify-center transition-transform duration-500 ease-in-out ${
          theme === "dark" ? "translate-x-0" : "translate-x-8"
        }`}
      >
        {theme === "dark" ? (
          <LuMoon className="w-4 h-4 text-blue-500 transition-opacity duration-500" />
        ) : (
          <LuSun className="w-4 h-4 text-amber-500 transition-opacity duration-500" />
        )}
      </div>
    </button>
  );
};

export default ToggleTheme;

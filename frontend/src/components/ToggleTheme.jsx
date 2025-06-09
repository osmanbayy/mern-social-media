// src/components/ToggleTheme.jsx
import { useEffect, useState } from "react";
import { BiMoon, BiSun } from "react-icons/bi";

const ToggleTheme = () => {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "emerald"
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "emerald" ? "forest" : "emerald"));
  };

  return (
    <div
      onClick={toggleTheme}
      className="flex items-center gap-2 cursor-pointer"
    >
      Temayı Değiştir
      <div>
        <label className="swap w-full swap-rotate cursor-pointer text-xl">
          <input
            type="checkbox"
            onChange={toggleTheme}
            checked={theme === "forest"}
          />
          <BiSun className="swap-on" />
          <BiMoon className="swap-off" />
        </label>
      </div>
    </div>
  );
};

export default ToggleTheme;

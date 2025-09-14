// src/components/ToggleTheme.jsx
import { useEffect, useState } from "react";
import { BiMoon, BiSun } from "react-icons/bi";

const ToggleTheme = () => {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "dark"
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
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
            checked={theme === "dark"}
          />
          <BiSun className="swap-on" />
          <BiMoon className="swap-off" />
        </label>
      </div>
    </div>
  );
};

export default ToggleTheme;

// src/components/ToggleTheme.jsx
import { useEffect, useState } from "react";
import { BiMoon, BiSun } from "react-icons/bi";

const ToggleTheme = () => {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "fantasy"
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "fantasy" ? "dracula" : "fantasy"));
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
            checked={theme === "dracula"}
          />
          <BiSun className="swap-on" />
          <BiMoon className="swap-off" />
        </label>
      </div>
    </div>
  );
};

export default ToggleTheme;

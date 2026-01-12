import ToggleTheme from "../ToggleTheme";
import { LuPalette, LuMonitor, LuMoon, LuSun } from "react-icons/lu";

const DisplayAndTheme = () => {
  return (
    <div className="w-full flex flex-col gap-6">
      {/* Theme Card */}
      <div className="p-6 rounded-2xl bg-base-200/30 backdrop-blur-sm border border-base-300/50 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <LuPalette className="w-5 h-5 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-base-content">Tema Ayarları</h3>
        </div>
        
        <div className="flex flex-col gap-4">
          <div className="p-4 rounded-xl bg-base-100/50 border border-base-300/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <LuSun className="w-5 h-5 text-amber-500" />
                  <LuMoon className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-base-content">Tema</p>
                  <p className="text-xs text-base-content/60">
                    Açık veya koyu tema arasında geçiş yapın
                  </p>
                </div>
              </div>
              <ToggleTheme />
            </div>
          </div>
        </div>
      </div>

      {/* Display Options Card */}
      <div className="p-6 rounded-2xl bg-base-200/30 backdrop-blur-sm border border-base-300/50 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <LuMonitor className="w-5 h-5 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-base-content">Görünüm Ayarları</h3>
        </div>
        
        <div className="flex flex-col gap-4">
          <div className="p-4 rounded-xl bg-base-100/50 border border-base-300/30">
            <p className="text-sm text-base-content/70">
              Görünüm ayarları yakında eklenecek.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisplayAndTheme;
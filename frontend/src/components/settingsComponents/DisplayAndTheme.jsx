import ToggleTheme from "../ToggleTheme";
import { LuPalette, LuMonitor, LuMoon, LuSun } from "react-icons/lu";

const DisplayAndTheme = () => {
  return (
    <div className="flex w-full flex-col gap-6">
      <div className="rounded-3xl border border-base-300/55 bg-gradient-to-b from-base-100 to-base-200/25 p-6 shadow-xl ring-1 ring-black/5 dark:to-base-300/15 md:p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/12 text-accent">
            <LuPalette className="h-5 w-5" strokeWidth={2} />
          </div>
          <div>
            <h3 className="font-bold text-base-content">Tema</h3>
            <p className="text-sm text-base-content/55">Açık veya koyu görünüm</p>
          </div>
        </div>

        <div className="rounded-2xl border border-base-300/45 bg-base-100/70 p-4 md:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <LuSun className="h-6 w-6 text-amber-500" />
                <LuMoon className="h-6 w-6 text-indigo-400" />
              </div>
              <div>
                <p className="font-semibold text-base-content">Renk modu</p>
                <p className="text-sm text-base-content/55">Sistem temasına uyum için cihaz ayarını kullanabilirsin</p>
              </div>
            </div>
            <div className="shrink-0 sm:pl-4">
              <ToggleTheme />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-base-300/55 bg-gradient-to-b from-base-100 to-base-200/25 p-6 shadow-xl ring-1 ring-black/5 dark:to-base-300/15 md:p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/12 text-accent">
            <LuMonitor className="h-5 w-5" strokeWidth={2} />
          </div>
          <div>
            <h3 className="font-bold text-base-content">Görünüm</h3>
            <p className="text-sm text-base-content/55">Yazı ve düzen seçenekleri</p>
          </div>
        </div>

        <div className="rounded-2xl border border-dashed border-base-300/60 bg-base-200/20 px-4 py-8 text-center">
          <p className="text-sm text-base-content/60">Ek görünüm ayarları yakında.</p>
        </div>
      </div>
    </div>
  );
};

export default DisplayAndTheme;

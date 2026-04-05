import { LuSearch } from "react-icons/lu";

/**
 * @param {{ compact?: boolean }} props
 */
export default function SearchNoQueryPrompt({ compact = false }) {
  if (compact) {
    return (
      <div className="rounded-2xl border border-base-300/35 bg-base-100/40 px-4 py-6 text-center dark:bg-base-200/15">
        <LuSearch
          className="mx-auto mb-3 h-10 w-10 text-base-content/15"
          strokeWidth={1.25}
        />
        <p className="text-sm font-medium text-base-content/60">
          Kullanıcı veya gönderi aramak için yukarıya yazın
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-base-300/40 bg-base-100/50 px-6 py-14 text-center dark:bg-base-200/20">
      <LuSearch className="mx-auto mb-4 h-16 w-16 text-base-content/15" strokeWidth={1.25} />
      <p className="text-sm font-medium text-base-content/65">Arama yapmak için bir şeyler yazın</p>
    </div>
  );
}

export default function SettingsContentHeader({ label, description }) {
  return (
    <header className="mb-8 border-b border-base-300/35 pb-6">
      <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-base-content/40">Ayarlar</p>
      <h1 className="text-2xl font-bold tracking-tight text-base-content md:text-3xl">{label}</h1>
      <p className="mt-2 text-sm text-base-content/55">{description}</p>
    </header>
  );
}

import ChatAppearancePanel from "../chat/ChatAppearancePanel";
import SettingsPlaceholder from "./SettingsPlaceholder";

export default function SettingsAccessibilitySection() {
  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-base-300/40 bg-base-200/20 p-5 md:p-6">
        <h2 className="text-base font-semibold text-base-content">Sohbet görünümü</h2>
        <p className="mt-1 text-sm text-base-content/55">
          Mesaj ekranı arka planı ve balon renkleri. Aynı seçenekleri sohbet başlığındaki menüden de açabilirsin.
        </p>
        <div className="mt-6">
          <ChatAppearancePanel />
        </div>
      </section>
      <SettingsPlaceholder
        title="Diğer erişilebilirlik seçenekleri"
        description="Yazı boyutu, hareket azaltma ve daha fazlası ileride burada olacak."
      />
    </div>
  );
}

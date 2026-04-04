import AccountInformation from "./AccountInformation";
import BlockedAccounts from "./BlockedAccounts";
import DisplayAndTheme from "./DisplayAndTheme";
import SettingsPlaceholder from "./SettingsPlaceholder";
import SettingsAccessibilitySection from "./SettingsAccessibilitySection";

export default function SettingsContentRouter({ selectedId }) {
  switch (selectedId) {
    case "Hesap Detayları":
      return <AccountInformation />;
    case "Bildirim Ayarları":
      return (
        <SettingsPlaceholder
          title="Bildirim ayarları yakında"
          description="Hangi bildirimleri alacağını buradan yönetebileceksin."
        />
      );
    case "Gizlilik ve Güvenlik":
      return (
        <SettingsPlaceholder
          title="Gizlilik ve güvenlik yakında"
          description="İki adımlı doğrulama ve gizlilik seçenekleri üzerinde çalışıyoruz."
        />
      );
    case "Engellenen Hesaplar":
      return <BlockedAccounts />;
    case "Erişilebilirlik":
      return <SettingsAccessibilitySection />;
    case "Yardım Merkezi":
      return (
        <SettingsPlaceholder
          title="Yardım merkezi yakında"
          description="Sık sorulan sorular ve destek burada olacak."
        />
      );
    case "Görünüm ve Tema":
      return <DisplayAndTheme />;
    default:
      return null;
  }
}

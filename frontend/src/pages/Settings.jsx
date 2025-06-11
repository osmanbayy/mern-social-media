import { useState } from "react";
import { FaArrowLeft, FaChevronRight } from "react-icons/fa6";
import AccountInformation from "../components/settingsComponents/AccountInformation";
import DisplayAndTheme from "../components/settingsComponents/DisplayAndTheme";
import { useNavigate } from "react-router-dom";

const Settings = () => {
  const [selectedSetting, setSelectedSetting] = useState("Hesap Detayları");
  const navigate = useNavigate();

  const menuItems = [
    "Hesap Detayları",
    "Bildirim Ayarları",
    "Gizlilik ve Güvenlik",
    "Erişilebilirlik",
    "Yardım Merkezi",
    "Görünüm ve Tema",
  ];

  const renderContent = () => {
    switch (selectedSetting) {
      case "Hesap Detayları":
        return <AccountInformation />;
      case "Bildirim Ayarları":
        return <p>Burada Bildirim Ayarları içeriği yer alacak.</p>;
      case "Gizlilik ve Güvenlik":
        return <p>Burada Gizlilik ve Güvenlik içeriği yer alacak.</p>;
      case "Erişilebilirlik":
        return <p>Burada Erişilebilirlik içeriği yer alacak.</p>;
      case "Yardım Merkezi":
        return <p>Burada Yardım Merkezi içeriği yer alacak.</p>;
      case "Görünüm ve Tema":
        return <DisplayAndTheme />;
      default:
        return;
    }
  };

  return (
    <div className="flex min-h-screen w-full">
      {/* Sol Menü */}
      <div className="flex-[1] border-r border-gray-700">
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center gap-5">
            <div
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-base-100 cursor-pointer transition-all rounded-full invert-25"
            >
              <FaArrowLeft />
            </div>
            <p className="font-bold">Ayarlar</p>
          </div>
        </div>
        <div className="w-full pt-4">
          <div className="flex flex-col w-full items-start">
            {menuItems.map((item) => (
              <div
                key={item}
                onClick={() => setSelectedSetting(item)}
                className={`flex justify-between items-center transition-all w-full p-4 cursor-pointer ${
                  selectedSetting === item ? "bg-base-200" : "hover:bg-base-300"
                }`}
              >
                {item}
                <FaChevronRight />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sağ İçerik */}
      <div className="flex-[1] p-6">
        <h2 className="text-xl font-bold mb-4">{selectedSetting}</h2>
        {renderContent()}
      </div>
    </div>
  );
};

export default Settings;

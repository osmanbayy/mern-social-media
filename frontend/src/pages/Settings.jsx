import { useState } from "react";
import { FaArrowLeft } from "react-icons/fa6";
import { 
  LuUser, 
  LuBell, 
  LuShield, 
  LuAccessibility, 
  LuPalette,
  LuChevronRight,
  LuMenu,
  LuX
} from "react-icons/lu";
import { HiQuestionMarkCircle } from "react-icons/hi2";
import AccountInformation from "../components/settingsComponents/AccountInformation";
import DisplayAndTheme from "../components/settingsComponents/DisplayAndTheme";
import { useNavigate } from "react-router-dom";

const Settings = () => {
  const [selectedSetting, setSelectedSetting] = useState("Hesap Detayları");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const menuItems = [
    { 
      id: "Hesap Detayları", 
      label: "Hesap Detayları", 
      icon: LuUser 
    },
    { 
      id: "Bildirim Ayarları", 
      label: "Bildirim Ayarları", 
      icon: LuBell 
    },
    { 
      id: "Gizlilik ve Güvenlik", 
      label: "Gizlilik ve Güvenlik", 
      icon: LuShield 
    },
    { 
      id: "Erişilebilirlik", 
      label: "Erişilebilirlik", 
      icon: LuAccessibility 
    },
    { 
      id: "Yardım Merkezi", 
      label: "Yardım Merkezi", 
      icon: HiQuestionMarkCircle 
    },
    { 
      id: "Görünüm ve Tema", 
      label: "Görünüm ve Tema", 
      icon: LuPalette 
    },
  ];

  const renderContent = () => {
    switch (selectedSetting) {
      case "Hesap Detayları":
        return <AccountInformation />;
      case "Bildirim Ayarları":
        return (
          <div className="flex flex-col gap-4">
            <div className="p-6 rounded-2xl bg-base-200/30 backdrop-blur-sm border border-base-300/50">
              <p className="text-base-content/70">Bildirim ayarları yakında eklenecek.</p>
            </div>
          </div>
        );
      case "Gizlilik ve Güvenlik":
        return (
          <div className="flex flex-col gap-4">
            <div className="p-6 rounded-2xl bg-base-200/30 backdrop-blur-sm border border-base-300/50">
              <p className="text-base-content/70">Gizlilik ve güvenlik ayarları yakında eklenecek.</p>
            </div>
          </div>
        );
      case "Erişilebilirlik":
        return (
          <div className="flex flex-col gap-4">
            <div className="p-6 rounded-2xl bg-base-200/30 backdrop-blur-sm border border-base-300/50">
              <p className="text-base-content/70">Erişilebilirlik ayarları yakında eklenecek.</p>
            </div>
          </div>
        );
      case "Yardım Merkezi":
        return (
          <div className="flex flex-col gap-4">
            <div className="p-6 rounded-2xl bg-base-200/30 backdrop-blur-sm border border-base-300/50">
              <p className="text-base-content/70">Yardım merkezi yakında eklenecek.</p>
            </div>
          </div>
        );
      case "Görünüm ve Tema":
        return <DisplayAndTheme />;
      default:
        return;
    }
  };

  const handleSettingClick = (itemId) => {
    setSelectedSetting(itemId);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex min-h-screen w-full">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-80 border-r border-base-300/50 bg-base-100">
        <div className="w-full flex flex-col">
          {/* Header */}
          <div className="sticky top-0 z-10 p-6 border-b border-base-300/50 bg-base-100/95 backdrop-blur-md">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 rounded-full hover:bg-base-200 transition-colors"
              >
                <FaArrowLeft className="w-5 h-5" />
              </button>
              <p className="font-bold text-xl">Ayarlar</p>
            </div>
          </div>

          {/* Menu Items */}
          <div className="flex-1 overflow-y-auto">
            <div className="flex flex-col p-4 gap-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedSetting(item.id)}
                    className={`flex items-center gap-4 px-5 py-4 rounded-xl transition-all duration-200 text-left ${
                      selectedSetting === item.id
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-base-content/70 hover:bg-base-200/50 hover:text-base-content"
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="flex-1 text-base">{item.label}</span>
                    {selectedSetting === item.id && (
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-base-100/95 backdrop-blur-md border-b border-base-300/50 shadow-lg">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-full hover:bg-base-200 transition-colors"
            >
              <FaArrowLeft className="w-5 h-5" />
            </button>
            <p className="font-bold text-lg">Ayarlar</p>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-full hover:bg-base-200 transition-colors relative"
            aria-label="Menu"
          >
            {isMobileMenuOpen ? (
              <LuX className="w-6 h-6 text-base-content" />
            ) : (
              <LuMenu className="w-6 h-6 text-base-content" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay & Sidebar */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Side Menu */}
          <div className="md:hidden fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-base-100 shadow-2xl z-50 transform transition-transform duration-300 ease-out">
            <div className="flex flex-col h-full">
              {/* Menu Header */}
              <div className="flex items-center justify-between p-4 border-b border-base-300/50">
                <p className="font-bold text-lg">Ayarlar</p>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-full hover:bg-base-200 transition-colors"
                  aria-label="Close menu"
                >
                  <LuX className="w-5 h-5" />
                </button>
              </div>

              {/* Menu Items */}
              <div className="flex-1 overflow-y-auto p-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSettingClick(item.id)}
                      className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 text-left w-full ${
                        selectedSetting === item.id
                          ? "bg-primary/10 text-primary font-semibold"
                          : "text-base-content/70 hover:bg-base-200/50 active:bg-base-200"
                      }`}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span className="flex-1 text-base">{item.label}</span>
                      {selectedSetting === item.id && (
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Content Area */}
      <div className="w-full min-h-screen pb-20 md:pb-0">
        <div className="p-4 md:p-6 lg:p-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">
              {selectedSetting}
            </h2>
            <div className="fade-in">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;

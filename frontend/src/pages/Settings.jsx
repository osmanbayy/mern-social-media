import SettingsContentHeader from "../components/settings/SettingsContentHeader";
import SettingsContentRouter from "../components/settings/SettingsContentRouter";
import SettingsMobileBar from "../components/settings/SettingsMobileBar";
import SettingsMobileDrawer from "../components/settings/SettingsMobileDrawer";
import SettingsSidebar from "../components/settings/SettingsSidebar";
import PageShell from "../components/layout/PageShell";
import { useSettingsPage } from "../hooks/useSettingsPage";

const Settings = () => {
  const {
    active,
    selectedId,
    selectSection,
    selectSectionAndCloseMobile,
    mobileMenuOpen,
    setMobileMenuOpen,
    goBack,
  } = useSettingsPage();

  return (
    <PageShell variant="settings">
      <SettingsSidebar selectedId={selectedId} onSelectItem={selectSection} onBack={goBack} />

      <SettingsMobileBar
        activeLabel={active.label}
        menuOpen={mobileMenuOpen}
        onBack={goBack}
        onToggleMenu={() => setMobileMenuOpen((v) => !v)}
      />

      <SettingsMobileDrawer
        open={mobileMenuOpen}
        selectedId={selectedId}
        onSelectSection={selectSectionAndCloseMobile}
        onClose={() => setMobileMenuOpen(false)}
      />

      <div className="flex min-h-screen w-full min-w-0 flex-col pt-[4.25rem] md:w-1/2 md:min-w-0 md:pt-0">
        <div className="w-full flex-1 px-4 py-6 md:px-6 md:py-10 lg:px-8">
          <SettingsContentHeader label={active.label} description={active.description} />
          <div className="fade-in min-w-0">
            <SettingsContentRouter selectedId={selectedId} />
          </div>
        </div>
      </div>
    </PageShell>
  );
};

export default Settings;

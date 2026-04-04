import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SETTINGS_MENU_ITEMS } from "../components/settings/settingsMenuConfig";

export function useSettingsPage() {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState(SETTINGS_MENU_ITEMS[0].id);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const active = useMemo(
    () => SETTINGS_MENU_ITEMS.find((m) => m.id === selectedId) ?? SETTINGS_MENU_ITEMS[0],
    [selectedId]
  );

  const selectSection = useCallback((id) => {
    setSelectedId(id);
  }, []);

  const selectSectionAndCloseMobile = useCallback((id) => {
    setSelectedId(id);
    setMobileMenuOpen(false);
  }, []);

  return {
    active,
    selectedId,
    selectSection,
    selectSectionAndCloseMobile,
    mobileMenuOpen,
    setMobileMenuOpen,
    goBack: () => navigate(-1),
  };
}

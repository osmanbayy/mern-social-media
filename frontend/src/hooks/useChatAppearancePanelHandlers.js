import { useCallback } from "react";
import { contrastTextForBg } from "../constants/chatAppearance";

/**
 * ChatAppearancePanel için tek seferlik change handler'ları.
 */
export function useChatAppearancePanelHandlers(appearance, setAppearance) {
  const onPresetChange = useCallback(
    (e) => {
      const preset = e.target.value;
      if (preset === "custom") {
        setAppearance({
          preset: "custom",
          customMineText: contrastTextForBg(appearance.customMine),
          customTheirsText: contrastTextForBg(appearance.customTheirs),
        });
        return;
      }
      setAppearance({ preset });
    },
    [appearance.customMine, appearance.customTheirs, setAppearance]
  );

  const onChatBgChange = useCallback(
    (e) => setAppearance({ chatBg: e.target.value }),
    [setAppearance]
  );

  const onCustomMine = useCallback(
    (e) => {
      const v = e.target.value;
      setAppearance({
        customMine: v,
        customMineText: contrastTextForBg(v),
      });
    },
    [setAppearance]
  );

  const onCustomTheirs = useCallback(
    (e) => {
      const v = e.target.value;
      setAppearance({
        customTheirs: v,
        customTheirsText: contrastTextForBg(v),
      });
    },
    [setAppearance]
  );

  /** `<select name="bubbleShape" />` vb. için tek handler (referans stabil) */
  const onAppearanceFieldChange = useCallback(
    (e) => {
      const field = e.target.name;
      if (!field) return;
      setAppearance({ [field]: e.target.value });
    },
    [setAppearance]
  );

  return {
    onPresetChange,
    onChatBgChange,
    onCustomMine,
    onCustomTheirs,
    onAppearanceFieldChange,
  };
}

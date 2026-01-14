import { BsEmojiSmileFill } from "react-icons/bs";
import EmojiPicker from "emoji-picker-react";
import { useRef, useEffect } from "react";
import { calculateEmojiPickerPosition } from "../../utils/emojiPickerPosition";

const EMOJI_PICKER_CONFIG = {
  mobile: {
    height: 400,
    maxHeight: 400,
    previewConfig: { showPreview: false },
  },
  desktop: {
    width: 352,
    height: 435,
    previewConfig: { showPreview: true },
  },
};

const EmojiPickerButton = ({ theme, onEmojiClick, showPicker, setShowPicker }) => {
  const emojiButtonRef = useRef(null);
  const emojiPickerRef = useRef(null);

  // Close emoji picker when clicking outside
  useEffect(() => {
    if (!showPicker) return;

    const handleClickOutside = (e) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(e.target) &&
        emojiButtonRef.current &&
        !emojiButtonRef.current.contains(e.target)
      ) {
        setShowPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showPicker, setShowPicker]);

  // Calculate emoji picker position
  useEffect(() => {
    if (!showPicker) return;
    calculateEmojiPickerPosition(emojiButtonRef, emojiPickerRef);
  }, [showPicker]);

  const emojiTheme = theme === "dark" ? "dark" : "nord";
  const emojiColor = theme === "dark" ? "fill-yellow-400" : "fill-blue-500";

  return (
    <div className="relative">
      <div 
        ref={emojiButtonRef}
        className="p-2 rounded-full hover:bg-primary/10 transition-all duration-200 cursor-pointer group"
      >
        <BsEmojiSmileFill
          onClick={() => setShowPicker(!showPicker)}
          className={`w-5 h-5 transition-all duration-200 group-hover:scale-110 ${emojiColor}`}
        />
      </div>
      {showPicker && (
        <>
          {/* Backdrop for mobile */}
          <div 
            className="fixed inset-0 z-[50] md:hidden bg-black/20"
            onClick={() => setShowPicker(false)}
          />
          <div 
            ref={emojiPickerRef}
            className="absolute z-[60] shadow-2xl rounded-2xl overflow-hidden bg-base-100 border border-base-300/50 animate-dropdownFadeIn"
            style={{
              maxWidth: 'calc(100vw - 2rem)',
              maxHeight: 'calc(100vh - 200px)',
            }}
          >
            <div className="md:hidden max-h-[400px] overflow-y-auto">
              <EmojiPicker
                onEmojiClick={onEmojiClick}
                theme={emojiTheme}
                width="100%"
                height={EMOJI_PICKER_CONFIG.mobile.height}
                previewConfig={EMOJI_PICKER_CONFIG.mobile.previewConfig}
                searchDisabled={false}
                skinTonesDisabled={true}
              />
            </div>
            <div className="hidden md:block">
              <EmojiPicker
                onEmojiClick={onEmojiClick}
                theme={emojiTheme}
                width={EMOJI_PICKER_CONFIG.desktop.width}
                height={EMOJI_PICKER_CONFIG.desktop.height}
                previewConfig={EMOJI_PICKER_CONFIG.desktop.previewConfig}
                searchDisabled={false}
                skinTonesDisabled={true}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default EmojiPickerButton;

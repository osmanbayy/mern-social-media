export const calculateEmojiPickerPosition = (buttonRef, pickerRef) => {
  if (!buttonRef.current || !pickerRef.current) return;

  const button = buttonRef.current;
  const picker = pickerRef.current;
  const buttonRect = button.getBoundingClientRect();
  const pickerRect = picker.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  const OFFSET = 8;
  let left = 0;
  let top = buttonRect.height + OFFSET;
  let transform = '';

  // Check if picker would overflow on the right
  if (buttonRect.left + pickerRect.width > viewportWidth) {
    left = viewportWidth - buttonRect.right;
    transform = 'translateX(-100%)';
  }

  // Check if picker would overflow on the bottom (mobile)
  if (buttonRect.bottom + pickerRect.height > viewportHeight) {
    top = -(pickerRect.height + OFFSET);
    transform = transform ? `${transform} translateY(-100%)` : 'translateY(-100%)';
  }

  picker.style.left = `${left}px`;
  picker.style.top = `${top}px`;
  if (transform) {
    picker.style.transform = transform;
  }
};

import { useState, useEffect, useRef } from "react";

const useMention = (text, setText, textareaRef) => {
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 });
  const [mentionStartIndex, setMentionStartIndex] = useState(-1);

  // Calculate dropdown position
  const updateDropdownPosition = () => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const selectionStart = textarea.selectionStart;
    
    // Create a temporary element to measure text position
    const div = document.createElement("div");
    const style = window.getComputedStyle(textarea);
    const stylesToCopy = [
      "font", "fontSize", "fontFamily", "fontWeight", "lineHeight",
      "padding", "border", "wordWrap", "whiteSpace", "boxSizing", "letterSpacing"
    ];
    
    stylesToCopy.forEach(prop => {
      div.style[prop] = style[prop];
    });
    
    div.style.position = "absolute";
    div.style.visibility = "hidden";
    div.style.whiteSpace = "pre-wrap";
    div.style.width = textarea.offsetWidth + "px";
    div.style.wordBreak = "break-word";
    
    document.body.appendChild(div);
    
    // Get text before cursor
    const textBeforeCursor = text.substring(0, selectionStart);
    div.textContent = textBeforeCursor;
    
    // Create a span to mark the mention position
    const span = document.createElement("span");
    span.textContent = "|";
    div.appendChild(span);
    
    const textareaRect = textarea.getBoundingClientRect();
    const divRect = div.getBoundingClientRect();
    const spanRect = span.getBoundingClientRect();
    
    document.body.removeChild(div);
    
    // Calculate position relative to textarea's parent container
    // Get the parent container (should be relative positioned)
    const parentContainer = textarea.parentElement;
    
    if (!parentContainer) {
      // Fallback to textarea-relative positioning
      setMentionPosition({
        top: spanRect.top - textareaRect.top + textarea.scrollTop + 25,
        left: spanRect.left - textareaRect.left + textarea.scrollLeft,
      });
      return;
    }
    
    const parentRect = parentContainer.getBoundingClientRect();
    
    // Calculate position relative to parent container
    const relativeTop = spanRect.top - parentRect.top + parentContainer.scrollTop + 25;
    const relativeLeft = spanRect.left - parentRect.left + parentContainer.scrollLeft;
    
    // Ensure dropdown stays within bounds
    const maxTop = parentContainer.offsetHeight - 20;
    const maxLeft = parentContainer.offsetWidth - 280;
    
    setMentionPosition({
      top: Math.max(0, Math.min(relativeTop, maxTop)),
      left: Math.max(0, Math.min(relativeLeft, maxLeft)),
    });
  };

  // Handle text change and detect @ mentions
  const handleTextChange = (e) => {
    const newText = e.target.value;
    const cursorPosition = e.target.selectionStart;
    
    setText(newText);
    
    // Find @ mention
    const textBeforeCursor = newText.substring(0, cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");
    
    if (lastAtIndex !== -1) {
      // Check if there's a space after @ (meaning mention ended)
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
      const hasSpace = textAfterAt.includes(" ") || textAfterAt.includes("\n");
      
      if (!hasSpace) {
        // Extract query after @
        const query = textAfterAt.trim();
        setMentionQuery(query);
        setMentionStartIndex(lastAtIndex);
        setShowMentionDropdown(true);
        // Use requestAnimationFrame to ensure DOM is updated
        requestAnimationFrame(() => {
          updateDropdownPosition();
        });
        return;
      }
    }
    
    // Close dropdown if no valid mention
    setShowMentionDropdown(false);
    setMentionQuery("");
    setMentionStartIndex(-1);
  };

  // Handle user selection from dropdown
  const handleSelectUser = (user) => {
    if (mentionStartIndex === -1) return;
    
    const textBeforeMention = text.substring(0, mentionStartIndex);
    const textAfterMention = text.substring(mentionStartIndex + 1 + mentionQuery.length);
    const newText = `${textBeforeMention}@${user.username} ${textAfterMention}`;
    
    setText(newText);
    setShowMentionDropdown(false);
    setMentionQuery("");
    setMentionStartIndex(-1);
    
    // Set cursor position after inserted mention
    setTimeout(() => {
      if (textareaRef.current) {
        const newCursorPos = textBeforeMention.length + user.username.length + 2; // +2 for @ and space
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
        textareaRef.current.focus();
      }
    }, 0);
  };

  // Close dropdown
  const closeMentionDropdown = () => {
    setShowMentionDropdown(false);
    setMentionQuery("");
    setMentionStartIndex(-1);
  };

  // Update position when text changes
  useEffect(() => {
    if (showMentionDropdown) {
      updateDropdownPosition();
    }
  }, [text, showMentionDropdown]);

  return {
    showMentionDropdown,
    mentionQuery,
    mentionPosition,
    handleTextChange,
    handleSelectUser,
    closeMentionDropdown,
  };
};

export default useMention;

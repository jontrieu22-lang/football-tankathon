function button(text, action, disabled = false, cls = "") {
  return `<button class="${cls}" data-action="${action}" ${disabled ? "disabled" : ""}>${text}</button>`;
}

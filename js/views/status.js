const VISIBLE_MS = 5000;

export function createStatus(container) {
  let hideTimer;

  return function show(message) {
    container.textContent = message;
    container.hidden = false;
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => (container.hidden = true), VISIBLE_MS);
  };
}

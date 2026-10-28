// Opens search from anywhere: "/", Ctrl/Cmd+K, or simply typing a letter.
export function onSearchShortcut(openSearch) {
  document.addEventListener('keydown', (event) => {
    if (event.defaultPrevented || isEditing(event.target)) return;
    const text = searchTextFor(event);
    if (text === null) return;
    event.preventDefault();
    openSearch(text);
  });
}

// Returns the text to start the search with, or null when the key isn't a shortcut.
export function searchTextFor(event) {
  if (isPaletteChord(event) || (event.key === '/' && !hasModifier(event))) return '';
  if (hasModifier(event)) return null;
  return /^[\p{L}\p{N}]$/u.test(event.key) ? event.key : null;
}

function isPaletteChord(event) {
  return (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k';
}

function hasModifier(event) {
  return event.ctrlKey || event.metaKey || event.altKey;
}

function isEditing(target) {
  const field = target.closest?.('input, textarea, select, [contenteditable], dialog');
  return Boolean(field) && !field.closest('dialog:not([open])');
}

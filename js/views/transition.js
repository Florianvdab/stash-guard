const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

// Animates DOM changes (tiles moving, appearing, leaving) where the browser supports it.
// Skipped while a modal is open: the transition layer would draw the tiles on top of it.
export function withViewTransition(update) {
  const modalOpen = document.querySelector('dialog[open]');
  if (document.startViewTransition && !reducedMotion.matches && !modalOpen) {
    // A newer transition skips this one (fast typing/clicking); the update itself still runs.
    document.startViewTransition(update).ready.catch(() => {});
  } else {
    update();
  }
}

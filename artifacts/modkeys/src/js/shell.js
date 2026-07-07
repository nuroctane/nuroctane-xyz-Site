/**
 * Handles shell selection (Desktop vs Mobile) BEFORE the main app import graph
 * executes. This prevents module-scope DOM captures from grabbing the wrong elements.
 */

export function selectShell() {
  const isMobile = window.matchMedia('(max-width: 768px), ((pointer: coarse) and (max-width: 1024px))').matches;
  const dShell = document.getElementById('dShell');
  const mShellTpl = document.getElementById('mShellTpl');

  if (!dShell || !mShellTpl) return;

  if (isMobile) {
    // Swap Desktop shell for Mobile shell
    const mShell = mShellTpl.content.cloneNode(true);
    dShell.parentNode.replaceChild(mShell, dShell);
    document.documentElement.classList.add('mk-mobile');
  } else {
    document.documentElement.classList.remove('mk-mobile');
  }
}

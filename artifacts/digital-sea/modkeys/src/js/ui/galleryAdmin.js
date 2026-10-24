/**
 * Community gallery admin (desktop SPA).
 * Password = BOOKS_ADMIN_PASSWORD (same as /books). Unlocking sets an httpOnly
 * admin session cookie (/api/admin/session); the page keeps only a flag saying
 * admin mode is on, never the password.
 * Dialog chrome reuses digital-sea `.bs-*` classes from index.css.
 */

const ADMIN_FLAG = 'book-admin';
/* Older builds kept the password here; clear any copy a tab still holds. */
try { sessionStorage.removeItem('book-admin-pw'); } catch { /* storage blocked */ }

function storedFlag() {
  try { return sessionStorage.getItem(ADMIN_FLAG) === '1'; } catch { return false; }
}

function isDesktop() {
  return !document.documentElement.classList.contains('mk-mobile');
}

export function getAdminState() {
  const fromWin = window.__MODKEYS_ADMIN__;
  const on = fromWin && typeof fromWin.isAdmin === 'boolean' ? fromWin.isAdmin : storedFlag();
  return { isAdmin: !!on && isDesktop() };
}

/** Turning admin off also ends the server session. */
export function publishAdminState({ isAdmin }) {
  const next = { isAdmin: !!isAdmin };
  window.__MODKEYS_ADMIN__ = next;
  try {
    if (next.isAdmin) sessionStorage.setItem(ADMIN_FLAG, '1');
    else sessionStorage.removeItem(ADMIN_FLAG);
  } catch { /* storage blocked: admin lasts for this page only */ }
  if (!next.isAdmin) fetch('/api/admin/session', { method: 'DELETE' }).catch(() => {});
  window.dispatchEvent(new CustomEvent('modkeys-admin-change', { detail: next }));
}

/* The flag outlives the cookie (12 h, or a password change); ask the server. */
if (storedFlag()) {
  fetch('/api/admin/session')
    .then((res) => (res.ok ? res.json() : null))
    .then((data) => {
      if (data && data.admin === false) {
        window.__MODKEYS_ADMIN__ = { isAdmin: false };
        try { sessionStorage.removeItem(ADMIN_FLAG); } catch { /* storage blocked */ }
        window.dispatchEvent(new CustomEvent('modkeys-admin-change', { detail: { isAdmin: false } }));
      }
    })
    .catch(() => {});
}

function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function removeOverlay() {
  document.getElementById('mkAdminOverlay')?.remove();
}

/**
 * Books-page-identical admin password dialogue (digital-sea chrome).
 * @returns {Promise<boolean>} true once the admin session is open
 */
export function promptAdminPassword() {
  return new Promise((resolve) => {
    removeOverlay();
    const root = document.createElement('div');
    root.id = 'mkAdminOverlay';
    root.className = 'bs-overlay';
    root.innerHTML = `
      <div class="bs-admin-prompt" role="dialog" aria-label="Admin access">
        <button type="button" class="bs-modal-close" data-mk-admin-x>✕</button>
        <div class="bs-admin-prompt-label">ADMIN ACCESS</div>
        <input class="bs-admin-prompt-input" type="password" placeholder="Password" autocomplete="current-password" data-mk-admin-pass />
        <div class="bs-admin-prompt-error" data-mk-admin-err style="display:none">Incorrect password</div>
        <button type="button" class="bs-admin-prompt-btn" data-mk-admin-go>UNLOCK</button>
      </div>`;
    document.body.appendChild(root);

    const input = root.querySelector('[data-mk-admin-pass]');
    const err = root.querySelector('[data-mk-admin-err]');
    const finish = (val) => {
      removeOverlay();
      resolve(val);
    };
    root.addEventListener('click', (e) => {
      if (e.target === root) finish(false);
    });
    root.querySelector('[data-mk-admin-x]')?.addEventListener('click', () => finish(false));

    const submit = async () => {
      const password = input?.value || '';
      if (!password) {
        if (err) { err.style.display = 'block'; err.textContent = 'Enter password'; }
        return;
      }
      try {
        /* POST /api/modkeys/gallery with action — same path Vercel already
           serves for gallery save. Multi-segment /gallery/verify-admin is
           NOT_FOUND on Vercel (only one segment under /api/modkeys/*). */
        const res = await fetch('/api/modkeys/gallery', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'verifyAdmin', password }),
        });
        if (res.ok) {
          publishAdminState({ isAdmin: true });
          finish(true);
        } else {
          const body = await res.json().catch(() => ({}));
          const msg = res.status === 500 && body.error
            ? body.error
            : 'Incorrect password';
          if (err) { err.style.display = 'block'; err.textContent = msg; }
          if (input) input.select();
        }
      } catch {
        if (err) { err.style.display = 'block'; err.textContent = 'Network error'; }
      }
    };
    root.querySelector('[data-mk-admin-go]')?.addEventListener('click', submit);
    input?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') submit();
      if (e.key === 'Escape') finish(false);
    });
    input?.focus();
  });
}

/**
 * Books-style rename dialogue for a community build.
 * @returns {Promise<string|null>}
 */
export function promptRename(currentName) {
  return new Promise((resolve) => {
    removeOverlay();
    const root = document.createElement('div');
    root.id = 'mkAdminOverlay';
    root.className = 'bs-overlay';
    root.innerHTML = `
      <div class="bs-admin-prompt" role="dialog" aria-label="Rename build">
        <button type="button" class="bs-modal-close" data-mk-admin-x>✕</button>
        <div class="bs-admin-prompt-label">RENAME BUILD</div>
        <input class="bs-admin-prompt-input" type="text" maxlength="40" value="${esc(currentName)}" data-mk-admin-pass />
        <div class="bs-admin-prompt-error" data-mk-admin-err style="display:none"></div>
        <button type="button" class="bs-admin-prompt-btn" data-mk-admin-go>SAVE NAME</button>
      </div>`;
    document.body.appendChild(root);
    const input = root.querySelector('[data-mk-admin-pass]');
    const err = root.querySelector('[data-mk-admin-err]');
    const finish = (val) => {
      removeOverlay();
      resolve(val);
    };
    root.addEventListener('click', (e) => { if (e.target === root) finish(null); });
    root.querySelector('[data-mk-admin-x]')?.addEventListener('click', () => finish(null));
    const submit = () => {
      const name = (input?.value || '').trim();
      if (!name) {
        if (err) { err.style.display = 'block'; err.textContent = 'Name required'; }
        return;
      }
      finish(name.slice(0, 40));
    };
    root.querySelector('[data-mk-admin-go]')?.addEventListener('click', submit);
    input?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') submit();
      if (e.key === 'Escape') finish(null);
    });
    input?.focus();
    input?.select();
  });
}

/**
 * Books-style confirm delete dialogue.
 * @returns {Promise<boolean>}
 */
export function promptDeleteConfirm(name) {
  return new Promise((resolve) => {
    removeOverlay();
    const root = document.createElement('div');
    root.id = 'mkAdminOverlay';
    root.className = 'bs-overlay';
    root.innerHTML = `
      <div class="bs-admin-prompt" role="dialog" aria-label="Delete build">
        <button type="button" class="bs-modal-close" data-mk-admin-x>✕</button>
        <div class="bs-admin-prompt-label">DELETE BUILD</div>
        <div style="font-family:'JetBrains Mono',monospace;font-size:0.55rem;color:#bdeff2;margin:0.4rem 0 0.8rem;line-height:1.45;opacity:0.9">
          Remove <strong style="color:#e85d5d">${esc(name)}</strong> from the community gallery? This cannot be undone.
        </div>
        <button type="button" class="bs-admin-prompt-btn" data-mk-admin-go style="border-color:rgba(232,93,93,0.35)">DELETE</button>
      </div>`;
    document.body.appendChild(root);
    const finish = (val) => {
      removeOverlay();
      resolve(val);
    };
    root.addEventListener('click', (e) => { if (e.target === root) finish(false); });
    root.querySelector('[data-mk-admin-x]')?.addEventListener('click', () => finish(false));
    root.querySelector('[data-mk-admin-go]')?.addEventListener('click', () => finish(true));
    document.addEventListener('keydown', function onKey(e) {
      if (e.key === 'Escape') {
        document.removeEventListener('keydown', onKey);
        finish(false);
      }
    });
  });
}

export async function adminRenameBuild(id, name) {
  const res = await fetch('/api/modkeys/gallery', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'rename', id, name }),
  });
  if (res.status === 403) publishAdminState({ isAdmin: false });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Rename failed');
  return res.json();
}

export async function adminDeleteBuild(id) {
  const res = await fetch('/api/modkeys/gallery', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'delete', id }),
  });
  if (res.status === 403) publishAdminState({ isAdmin: false });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Delete failed');
  return res.json();
}

export function invalidateGalleryCache() {
  if (window.__MODKEYS__) window.__MODKEYS__.galleryCache = null;
}

export { esc, isDesktop };

/**
 * Community gallery admin (desktop SPA).
 * Password = BOOKS_ADMIN_PASSWORD (same as /books).
 * Dialog chrome reuses Blackboard's shared monochrome glass classes.
 */

const ADMIN_FLAG = 'book-admin';
const ADMIN_PW = 'book-admin-pw';

function isDesktop() {
  return !document.documentElement.classList.contains('mk-mobile');
}

export function getAdminState() {
  const fromWin = window.__MODKEYS_ADMIN__;
  if (fromWin && typeof fromWin.isAdmin === 'boolean') {
    return {
      isAdmin: !!fromWin.isAdmin && isDesktop(),
      password: fromWin.password || sessionStorage.getItem(ADMIN_PW) || '',
    };
  }
  return {
    isAdmin: sessionStorage.getItem(ADMIN_FLAG) === '1' && isDesktop(),
    password: sessionStorage.getItem(ADMIN_PW) || '',
  };
}

export function publishAdminState({ isAdmin, password }) {
  const next = {
    isAdmin: !!isAdmin,
    password: password || '',
  };
  window.__MODKEYS_ADMIN__ = next;
  if (next.isAdmin) {
    sessionStorage.setItem(ADMIN_FLAG, '1');
    if (next.password) sessionStorage.setItem(ADMIN_PW, next.password);
  } else {
    sessionStorage.removeItem(ADMIN_FLAG);
    sessionStorage.removeItem(ADMIN_PW);
  }
  window.dispatchEvent(new CustomEvent('modkeys-admin-change', { detail: next }));
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
 * Blackboard admin password dialogue shared by the community surfaces.
 * @returns {Promise<string|null>} password or null if cancelled
 */
export function promptAdminPassword() {
  return new Promise((resolve) => {
    removeOverlay();
    const root = document.createElement('div');
    root.id = 'mkAdminOverlay';
    root.className = 'bb-modal-overlay';
    root.innerHTML = `
      <div class="bb-admin-modal" role="dialog" aria-label="Admin access">
        <button type="button" class="bb-modal-close" data-mk-admin-x>✕</button>
        <span class="bb-admin-modal-kicker">BLACKBOARD / ADMIN</span>
        <h2>Unlock admin controls</h2>
        <p>Use the shared admin password to manage community builds.</p>
        <input class="bb-admin-input" type="password" placeholder="Password" autocomplete="current-password" data-mk-admin-pass />
        <div class="bb-admin-error" data-mk-admin-err style="display:none"></div>
        <button type="button" class="bb-modal-action bb-admin-submit" data-mk-admin-go>UNLOCK</button>
      </div>`;
    document.body.appendChild(root);

    const input = root.querySelector('[data-mk-admin-pass]');
    const err = root.querySelector('[data-mk-admin-err]');
    const finish = (val) => {
      removeOverlay();
      resolve(val);
    };
    root.addEventListener('click', (e) => {
      if (e.target === root) finish(null);
    });
    root.querySelector('[data-mk-admin-x]')?.addEventListener('click', () => finish(null));

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
          publishAdminState({ isAdmin: true, password });
          finish(password);
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
      if (e.key === 'Escape') finish(null);
    });
    input?.focus();
  });
}

/**
 * Blackboard-styled rename dialogue for a community build.
 * @returns {Promise<string|null>}
 */
export function promptRename(currentName) {
  return new Promise((resolve) => {
    removeOverlay();
    const root = document.createElement('div');
    root.id = 'mkAdminOverlay';
    root.className = 'bb-modal-overlay';
    root.innerHTML = `
      <div class="bb-admin-modal" role="dialog" aria-label="Rename build">
        <button type="button" class="bb-modal-close" data-mk-admin-x>✕</button>
        <span class="bb-admin-modal-kicker">COMMUNITY / BUILD</span>
        <h2>Rename build</h2>
        <input class="bb-admin-input" type="text" maxlength="40" value="${esc(currentName)}" data-mk-admin-pass />
        <div class="bb-admin-error" data-mk-admin-err style="display:none"></div>
        <button type="button" class="bb-modal-action bb-admin-submit" data-mk-admin-go>SAVE NAME</button>
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
 * Blackboard-styled confirm delete dialogue.
 * @returns {Promise<boolean>}
 */
export function promptDeleteConfirm(name) {
  return new Promise((resolve) => {
    removeOverlay();
    const root = document.createElement('div');
    root.id = 'mkAdminOverlay';
    root.className = 'bb-modal-overlay';
    root.innerHTML = `
      <div class="bb-admin-modal" role="dialog" aria-label="Delete build">
        <button type="button" class="bb-modal-close" data-mk-admin-x>✕</button>
        <span class="bb-admin-modal-kicker">COMMUNITY / ADMIN</span>
        <h2>Delete build?</h2>
        <div style="font-family:'JetBrains Mono',monospace;font-size:0.55rem;color:#bdeff2;margin:0.4rem 0 0.8rem;line-height:1.45;opacity:0.9">
          Remove <strong style="color:#e85d5d">${esc(name)}</strong> from the community gallery? This cannot be undone.
        </div>
        <button type="button" class="bb-modal-action bb-modal-action--danger bb-admin-submit" data-mk-admin-go>DELETE</button>
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
  const { password } = getAdminState();
  const res = await fetch('/api/modkeys/gallery', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'rename', password, id, name }),
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Rename failed');
  return res.json();
}

export async function adminDeleteBuild(id) {
  const { password } = getAdminState();
  const res = await fetch('/api/modkeys/gallery', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'delete', password, id }),
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Delete failed');
  return res.json();
}

export function invalidateGalleryCache() {
  if (window.__MODKEYS__) window.__MODKEYS__.galleryCache = null;
}

export { esc, isDesktop };

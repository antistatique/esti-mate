export default class CorrectionPanel {
  constructor() {
    this.container = null;
    this.items = [];
    this.currentIndex = -1;
    this._repositionHandler = null;
    this._keyHandler = null;
    this._lastAccept = null;
    this._lastReject = null;
  }

  init() {
    // Always use a floating container so the panel stays visible
    let floating = document.getElementById('esti-spell-floating-panel');
    if (!floating) {
      floating = document.createElement('div');
      floating.id = 'esti-spell-floating-panel';
      document.body.appendChild(floating);
    }
    this.container = floating;
    // Hidden by default; only shown when spell-check is triggered
    this.hide();
  }

  // Styles now live in content.css bundled by the extension

  renderIntro() {
    if (!this.container) return;
    this.show();
    this.container.innerHTML = `
      <div class="esti-spell-panel">
        <div class="esti-spell-header">
          <h4 style="margin:0;">IA Spelling & Grammar</h4>
        </div>
        <p class="pds-mt-xxs">Use the IA Tools → Spell check to analyze row descriptions and review suggestions here.</p>
      </div>
    `;
  }

  showLoading() {
    if (!this.container) return;
    this.show();
    this.container.innerHTML = `
      <div class="esti-spell-panel">
        <h4>Checking…</h4>
        <p>Please wait while we analyze your estimate.</p>
      </div>
    `;
  }

  setItems(items) {
    this.items = items || [];
  }

  render(onAccept, onReject) {
    if (!this.container) return;
    this.show();
    const hasIssues = this.items.some(i => i.hasIssues);
    if (!hasIssues) { this.hide(); this.container.innerHTML = ''; return; }
    // Set current index to first unresolved if not set
    if (this.currentIndex < 0 || !this.items[this.currentIndex]?.hasIssues) {
      this.currentIndex = this.items.findIndex(i => i.hasIssues);
    }
    this.renderCurrent(onAccept, onReject);
  }

  renderCurrent(onAccept, onReject) {
    const all = this.items;
    const issues = all.filter(i => i.hasIssues);
    const total = issues.length;
    const idx = this.currentIndex >= 0 ? this.currentIndex : 0;
    const item = all[idx];
    if (!item || !item.hasIssues) { this.hide(); this.container.innerHTML = ''; return; }

    // Build panel for a single item
    const pos = Math.max(issues.findIndex(it => it && item && it.id === item.id), 0) + 1;
    const posInfo = `${pos} / ${total}`;
    this.container.innerHTML = `
      <div class="esti-spell-panel">
        <div class="esti-spell-header">
          <h4 style="margin:0;">Row #${item.index + 1} <span class="pds-text-sm" style="opacity:.7">(${posInfo})</span></h4>
          <div class="esti-spell-nav">
            <button class="pds-button pds-button-secondary pds-button-sm" data-nav="prev" aria-keyshortcuts="K ArrowLeft" title="Prev (K / ←)">Prev (K)</button>
            <button class="pds-button pds-button-secondary pds-button-sm" data-nav="next" aria-keyshortcuts="J ArrowRight" title="Next (J / →)">Next (J)</button>
            <button class="pds-button pds-button-secondary pds-button-sm" data-nav="close" aria-keyshortcuts="Escape" title="Close (Esc)" style="margin-left:8px;">✕</button>
          </div>
        </div>
        <div class="esti-spell-item">
          <div class="esti-diff esti-mono" id="esti-corrected-view"></div>
          <div class="esti-spell-actions">
            <button class="pds-button pds-button-sm esti-accept" data-action="accept" data-id="${item.id}" aria-keyshortcuts="A Enter" title="Accept (A / Enter)">Accept (A)</button>
            <button class="pds-button pds-button-sm esti-reject" data-action="reject" data-id="${item.id}" aria-keyshortcuts="R Backspace" title="Reject (R / ⌫)">Reject (R)</button>
          </div>
        </div>
      </div>
    `;

    // Events
    this.container.querySelector('[data-action="accept"]').addEventListener('click', () => onAccept?.(item.id));
    this.container.querySelector('[data-action="reject"]').addEventListener('click', () => onReject?.(item.id));
    this.container.querySelector('[data-nav="prev"]').addEventListener('click', () => this.prev(() => this.renderCurrent(onAccept, onReject)));
    this.container.querySelector('[data-nav="next"]').addEventListener('click', () => this.next(() => this.renderCurrent(onAccept, onReject)));
    const closeBtn = this.container.querySelector('[data-nav="close"]');
    if (closeBtn) closeBtn.addEventListener('click', () => this.hide());

    // Store handlers for keyboard shortcuts
    this._lastAccept = (id) => onAccept?.(id);
    this._lastReject = (id) => onReject?.(id);

    // Scroll to and position near the associated textarea
    const anchor = this.findRowByIndex(item.index)?.querySelector('textarea');
    if (anchor) {
      try {
        anchor.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
      } catch (_) {
        anchor.scrollIntoView(true);
      }
      // Position immediately, then settle after the scroll animation
      this.positionNear(anchor);
      setTimeout(() => this.positionNear(anchor), 200);

      // Build highlighted diff against the current textarea content
      const originalText = anchor.value || '';
      const correctedHtml = this.highlightDiff(originalText, item.corrected || '');
      const view = this.container.querySelector('#esti-corrected-view');
      if (view) view.innerHTML = correctedHtml;
    }
  }

  next(after) {
    if (!this.items.length) return;
    let i = this.currentIndex;
    for (let step = 0; step < this.items.length; step++) {
      i = (i + 1) % this.items.length;
      if (this.items[i]?.hasIssues) { this.currentIndex = i; break; }
    }
    after?.();
  }

  prev(after) {
    if (!this.items.length) return;
    let i = this.currentIndex;
    for (let step = 0; step < this.items.length; step++) {
      i = (i - 1 + this.items.length) % this.items.length;
      if (this.items[i]?.hasIssues) { this.currentIndex = i; break; }
    }
    after?.();
  }

  positionNear(element) {
    const rect = element.getBoundingClientRect();
    const panel = this.container;
    const margin = 12;
    const panelWidth = panel.offsetWidth || 360;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    let top = rect.top + window.scrollY;
    let left = rect.right + margin + window.scrollX;

    // If panel would overflow to the right, place it on the left
    if (left + panelWidth > window.scrollX + viewportWidth) {
      left = rect.left + window.scrollX - panelWidth - margin;
    }
    // Clamp top within viewport
    const maxTop = window.scrollY + viewportHeight - 100;
    if (top > maxTop) top = maxTop;

    panel.style.top = `${top}px`;
    panel.style.left = `${left}px`;
    // Re-measure once on next frame to account for late layout (e.g., template select insertion)
    requestAnimationFrame(() => {
      const r2 = element.getBoundingClientRect();
      let t2 = r2.top + window.scrollY;
      let l2 = r2.right + margin + window.scrollX;
      if (l2 + panelWidth > window.scrollX + window.innerWidth) {
        l2 = r2.left + window.scrollX - panelWidth - margin;
      }
      const mTop2 = window.scrollY + window.innerHeight - 100;
      if (t2 > mTop2) t2 = mTop2;
      panel.style.top = `${t2}px`;
      panel.style.left = `${l2}px`;
    });

    // Do nothing on scroll/resize as requested
    if (this._repositionHandler) {
      window.removeEventListener('scroll', this._repositionHandler, true);
      window.removeEventListener('resize', this._repositionHandler, true);
      this._repositionHandler = null;
    }
  }

  highlightRows(items) {
    items.forEach(item => {
      const row = document.querySelector(`#invoice_item_rows tr[data-esti-row-id="${item.id}"]`) || this.findRowByIndex(item.index);
      if (row && item.hasIssues) row.classList.add('esti-spell-issue-row');
    });
  }

  unhighlightRow(id, index) {
    const row = document.querySelector(`#invoice_item_rows tr[data-esti-row-id="${id}"]`) || this.findRowByIndex(index);
    if (row) row.classList.remove('esti-spell-issue-row');
  }

  findRowByIndex(index) {
    const rows = Array.from(document.querySelectorAll('#invoice_item_rows tr:not(:last-child)'));
    return rows[index] || null;
  }

  escape(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  // Basic word-level diff highlighting: bold the inserted/changed tokens
  highlightDiff(original, corrected) {
    const a = this.tokenize(original);
    const b = this.tokenize(corrected);
    const m = a.length, n = b.length;
    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
    for (let i = m - 1; i >= 0; i--) {
      for (let j = n - 1; j >= 0; j--) {
        dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
    // Backtrack building HTML from corrected tokens
    let i = 0, j = 0;
    let out = '';
    while (i < m && j < n) {
      if (a[i] === b[j]) {
        out += this.escape(b[j]);
        i++; j++;
      } else if (dp[i][j + 1] >= dp[i + 1][j]) {
        // token added/changed in corrected
        out += this.wrapIns(b[j]);
        j++;
      } else {
        // token deleted from original – render as <del> but avoid pure whitespace
        out += this.wrapDel(a[i]);
        i++;
      }
    }
    // Remaining additions in corrected
    while (j < n) {
      out += this.wrapIns(b[j]);
      j++;
    }
    // Remaining deletions in original
    while (i < m) {
      out += this.wrapDel(a[i]);
      i++;
    }
    return out;
  }

  tokenize(s) {
    // Split into words, whitespace and punctuation tokens to preserve formatting
    return String(s).split(/(\s+|[\.,!?:;()\[\]{}'"“”«»–—\-]+)/).filter(t => t !== '');
  }

  wrapIns(token) {
    if (/^\s+$/.test(token)) return this.escape(token);
    return `<b>${this.escape(token)}</b>`;
  }

  wrapDel(token) {
    if (!token || /^\s+$/.test(token)) return '';
    return `<del>${this.escape(token)}</del>`;
  }

  show() {
    if (!this.container) return;
    this.container.style.display = 'block';
    this.addKeyListeners();
  }

  hide() {
    if (!this.container) return;
    this.container.style.display = 'none';
    this.removeKeyListeners();
  }

  addKeyListeners() {
    if (this._keyHandler) return;
    this._keyHandler = (e) => {
      const isTextInput = (el) => el && (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT' || el.isContentEditable);
      const active = document.activeElement;
      if (isTextInput(active) && !['Escape'].includes(e.key)) return;
      if (e.key === 'j' || e.key === 'ArrowRight') {
        e.preventDefault();
        this.next(() => this.renderCurrent(this._lastAccept, this._lastReject));
      } else if (e.key === 'k' || e.key === 'ArrowLeft') {
        e.preventDefault();
        this.prev(() => this.renderCurrent(this._lastAccept, this._lastReject));
      } else if (e.key === 'a' || e.key === 'Enter') {
        e.preventDefault();
        const id = this.items[this.currentIndex]?.id;
        if (id) this._lastAccept && this._lastAccept(id);
      } else if (e.key === 'r' || e.key === 'Backspace') {
        e.preventDefault();
        const id = this.items[this.currentIndex]?.id;
        if (id) this._lastReject && this._lastReject(id);
      } else if (e.key === 'f') {
        e.preventDefault();
        const item = this.items[this.currentIndex];
        const ta = item ? this.findRowByIndex(item.index)?.querySelector('textarea') : null;
        if (ta) try { ta.focus({ preventScroll: true }); } catch(_) { ta.focus(); }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        this.hide();
      }
    };
    document.addEventListener('keydown', this._keyHandler, true);
  }

  removeKeyListeners() {
    if (!this._keyHandler) return;
    document.removeEventListener('keydown', this._keyHandler, true);
    this._keyHandler = null;
  }

  showToast(message, type = 'success', timeout = 2500) {
    let toast = document.getElementById('esti-spell-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'esti-spell-toast';
      toast.className = 'esti-toast';
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      document.body.appendChild(toast);
    }
    toast.className = `esti-toast esti-toast--${type}`;
    toast.textContent = message;
    toast.style.display = 'block';
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => {
      if (toast) toast.style.display = 'none';
    }, timeout);
  }
}

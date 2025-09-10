import CorrectionPanel from './CorrectionPanel.js';

export default class SpellChecker {
  constructor() {
    this.settings = {};
    this.app = null;
    this.panel = new CorrectionPanel();
    this.bound = false;
    this._labelRestore = 'IA Tools';
  }

  init(settings, app) {
    this.settings = settings || {};
    this.app = app;
    this.panel.init();
    this.bindOnce();
  }

  bindOnce() {
    if (this.bound) return;
    this.bound = true;
    document.addEventListener('estiMate:spell-check', () => this.run());
  }

  collectRows() {
    const rows = Array.from(document.querySelectorAll('#invoice_item_rows tr:not(:last-child)'));
    return rows.map((tr, index) => {
      // Try to stamp a stable id on each row for later highlighting
      const existing = tr.getAttribute('data-esti-row-id');
      const id = existing || `row-${index + 1}`;
      if (!existing) tr.setAttribute('data-esti-row-id', id);
      const textarea = tr.querySelector('textarea');
      const text = textarea ? textarea.value : '';
      return { id, index, el: tr, textarea, text };
    });
  }

  async run() {
    try {
      const serverUrl = (this.settings.serverUrl || '').replace(/\/$/, '');
      if (!serverUrl) {
        console.warn('SpellChecker: serverUrl not configured in Options');
      }

      const items = this.collectRows();
      const payload = {
        descriptions: items.map(({ id, text }) => ({ id, text }))
      };

      // Label progress helpers
      const labelEl = document.querySelector('#ia-dropdown-button .ia-label') || document.getElementById('ia-dropdown-button');
      this._labelRestore = labelEl ? (labelEl.textContent || 'IA Tools') : 'IA Tools';
      const setLabel = (txt) => { if (labelEl) labelEl.textContent = txt; };
      // Run per-row requests with limited concurrency for accurate progress
      const byId = new Map(items.map(i => [i.id, i]));
      const total = items.length;
      let completed = 0;
      setLabel(`Checking 0/${total}...`);

      const limit = 3;
      const results = new Array(total);

      const runOne = async (row, idx) => {
        try {
          const res = await fetch(`${serverUrl || 'http://localhost:3000'}/check-spelling`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ descriptions: [{ id: row.id, text: row.text }] })
          });
          const data = await res.json();
          const corr = (data.corrections && data.corrections[0]) || { id: row.id, hasIssues: false, corrected: row.text, changes: [] };
          results[idx] = { ...corr, index: row.index };
        } catch (e) {
          results[idx] = { id: row.id, hasIssues: false, corrected: row.text, changes: [], index: row.index };
        } finally {
          completed += 1;
          setLabel(`Checking ${completed}/${total}...`);
        }
      };
      // Limited concurrency runner
      let next = 0;
      const workers = Array(Math.min(limit, total)).fill(0).map(async () => {
        while (next < total) {
          const idx = next++;
          await runOne(items[idx], idx);
        }
      });
      await Promise.all(workers);

      // Highlight rows
      this.panel.setItems(results);
      this.panel.highlightRows(results);

      // If no issues at first shot, show a toast and stop
      if (!results.some(r => r.hasIssues)) {
        this.panel.hide();
        this.panel.showToast('No spelling/grammar issues found', 'success');
        setLabel(this._labelRestore);
        return;
      }

      // Define handlers so we can re-render with same closures
      const acceptHandler = (id) => {
        const result = results.find(r => r.id === id);
        const base = byId.get(id);
        if (result && base && base.textarea) {
          base.textarea.value = result.corrected;
          base.textarea.dispatchEvent(new Event('input', { bubbles: true }));
          this.panel.unhighlightRow(id, result.index);
          result.hasIssues = false;
          this.panel.setItems(results);
          this.panel.render(acceptHandler, rejectHandler);
          this.app.generateSummary?.();
        }
      };

      const rejectHandler = (id) => {
        const result = results.find(r => r.id === id);
        if (!result) return;
        this.panel.unhighlightRow(id, result.index);
        result.hasIssues = false;
        this.panel.setItems(results);
        this.panel.render(acceptHandler, rejectHandler);
      };

      // Render review panel near the first item with issues
      this.panel.render(acceptHandler, rejectHandler);

      // Restore label after finishing
      setLabel(this._labelRestore);
    } catch (e) {
      console.error('Spell check failed', e);
      this.panel.setItems([]);
      this.panel.renderIntro();
      // Restore label on error
      const labelEl2 = document.querySelector('#ia-dropdown-button .ia-label') || document.getElementById('ia-dropdown-button');
      if (labelEl2) labelEl2.textContent = this._labelRestore || 'IA Tools';
    }
  }
}

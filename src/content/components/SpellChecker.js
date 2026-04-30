import CorrectionPanel from './CorrectionPanel.js';
import collectRows from './utils/collectRows.js';

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

  async run() {
    try {
      const serverUrl = (this.settings.serverUrl || '').replace(/\/$/, '');
      if (!serverUrl) {
        console.warn('SpellChecker: serverUrl not configured in Options');
      }

      const items = collectRows();
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
      // Initialize results with pending placeholders (hasIssues=false so no row
      // appears in the panel until its batch returns with a real verdict).
      const results = items.map((row) => ({
        id: row.id,
        index: row.index,
        hasIssues: false,
        corrected: row.text,
        changes: [],
        pending: true,
        pendingLabel: 'Checking…',
      }));

      let panelOpened = false;
      // Define handlers up front so progressive renders can pass them to render().
      const acceptHandler = (id) => {
        const result = results.find(r => r.id === id);
        if (!result || result.pending) return;
        const base = byId.get(id);
        if (base && base.textarea) {
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

      const refreshPanel = () => {
        this.panel.setItems(results);
        this.panel.highlightRows(results);
        if (!panelOpened) {
          if (results.some(r => r && r.hasIssues)) {
            this.panel.render(acceptHandler, rejectHandler);
            panelOpened = true;
          }
        } else {
          this.panel.refresh();
        }
      };

      const fetchWithTimeout = async (url, options, timeoutMs = 25000) => {
        const ctrl = new AbortController();
        const id = setTimeout(() => ctrl.abort(), timeoutMs);
        try {
          return await fetch(url, { ...options, signal: ctrl.signal });
        } finally { clearTimeout(id); }
      };

      const applyResult = (idx, base, corr) => {
        results[idx] = { ...corr, index: base.index, pending: false };
      };

      const runBatch = async (batch) => {
        const body = JSON.stringify({ descriptions: batch.map(b => ({ id: b.row.id, text: b.row.text })) });
        try {
          const res = await fetchWithTimeout(`${serverUrl || 'http://localhost:3000'}/check-spelling`, {
            method: 'POST', headers: { 'Content-Type': 'application/json', 'X-API-Key': this.settings.airtableKey || '' }, body
          });
          const data = await res.json();
          const list = data.corrections || [];
          batch.forEach((b, i) => {
            const corr = list[i] || { id: b.row.id, hasIssues: false, corrected: b.row.text, changes: [] };
            applyResult(b.idx, b.row, corr);
          });
          completed += batch.length;
          setLabel(`Checking ${completed}/${total}...`);
          refreshPanel();
        } catch (e) {
          // fallback to singles
          for (const b of batch) {
            try {
              const r = await fetchWithTimeout(`${serverUrl || 'http://localhost:3000'}/check-spelling`, {
                method: 'POST', headers: { 'Content-Type': 'application/json', 'X-API-Key': this.settings.airtableKey || '' }, body: JSON.stringify({ descriptions: [{ id: b.row.id, text: b.row.text }] })
              }, 20000);
              const data = await r.json();
              const corr = (data.corrections && data.corrections[0]) || { id: b.row.id, hasIssues: false, corrected: b.row.text, changes: [] };
              applyResult(b.idx, b.row, corr);
            } catch (_) {
              applyResult(b.idx, b.row, { id: b.row.id, hasIssues: false, corrected: b.row.text, changes: [] });
            } finally {
              completed += 1;
              setLabel(`Checking ${completed}/${total}...`);
              refreshPanel();
            }
          }
        }
      };

      // Build batches of up to 2 items with size guard
      const MAX_BATCH_CHARS = 2000;
      const MAX_ROW_CHARS = 1400;
      const batches = [];
      for (let i = 0; i < total;) {
        const first = items[i];
        const len1 = (first.text || '').length;
        if (i === total - 1 || len1 > MAX_ROW_CHARS) {
          batches.push([{ row: first, idx: i }]);
          i += 1;
          continue;
        }
        const second = items[i + 1];
        const len2 = (second.text || '').length;
        if (len1 + len2 <= MAX_BATCH_CHARS) {
          batches.push([{ row: first, idx: i }, { row: second, idx: i + 1 }]);
          i += 2;
        } else {
          batches.push([{ row: first, idx: i }]);
          i += 1;
        }
      }

      let nextBatch = 0;
      const workers = Array(Math.min(limit, batches.length)).fill(0).map(async () => {
        while (nextBatch < batches.length) {
          const idx = nextBatch++;
          await runBatch(batches[idx]);
        }
      });
      await Promise.all(workers);

      // If nothing surfaced any issue, close panel and show success toast.
      if (!panelOpened) {
        this.panel.hide();
        this.panel.showToast('No spelling/grammar issues found', 'success');
      }

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

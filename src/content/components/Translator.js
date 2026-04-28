import CorrectionPanel from './CorrectionPanel.js';
import collectRows from './utils/collectRows.js';

export default class Translator {
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
    this.panel.setMode('plain');
    this.bindOnce();
  }

  bindOnce() {
    if (this.bound) return;
    this.bound = true;
    document.addEventListener('estiMate:translate', () => this.run());
  }

  async run() {
    try {
      const serverUrl = (this.settings.serverUrl || '').replace(/\/$/, '');
      if (!serverUrl) {
        console.warn('Translator: serverUrl not configured in Options');
      }

      const items = collectRows();

      const labelEl = document.querySelector('#ia-dropdown-button .ia-label') || document.getElementById('ia-dropdown-button');
      this._labelRestore = labelEl ? (labelEl.textContent || 'IA Tools') : 'IA Tools';
      const setLabel = (txt) => { if (labelEl) labelEl.textContent = txt; };

      const byId = new Map(items.map(i => [i.id, i]));
      const total = items.length;

      if (total === 0) {
        this.panel.hide();
        this.panel.showToast('No translations to review', 'success');
        return;
      }

      let completed = 0;
      setLabel(`Translating 0/${total}...`);

      const limit = 3;
      const results = new Array(total);

      const fetchWithTimeout = async (url, options, timeoutMs = 25000) => {
        const ctrl = new AbortController();
        const id = setTimeout(() => ctrl.abort(), timeoutMs);
        try {
          return await fetch(url, { ...options, signal: ctrl.signal });
        } finally { clearTimeout(id); }
      };

      const runBatch = async (batch) => {
        const body = JSON.stringify({ descriptions: batch.map(b => ({ id: b.row.id, text: b.row.text })) });
        try {
          const res = await fetchWithTimeout(`${serverUrl || 'http://localhost:3000'}/translate`, {
            method: 'POST', headers: { 'Content-Type': 'application/json', 'X-API-Key': this.settings.airtableKey || '' }, body
          });
          const data = await res.json();
          const list = data.corrections || [];
          batch.forEach((b, i) => {
            const corr = list[i] || { id: b.row.id, hasIssues: false, corrected: b.row.text, changes: [] };
            results[b.idx] = { ...corr, index: b.row.index };
          });
          completed += batch.length;
          setLabel(`Translating ${completed}/${total}...`);
        } catch (e) {
          for (const b of batch) {
            try {
              const r = await fetchWithTimeout(`${serverUrl || 'http://localhost:3000'}/translate`, {
                method: 'POST', headers: { 'Content-Type': 'application/json', 'X-API-Key': this.settings.airtableKey || '' }, body: JSON.stringify({ descriptions: [{ id: b.row.id, text: b.row.text }] })
              }, 20000);
              const data = await r.json();
              const corr = (data.corrections && data.corrections[0]) || { id: b.row.id, hasIssues: false, corrected: b.row.text, changes: [] };
              results[b.idx] = { ...corr, index: b.row.index };
            } catch (_) {
              results[b.idx] = { id: b.row.id, hasIssues: false, corrected: b.row.text, changes: [], index: b.row.index };
            } finally {
              completed += 1;
              setLabel(`Translating ${completed}/${total}...`);
            }
          }
        }
      };

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

      // Force every row to appear in the review panel regardless of whether
      // the AI reported a change. Rows where corrected === original will still
      // show — Accept is a no-op, Reject simply skips.
      results.forEach((r) => { if (r) r.hasIssues = true; });

      this.panel.setItems(results);
      this.panel.highlightRows(results);

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

      this.panel.render(acceptHandler, rejectHandler);

      setLabel(this._labelRestore);
    } catch (e) {
      console.error('Translation failed', e);
      this.panel.setItems([]);
      this.panel.renderIntro();
      const labelEl2 = document.querySelector('#ia-dropdown-button .ia-label') || document.getElementById('ia-dropdown-button');
      if (labelEl2) labelEl2.textContent = this._labelRestore || 'IA Tools';
    }
  }
}

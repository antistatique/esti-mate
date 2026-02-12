// File: src/content/components/BillableBadge.js

const BADGE_CLASS = 'esti-badge-nonbillable';
const TOGGLE_CLASS = 'esti-archive-toggle';
const HIDDEN_CLASS = 'esti-hidden';
const MASKED_CLASS = 'esti-totals-masked';

export default class BillableBadge {
  constructor() {
    this.observer = null;
    this.projectId = null;
    this.billableMap = null;
    this.archivedSet = null;
    this.currentPeriod = null;
    this.hideArchived = false;
    this._updating = false;
  }

  init() {
    const match = window.location.pathname.match(/^\/projects\/(\d+)$/);
    if (!match) return;
    this.projectId = match[1];

    this.observer = new MutationObserver(() => this.onMutation());
    this.observer.observe(document.body, { childList: true, subtree: true });

    // Apply immediately if rows are already present
    this.onMutation();
  }

  async onMutation() {
    if (this._updating) return;
    this._updating = true;
    try {
      const rows = document.querySelectorAll('tr[data-task-id]');
      if (rows.length === 0) return;

      // Detect current period from the dropdown
      const period = this.detectPeriod();

      // Re-fetch if period changed or first run
      if (!this.billableMap || period !== this.currentPeriod) {
        this.currentPeriod = period;
        const result = await this.fetchTaskData(period);
        this.billableMap = result.billableMap;
        this.archivedSet = result.archivedSet;
      }

      // Pause observer while we modify the DOM to avoid infinite loops
      this.observer.disconnect();
      this.applyBadges(rows);
      this.injectArchiveToggle();
      this.applyArchiveFilter();
      this.observer.observe(document.body, { childList: true, subtree: true });
    } finally {
      this._updating = false;
    }
  }

  detectPeriod() {
    // Harvest's period dropdown stores value on a select or in the URL
    const select = document.querySelector('select[name="period"]');
    if (select) return select.value;

    // Fallback: check URL params
    const params = new URLSearchParams(window.location.search);
    return params.get('period') || 'all_time';
  }

  async fetchTaskData(period) {
    const billableMap = new Map();
    const archivedSet = new Set();
    try {
      const resp = await fetch(`/projects/${this.projectId}/analysis?period=${period}`, {
        credentials: 'same-origin',
        headers: { 'Accept': 'application/json' },
      });
      if (!resp.ok) return { billableMap, archivedSet };

      const data = await resp.json();
      if (Array.isArray(data.tasks)) {
        for (const task of data.tasks) {
          const id = String(task.task_id);
          billableMap.set(id, task.billable);
          if (task.archived) archivedSet.add(id);
        }
      }
    } catch (e) {
      console.error('[Esti\'mate] Failed to fetch task data:', e);
    }
    return { billableMap, archivedSet };
  }

  applyBadges(rows) {
    for (const row of rows) {
      const taskId = row.getAttribute('data-task-id');
      if (!taskId || !this.billableMap.has(taskId)) continue;

      // Skip if badge already injected
      if (row.querySelector(`.${BADGE_CLASS}`)) continue;

      const isBillable = this.billableMap.get(taskId);
      if (isBillable) continue;

      const nameSpan = row.querySelector('td.col-name > span');
      if (!nameSpan) continue;

      const badge = document.createElement('span');
      badge.className = `pds-badge ${BADGE_CLASS}`;
      badge.textContent = 'Non-billable';
      nameSpan.after(badge);
    }
  }

  injectArchiveToggle() {
    if (document.querySelector(`.${TOGGLE_CLASS}`)) return;

    const rightGroup = document.querySelector(
      '#project-tabs-timeframe .pds-flex-list > .pds-flex-list:last-child'
    );
    if (!rightGroup) return;

    const wrapper = document.createElement('div');
    wrapper.className = `pds-checkbox ${TOGGLE_CLASS}`;

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.id = 'esti-hide-archived';
    input.checked = this.hideArchived;

    const label = document.createElement('label');
    label.htmlFor = 'esti-hide-archived';
    label.textContent = 'Hide archived';

    wrapper.append(input, label);
    rightGroup.prepend(wrapper);

    input.addEventListener('change', () => {
      this.hideArchived = input.checked;
      this.applyArchiveFilter();
    });
  }

  applyArchiveFilter() {
    if (!this.archivedSet) return;

    const hiding = this.hideArchived;
    const rows = document.querySelectorAll('tr[data-task-id]');

    for (const row of rows) {
      const taskId = row.getAttribute('data-task-id');
      if (hiding && this.archivedSet.has(taskId)) {
        row.classList.add(HIDDEN_CLASS);
      } else {
        row.classList.remove(HIDDEN_CLASS);
      }
    }

    this.updateTotalsRow(hiding);
  }

  updateTotalsRow(hiding) {
    // Harvest actively re-renders totals cells — never touch innerHTML.
    // Toggle a CSS class that visually masks numeric cells with "—".
    const totalsRows = document.querySelectorAll('tr.tbody-foot.js-totals');
    for (const row of totalsRows) {
      row.classList.toggle(MASKED_CLASS, hiding);
    }
  }

  destroy() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    document.querySelectorAll(`.${BADGE_CLASS}`).forEach((el) => el.remove());
    document.querySelectorAll(`.${TOGGLE_CLASS}`).forEach((el) => el.remove());
    document.querySelectorAll(`.${HIDDEN_CLASS}`).forEach((el) => el.classList.remove(HIDDEN_CLASS));
    document.querySelectorAll(`.${MASKED_CLASS}`).forEach((el) => el.classList.remove(MASKED_CLASS));
    this.billableMap = null;
    this.archivedSet = null;
    this.currentPeriod = null;
    this.hideArchived = false;
  }
}

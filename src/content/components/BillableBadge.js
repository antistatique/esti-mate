// File: src/content/components/BillableBadge.js

const BADGE_CLASS = 'esti-badge-nonbillable';

export default class BillableBadge {
  constructor() {
    this.observer = null;
    this.projectId = null;
    this.billableMap = null;
    this.currentPeriod = null;
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
    const rows = document.querySelectorAll('tr[data-task-id]');
    if (rows.length === 0) return;

    // Detect current period from the dropdown
    const period = this.detectPeriod();

    // Re-fetch if period changed or first run
    if (!this.billableMap || period !== this.currentPeriod) {
      this.currentPeriod = period;
      this.billableMap = await this.fetchBillableData(period);
    }

    this.applyBadges(rows);
  }

  detectPeriod() {
    // Harvest's period dropdown stores value on a select or in the URL
    const select = document.querySelector('select[name="period"]');
    if (select) return select.value;

    // Fallback: check URL params
    const params = new URLSearchParams(window.location.search);
    return params.get('period') || 'all_time';
  }

  async fetchBillableData(period) {
    const map = new Map();
    try {
      const resp = await fetch(`/projects/${this.projectId}/analysis?period=${period}`, {
        credentials: 'same-origin',
        headers: { 'Accept': 'application/json' },
      });
      if (!resp.ok) return map;

      const data = await resp.json();
      if (Array.isArray(data.tasks)) {
        for (const task of data.tasks) {
          map.set(String(task.task_id), task.billable);
        }
      }
    } catch (e) {
      console.error('[Esti\'mate] Failed to fetch billable data:', e);
    }
    return map;
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

  destroy() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    document.querySelectorAll(`.${BADGE_CLASS}`).forEach((el) => el.remove());
    this.billableMap = null;
    this.currentPeriod = null;
  }
}

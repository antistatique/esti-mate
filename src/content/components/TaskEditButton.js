// File: src/content/components/TaskEditButton.js

const BTN_CLASS = 'esti-task-edit-btn';
const FORM_CLASS = 'esti-task-edit-form';

export default class TaskEditButton {
  constructor() {
    this.observer = null;
    this._updating = false;
  }

  init() {
    this.observer = new MutationObserver(() => this.onMutation());
    this.observer.observe(document.body, { childList: true, subtree: true });

    // Apply immediately if rows are already present
    this.onMutation();
  }

  onMutation() {
    if (this._updating) return;
    this._updating = true;
    try {
      const tbody = document.querySelector('#table-edit-tasks tbody.js-assignments');
      if (!tbody) return;

      const rows = tbody.querySelectorAll('tr');
      if (rows.length === 0) return;

      this.observer.disconnect();
      this.injectButtons(rows);
      this.observer.observe(document.body, { childList: true, subtree: true });
    } finally {
      this._updating = false;
    }
  }

  injectButtons(rows) {
    for (const row of rows) {
      if (row.querySelector(`.${BTN_CLASS}`)) continue;

      const taskIdInput = row.querySelector('input[name$="[task_id]"]');
      if (!taskIdInput) continue;

      const taskId = taskIdInput.value;
      const nameCell = row.querySelector('td.col-name');
      if (!nameCell) continue;

      const nameSpan = nameCell.querySelector('span.pds-valign-middle');
      if (!nameSpan) continue;

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `pds-button pds-button-xs ${BTN_CLASS}`;
      btn.textContent = 'Edit';
      btn.addEventListener('click', () => this.showRenameForm(row, taskId, nameSpan.textContent.trim()));

      nameSpan.parentNode.insertBefore(btn, nameSpan);
    }
  }

  showRenameForm(row, taskId, currentName) {
    // Save original row for cancel
    const originalHTML = row.outerHTML;
    const parentTbody = row.parentNode;
    const colCount = row.querySelectorAll('td').length;

    // Build the form row
    const formRow = document.createElement('tr');
    formRow.className = FORM_CLASS;
    const td = document.createElement('td');
    td.setAttribute('colspan', colCount);

    const card = document.createElement('div');
    card.className = 'pdsf-card pdsf-card-warm-white pds-my-sm pds-p-lg';

    const form = document.createElement('form');
    form.addEventListener('submit', (e) => this.handleSubmit(e, taskId, formRow, originalHTML, parentTbody));

    // Task name field
    const fieldWrapper = document.createElement('div');
    fieldWrapper.className = 'pds-mb-md';

    const label = document.createElement('label');
    label.className = 'pds-label';
    label.textContent = 'Task name';

    const input = document.createElement('input');
    input.type = 'text';
    input.name = 'task[name]';
    input.className = 'pds-input';
    input.value = currentName;
    input.required = true;

    fieldWrapper.append(label, input);
    form.appendChild(fieldWrapper);

    // Buttons
    const btnGroup = document.createElement('div');
    btnGroup.className = 'pds-mt-md';

    const submitBtn = document.createElement('button');
    submitBtn.type = 'submit';
    submitBtn.className = 'pds-mr-xs pds-button pds-button-primary';
    submitBtn.textContent = 'Update task';

    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.className = 'pds-button pds-button-cancel';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.addEventListener('click', () => this.cancelEdit(formRow, originalHTML, parentTbody));

    btnGroup.append(submitBtn, cancelBtn);
    form.appendChild(btnGroup);

    card.appendChild(form);
    td.appendChild(card);
    formRow.appendChild(td);

    // Replace the original row
    row.replaceWith(formRow);

    // Focus the input
    input.focus();
    input.select();
  }

  async handleSubmit(e, taskId, formRow, originalHTML, parentTbody) {
    e.preventDefault();

    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving...';

    const csrfToken = this.getCSRFToken();
    const formData = new FormData(form);
    formData.set('_method', 'put');
    const params = new URLSearchParams(formData);

    try {
      const resp = await fetch(`/tasks/${taskId}`, {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'X-CSRF-Token': csrfToken,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

      const updatedName = formData.get('task[name]');

      // Restore original row
      this.cancelEdit(formRow, originalHTML, parentTbody);

      // Update the task name in the restored row
      const restoredRow = parentTbody.querySelector(`input[name$="[task_id]"][value="${taskId}"]`)?.closest('tr');
      if (restoredRow && updatedName) {
        const nameSpan = restoredRow.querySelector('td.col-name span.pds-valign-middle');
        if (nameSpan) {
          nameSpan.textContent = updatedName;
        }
      }

      this.showToast('Task updated successfully', 'success');
    } catch (err) {
      console.error('[Esti\'mate] Failed to update task:', err);
      submitBtn.disabled = false;
      submitBtn.textContent = 'Update task';
      this.showToast('Failed to update task', 'error');
    }
  }

  cancelEdit(formRow, originalHTML, parentTbody) {
    const temp = document.createElement('tbody');
    temp.innerHTML = originalHTML;
    const restoredRow = temp.firstElementChild;

    // Remove the dead button (no event listeners) so injectButtons creates a fresh one
    const deadBtn = restoredRow.querySelector(`.${BTN_CLASS}`);
    if (deadBtn) deadBtn.remove();

    formRow.replaceWith(restoredRow);

    // Re-inject the edit button on the restored row
    this.injectButtons([restoredRow]);
  }

  getCSRFToken() {
    const meta = document.querySelector('meta[name="csrf-token"]');
    return meta ? meta.getAttribute('content') : '';
  }

  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `esti-toast esti-toast--${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  destroy() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    document.querySelectorAll(`.${BTN_CLASS}`).forEach((el) => el.remove());
    document.querySelectorAll(`.${FORM_CLASS}`).forEach((el) => el.remove());
  }
}

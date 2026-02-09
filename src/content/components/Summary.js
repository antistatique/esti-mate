const ORDERED_CATEGORIES = [
  'UX',
  'UI',
  'Stratégie',
  'DEV',
  'IT',
  'Meeting/Workshop',
  'Admin (Project Management)',
  'Autres',
];

const CATEGORY_CONFIG = {
  UX: { label: 'UX', color: '#1fb6a6' },
  UI: { label: 'UI', color: '#a855f7' },
  DEV: { label: 'DEV', color: '#0ea5e9' },
  IT: { label: 'IT', color: '#6366f1' },
  'Meeting/Workshop': { label: 'Meeting/Workshop', color: '#f97316' },
  'Admin (Project Management)': { label: 'Admin (Project Management)', color: '#facc15' },
  Stratégie: { label: 'Stratégie', color: '#ec4899' },
  Autres: { label: 'Autres', color: '#9ca3af' },
};

const TYPE_CATEGORY_MAP = {
  admin: 'Admin (Project Management)',
  "architecture de l'information": 'UX',
  'backend': 'DEV',
  'design': 'UI',
  'dev drupal': 'DEV',
  'dev javascript': 'DEV',
  'dev php': 'DEV',
  'dev styleguide html/css': 'DEV',
  'dev wordpress': 'DEV',
  'formation': 'Meeting/Workshop',
  'frontend': 'DEV',
  'geste commercial': 'Autres',
  'it': 'IT',
  'marketing': 'Stratégie',
  'meeting/workshop': 'Meeting/Workshop',
  'multimedia': 'UI',
  'product': 'Autres',
  'recherche utilisateurs': 'UX',
  'stratégie & conseil': 'Stratégie',
  'strategie & conseil': 'Stratégie',
};

const DEFAULT_CATEGORY = 'Autres';

const getCategoryForType = (type = '') => {
  const normalized = type.trim().toLowerCase();
  if (!normalized) {
    return DEFAULT_CATEGORY;
  }

  return TYPE_CATEGORY_MAP[normalized] || DEFAULT_CATEGORY;
};

export default class Summary {
  constructor() {
    this.summaryWrapper = null;
    this.capacityWrapper = null;
    this.selectedItems = new Set();
    this.lastSummaryData = null;
  }

  init() {
    this.summaryWrapper = document.getElementById('summary-wrapper');
    this.capacityWrapper = document.getElementById('todo-wrapper');
    this.updateSummary();
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Use event delegation to listen for changes on quantity inputs
    const invoiceRows = document.querySelector('#invoice_item_rows');
    if (invoiceRows && !invoiceRows.hasAttribute('data-summary-listener')) {
      invoiceRows.addEventListener('input', (e) => {
        // Listen for changes on quantity inputs (.js-change-total) and type selects
        if (e.target.matches('.js-change-total') || e.target.matches('select:not(.airtable-template)')) {
          // Add small delay to let Harvest update its calculations first
          setTimeout(() => this.updateSummary(), 100);
        }
      });
      
      // Also listen for change events (for selects and some inputs)
      invoiceRows.addEventListener('change', (e) => {
        if (e.target.matches('.js-change-total') || e.target.matches('select:not(.airtable-template)')) {
          // Add small delay to let Harvest update its calculations first
          setTimeout(() => this.updateSummary(), 100);
        }
      });
      
      // Mark that we've added the listener to prevent duplicates
      invoiceRows.setAttribute('data-summary-listener', 'true');
    }
  }

  updateSummary() {
    const isViewMode = document.querySelector('.client-doc-notes') !== null;
    if (isViewMode) {
      this.generateSummaryView();
    } else {
      this.generateSummaryEdit();
    }
  }

  generateSummaryEdit() {
    const summary = new Map();
    let totalQty = 0;
    let totalAmount = 0;
    const rows = document.querySelectorAll('#invoice_item_rows tr:not(:last-child)');
    rows.forEach((element) => {
      const select = element.querySelector('select');
      const type = select.options[select.selectedIndex].value;
      const qty = parseFloat(element.querySelector('.js-change-total').value);
      const amountAsText = element.querySelector('.amount').innerText;
      const amount = this.extractFloatAmountFromText(amountAsText);

      totalQty += qty;
      totalAmount += amount;

      if (!summary.has(type)) {
        summary.set(type, { type, qty: 0.0, amount: 0.0 });
      }
      const prevObject = summary.get(type);
      summary.set(type, {
        type,
        qty: prevObject.qty + qty,
        amount: prevObject.amount + amount,
      });
    });

    this.renderSummary(summary, totalQty, totalAmount);
  }

  generateSummaryView() {
    const summary = new Map();
    let totalQty = 0;
    let totalAmount = 0;
    const rows = document.querySelectorAll('.client-doc-items tbody tr');

    rows.forEach((element) => {
      const type = element.querySelector('.item-type').innerText.trim();
      const qty = parseFloat(element.querySelector('.item-qty').innerText.trim());
      const amountAsText = element.querySelector('.item-amount').innerText.trim();
      const amount = this.extractFloatAmountFromText(amountAsText);


      totalQty += qty;
      totalAmount += amount;

      if (!summary.has(type)) {
        summary.set(type, { type, qty: 0.0, amount: 0.0 });
      }
      const prevObject = summary.get(type);
      summary.set(type, {
        type,
        qty: prevObject.qty + qty,
        amount: prevObject.amount + amount,
      });
    });

    this.renderSummary(summary, totalQty, totalAmount);
  }

  renderSummary(summary, totalQty, totalAmount) {
    // Store the summary data for later use
    this.lastSummaryData = { summary, totalQty, totalAmount };
    const title = document.createElement('h4');
    title.className = 'no-print';
    title.textContent = 'Résumé (non visible par le client)';

    const table = document.createElement('table');
    table.className = 'pds-table pds-table-striped no-print esti-summary-table';

    const thead = document.createElement('thead');
    thead.className = 'desktop-only';
    thead.innerHTML = `
      <tr>
        <th class="item-select pds-td-fit-content">
          <input type="checkbox" id="select-all-summary" title="Select all">
        </th>
        <th class="item-type td-item">Item Type</th>
        <th class="item-qty td-hours pds-text-right">Quantité</th>
        <th class="item-amount td-billable-amount pds-text-right">Montant</th>
      </tr>
    `;
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    tbody.className = 'client-doc-rows';
    summary.forEach((data, key) => {
      const category = getCategoryForType(key);
      const categoryColor = (CATEGORY_CONFIG[category] || CATEGORY_CONFIG[DEFAULT_CATEGORY]).color;
      const row = document.createElement('tr');
      const isSelected = this.selectedItems.has(key);
      row.innerHTML = `
        <td class="item-select desktop-only pds-td-fit-content">
          <input type="checkbox" class="summary-item-checkbox" data-item-type="${key}" ${isSelected ? 'checked' : ''}>
        </td>
        <td class="item-type desktop-only td-item" title="Click to select/deselect">
          <div class="esti-summary-type pds-display-flex pds-items-center">
            <span class="esti-summary-swatch" style="--summary-swatch-color: ${categoryColor};"></span>
            <span class="esti-summary-label">${key}</span>
          </div>
        </td>
        <td class="item-qty desktop-only pds-text-right" style="cursor: copy;" title="Click to copy">${data.qty}</td>
        <td class="item-amount pds-text-right" style="cursor: copy;" title="Click to copy">${this.formatAmount(data.amount)}</td>
      `;
      tbody.appendChild(row);
    });
    table.appendChild(tbody);

    const tfoot = document.createElement('tfoot');
    tfoot.className = 'client-doc-summary';
    
    // Calculate selected totals
    const selectedTotals = this.calculateSelectedTotals(summary);
    
    // Add selected sum row if any items are selected
    let selectedRowHtml = '';
    if (selectedTotals.qty > 0) {
      const selectionPercentage = this.calculateSelectionPercentage(selectedTotals.amount, totalAmount);
      selectedRowHtml = `
        <tr class="selected-total" style="background-color: #f0f8ff; border: 2px solid #007cba;">
          <td class="item-select desktop-only"></td>
          <td class="item-type desktop-only" style="font-style: italic;">Sélection (${selectionPercentage})</td>
          <td class="item-qty desktop-only" style="font-weight: bold;">${selectedTotals.qty}</td>
          <td class="item-amount" style="font-weight: bold;">${this.formatAmount(selectedTotals.amount)}</td>
        </tr>
      `;
    }
    
    tfoot.innerHTML = `
      <tr class="total">
        <td class="item-select desktop-only"></td>
        <td class="item-type desktop-only">Totaux de l'estimation</td>
        <td class="item-qty desktop-only pds-text-right">${totalQty}</td>
        <td class="item-amount pds-text-right">${this.formatAmount(totalAmount)}</td>
      </tr>
      ${selectedRowHtml}
    `;
    table.appendChild(tfoot);

    this.summaryWrapper.innerHTML = '';
    this.summaryWrapper.appendChild(title);
    this.summaryWrapper.appendChild(table);
    
    // Add event listeners for checkboxes
    this.setupSummaryEventListeners();

    this.renderCategoryBreakdown(summary, totalQty);
  }
  
  calculateSelectedTotals(summary) {
    let selectedQty = 0;
    let selectedAmount = 0;
    
    this.selectedItems.forEach(itemType => {
      if (summary.has(itemType)) {
        const data = summary.get(itemType);
        selectedQty += data.qty;
        selectedAmount += data.amount;
      }
    });
    
    return { qty: selectedQty, amount: selectedAmount };
  }
  
  setupSummaryEventListeners() {
    // Remove existing listeners to prevent duplicates
    if (this.summaryWrapper.hasAttribute('data-checkbox-listener')) {
      return;
    }
    
    // Event delegation for checkbox changes and item type clicks
    this.summaryWrapper.addEventListener('change', (e) => {
      if (e.target.matches('.summary-item-checkbox')) {
        const itemType = e.target.dataset.itemType;
        if (e.target.checked) {
          this.selectedItems.add(itemType);
        } else {
          this.selectedItems.delete(itemType);
        }
        // Only re-render the selection totals, don't recalculate the entire summary
        this.updateSelectionTotals();
      } else if (e.target.matches('#select-all-summary')) {
        // Handle select all checkbox
        const checkboxes = this.summaryWrapper.querySelectorAll('.summary-item-checkbox');
        if (e.target.checked) {
          // Select all items
          checkboxes.forEach(checkbox => {
            this.selectedItems.add(checkbox.dataset.itemType);
            checkbox.checked = true;
          });
        } else {
          // Deselect all items
          this.selectedItems.clear();
          checkboxes.forEach(checkbox => {
            checkbox.checked = false;
          });
        }
        // Only re-render the selection totals, don't recalculate the entire summary
        this.updateSelectionTotals();
      }
    });
    
    // Add click event listener for item type names and copy on number cells
    this.summaryWrapper.addEventListener('click', (e) => {
      const rawTarget = e.target;
      const elTarget = rawTarget instanceof Element ? rawTarget : rawTarget && rawTarget.parentElement;
      if (!elTarget) {
        return;
      }

      const typeCell = elTarget.closest('td.item-type');
      if (typeCell && this.summaryWrapper.contains(typeCell) && typeCell.closest('tbody')) {
        const row = typeCell.closest('tr');
        const checkbox = row ? row.querySelector('.summary-item-checkbox') : null;
        if (checkbox) {
          checkbox.checked = !checkbox.checked;
          checkbox.dispatchEvent(new Event('change', { bubbles: true }));
        }
        return;
      }

      const qtyCell = elTarget.closest('td.item-qty');
      const amountCell = elTarget.closest('td.item-amount');
      const copyTarget = qtyCell || amountCell;
      if (copyTarget && this.summaryWrapper.contains(copyTarget) && copyTarget.closest('tbody, tfoot')) {
        const text = copyTarget.textContent.trim();
        this.copyToClipboard(text);
        this.flashCopy(copyTarget);
      }
    });
    
    // Mark that we've added the listener
    this.summaryWrapper.setAttribute('data-checkbox-listener', 'true');
  }

  updateSelectionTotals() {
    if (!this.lastSummaryData) {
      return;
    }
    
    const { summary, totalQty, totalAmount } = this.lastSummaryData;
    const selectedTotals = this.calculateSelectedTotals(summary);
    
    // Find the tfoot element and update only the selection row
    const tfoot = this.summaryWrapper.querySelector('tfoot');
    if (tfoot) {
    let selectedRowHtml = '';
    if (selectedTotals.qty > 0) {
      const selectionPercentage = this.calculateSelectionPercentage(selectedTotals.amount, totalAmount);
      selectedRowHtml = `
        <tr class="selected-total" style="background-color: #f0f8ff; border: 2px solid #007cba;">
          <td class="item-select desktop-only"></td>
          <td class="item-type desktop-only" style="font-style: italic;">Sélection (${selectionPercentage})</td>
          <td class="item-qty desktop-only" style="font-weight: bold; cursor: copy;" title="Click to copy">${selectedTotals.qty}</td>
          <td class="item-amount" style="font-weight: bold; cursor: copy;" title="Click to copy">${this.formatAmount(selectedTotals.amount)}</td>
        </tr>
      `;
    }
      
    tfoot.innerHTML = `
      <tr class="total">
        <td class="item-select desktop-only"></td>
        <td class="item-type desktop-only">Totaux de l'estimation</td>
        <td class="item-qty desktop-only pds-text-right" style="cursor: copy;" title="Click to copy">${totalQty}</td>
        <td class="item-amount pds-text-right" style="cursor: copy;" title="Click to copy">${this.formatAmount(totalAmount)}</td>
      </tr>
      ${selectedRowHtml}
    `;
    }
  }

  extractFloatAmountFromText(amountAsText) {
    return parseFloat(amountAsText.replaceAll(/[^0-9.]/g, ''));
  }

  formatAmount(value) {
    try {
      const n = Number(value) || 0;
      return new Intl.NumberFormat('de-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
    } catch (_) {
      return (Number(value) || 0).toFixed(2);
    }
  }

  calculateSelectionPercentage(selectedAmount, totalAmount) {
    if (!totalAmount || totalAmount <= 0 || !selectedAmount) {
      return '0%';
    }
    const percentage = Math.round((selectedAmount / totalAmount) * 100);
    return `${percentage}%`;
  }

  async copyToClipboard(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
    } catch (_) {
      // ignore copy failures silently
    }
  }

  flashCopy(el) {
    const original = el.style.backgroundColor;
    el.style.transition = 'background-color .2s ease';
    el.style.backgroundColor = '#fff8e1';
    setTimeout(() => { el.style.backgroundColor = original || ''; }, 250);
  }

  renderCategoryBreakdown(summary, totalQty) {
    if (!this.capacityWrapper) {
      return;
    }

    const dataset = this.buildCategoryDataset(summary);
    const card = document.createElement('section');
    card.className = 'esti-capacity-card pds-card pds-p-md';
    card.style.marginTop = '40px';

    const heading = document.createElement('h3');
    heading.className = 'pds-h5 pds-mb-sm';
    heading.textContent = 'Breakdown';
    card.appendChild(heading);

    if (!dataset.length || totalQty <= 0) {
      const empty = document.createElement('p');
      empty.className = 'pds-color-muted';
      empty.textContent = 'Ajoutez des lignes pour voir la répartition.';
      card.appendChild(empty);
      this.capacityWrapper.innerHTML = '';
      this.capacityWrapper.appendChild(card);
      return;
    }

    const meter = document.createElement('div');
    meter.className = 'esti-capacity-meter';
    meter.setAttribute('role', 'presentation');

    const totalForMeter = dataset.reduce((acc, item) => acc + item.qty, 0);
    dataset.forEach((item) => {
      const segment = document.createElement('div');
      const percentage = totalForMeter > 0 ? (item.qty / totalForMeter) * 100 : 0;
      segment.className = 'esti-capacity-segment';
      segment.style.setProperty('--segment-color', item.color);
      segment.style.width = `${percentage}%`;
      segment.setAttribute('data-esti-tip', `${item.label} — ${Math.round(percentage)}%`);
      meter.appendChild(segment);
    });

    card.appendChild(meter);

    const list = document.createElement('ul');
    list.className = 'esti-capacity-list';
    dataset.forEach((item) => {
      const listItem = document.createElement('li');
      listItem.className = 'esti-capacity-item';

      const labelWrapper = document.createElement('span');
      labelWrapper.className = 'esti-capacity-label';

      const swatch = document.createElement('span');
      swatch.className = 'esti-capacity-swatch';
      swatch.style.setProperty('--swatch-color', item.color);

      const label = document.createElement('span');
      label.textContent = item.label;

      labelWrapper.appendChild(swatch);
      labelWrapper.appendChild(label);

      const value = document.createElement('span');
      value.className = 'esti-capacity-value';
      value.textContent = `${this.formatQty(item.qty)} h`;

      listItem.appendChild(labelWrapper);
      listItem.appendChild(value);

      list.appendChild(listItem);
    });

    card.appendChild(list);

    this.capacityWrapper.innerHTML = '';
    this.capacityWrapper.appendChild(card);
  }

  buildCategoryDataset(summary) {
    const totals = new Map();
    summary.forEach((data, type) => {
      const category = getCategoryForType(type);
      const categoryConfig = CATEGORY_CONFIG[category] || CATEGORY_CONFIG[DEFAULT_CATEGORY];
      const safeQty = Number(data.qty) || 0;

      if (!totals.has(category)) {
        totals.set(category, { id: category, label: categoryConfig.label, color: categoryConfig.color, qty: 0 });
      }

      const current = totals.get(category);
      current.qty += safeQty;
    });

    return ORDERED_CATEGORIES
      .map((category) => totals.get(category))
      .filter((item) => item && item.qty > 0);
  }

  formatQty(value) {
    const n = Number(value) || 0;
    return n.toFixed(2);
  }
}

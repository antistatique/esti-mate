export default class Summary {
  constructor() {
    this.summaryWrapper = null;
  }

  init() {
    this.summaryWrapper = document.getElementById('summary-wrapper');
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
    console.log('isViewMode', isViewMode);
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
    const title = document.createElement('h4');
    title.className = 'no-print';
    title.textContent = 'Résumé (non visible par le client)';

    const table = document.createElement('table');
    table.className = 'client-doc-items no-print';
    table.style.borderSpacing = '0';
    table.style.borderCollapse = 'collapse';
    table.style.marginTop = '10px';
    table.style.width = '600px';

    const thead = document.createElement('thead');
    thead.className = 'client-doc-items-header desktop-only';
    thead.innerHTML = `
      <tr>
        <th class="item-type">Item Type</th>
        <th class="item-qty">Quantité</th>
        <th class="item-amount">Montant</th>
      </tr>
    `;
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    tbody.className = 'client-doc-rows';
    summary.forEach((data, key) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td class="item-type desktop-only">${key}</td>
        <td class="item-qty desktop-only">${data.qty}</td>
        <td class="item-amount">${data.amount.toFixed(2)}</td>
      `;
      tbody.appendChild(row);
    });
    table.appendChild(tbody);

    const tfoot = document.createElement('tfoot');
    tfoot.className = 'client-doc-summary';
    tfoot.innerHTML = `
      <tr class="total">
        <td class="item-type desktop-only">Totaux de l'estimation</td>
        <td class="item-qty desktop-only">${totalQty}</td>
        <td class="item-amount">${totalAmount.toFixed(2)}</td>
      </tr>
    `;
    table.appendChild(tfoot);

    this.summaryWrapper.innerHTML = '';
    this.summaryWrapper.appendChild(title);
    this.summaryWrapper.appendChild(table);
  }

  extractFloatAmountFromText(amountAsText) {
    return parseFloat(amountAsText.replaceAll(/[^0-9.]/g, ''));
  }
}

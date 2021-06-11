/**
 * Render a summray table at the bottom of the estimate during edition
 */
const generateSummaryEdit = () => {
  const d = document;
  const summary = new Map();
  let totalQty = 0;
  let totalAmount = 0;

  if (!d.getElementById('invoice_item_rows')) {
    return;
  }

  // Loop over each rows and update Quantity and Amount
  d.getElementById('invoice_item_rows')
    .querySelectorAll('tr')
    .forEach((element) => {
      const select = element.querySelector('select');
      const type = select.options[select.selectedIndex].value;
      const qty = parseFloat(element.querySelector('.js-change-total').value);
      const amount = parseFloat(
        element
          .querySelector('.amount')
          .innerText.substring(4) // Remove 'CHF '
          .replace(/'/, ''), // Remove currency formatting 10'500 -> 10500
      );

      totalQty += qty;
      totalAmount += amount;

      if (!summary.has(type)) {
        summary.set(type, {
          type,
          qty: 0.0,
          amount: 0.0,
        });
      }

      const prevObject = summary.get(type);
      summary.set(type, {
        type,
        qty: prevObject.qty + qty,
        amount: prevObject.amount + amount,
      });
    });

  // Inject summary markup
  const summaryWrapper = d.getElementById('summary-wrapper');
  const summaryElement = buildSummary(summary, totalQty, totalAmount);
  summaryWrapper.textContent = ''; // remove all child
  summaryWrapper.appendChild(summaryElement);
};

/**
 * Render a summray table at the bottom of the estimate during view
 */
const generateSummaryView = () => {
  const d = document;
  const summary = new Map();
  let totalQty = 0;
  let totalAmount = 0;

  if (!d.querySelector('.client-doc-rows') || d.querySelector('.edit_estimate')) {
    return ;
  }

  // Loop over each rows and update Quantity and Amount
  d.querySelector('.client-doc-rows')
    .querySelectorAll('tbody tr')
    .forEach((element) => {
      const select = element.querySelector('select');
      const type = element.querySelector('.item-type').innerText.trim();
      const qty = parseFloat(element.querySelector('.item-qty').innerText.trim());
      const amount = parseFloat(
        element
          .querySelector('.item-amount')
          .innerText.trim()
          .substring(4) // Remove 'CHF '
          .replace(/'/, ''), // Remove currency formatting 10'500 -> 10500
      );

      totalQty += qty;
      totalAmount += amount;

      if (!summary.has(type)) {
        summary.set(type, {
          type,
          qty: 0.0,
          amount: 0.0,
        });
      }

      const prevObject = summary.get(type);
      summary.set(type, {
        type,
        qty: prevObject.qty + qty,
        amount: prevObject.amount + amount,
      });
    });

  // Inject summary markup
  const summaryWrapper = d.getElementById('summary-wrapper');
  const summaryElement = buildSummary(summary, totalQty, totalAmount);
  summaryWrapper.textContent = ''; // remove all Child
  summaryWrapper.appendChild(summaryElement);
};


/**
 * Build the summary table with the DOM API.
 *
 * @return DOMElement element containing the summary table.
 */
const buildSummary = (summary, totalQty, totalAmount) => {
  const title = document.createElement('h4');
  title.className = 'no-print';
  title.textContent = 'Résumé (non visible par le client)';

  const table = document.createElement('table');
  table.className = 'client-doc-items no-print';
  table.style.borderSpacing = 0;
  table.style.borderCollapse = 'collapse';
  table.style.marginTop = '10px';
  table.style.width = '600px';

  const thead = document.createElement('thead');
  thead.className = 'client-doc-items-header desktop-only';

  const itemTypeHeader = document.createElement('th');
  itemTypeHeader.className = 'item-type';
  itemTypeHeader.textContent = 'Item Type';
  thead.appendChild(itemTypeHeader);

  const itemQtyHeader = document.createElement('th');
  itemQtyHeader.className = 'item-qty';
  itemQtyHeader.textContent = 'Quantité';
  thead.appendChild(itemQtyHeader);

  const itemAmountHeader = document.createElement('th');
  itemAmountHeader.className = 'item-amount';
  itemAmountHeader.textContent = 'Montant';
  thead.appendChild(itemAmountHeader);

  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  tbody.className = 'client-doc-rows';

  summary.forEach((data, key) => {
    const row = document.createElement('tr');

    const itemTypeCol = document.createElement('td');
    itemTypeCol.className = 'item-type desktop-only';
    itemTypeCol.textContent = key;
    row.appendChild(itemTypeCol);

    const qtyCol = document.createElement('td');
    qtyCol.className = 'item-qty desktop-only';
    qtyCol.textContent = data.qty;
    row.appendChild(qtyCol);

    const amountCol = document.createElement('td');
    amountCol.className = 'item-amount';
    amountCol.textContent = data.amount;
    row.appendChild(amountCol);

    tbody.appendChild(row);
  });

  table.appendChild(tbody);

  const tableFooter = document.createElement('tfoot');
  tableFooter.className = 'client-doc-summary';
  const totalRow = document.createElement('tr');
  totalRow.className = 'total';

  const totalItemTypeCol = document.createElement('td');
  totalItemTypeCol.className = 'item-type desktop-only';
  totalItemTypeCol.textContent = 'Totaux de l\'estimation';
  totalRow.appendChild(totalItemTypeCol);

  const totalQtyCol = document.createElement('td');
  totalQtyCol.className = 'item-qty desktop-only';
  totalQtyCol.textContent = totalQty;
  totalRow.appendChild(totalQtyCol);

  const totalAmountCol = document.createElement('td');
  totalAmountCol.className = 'item-amount';
  totalAmountCol.textContent = totalAmount;
  totalRow.appendChild(totalAmountCol);

  tableFooter.appendChild(totalRow);

  table.appendChild(tableFooter);

  const wrapperEl = document.createElement('div');

  wrapperEl.appendChild(title);
  wrapperEl.appendChild(table);

  return wrapperEl;
}

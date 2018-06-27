/**
 * Render a summray table at the bottom of the estimate during edition
 */
const generateSummary = () => {
  const d = document;
  const summary = new Map();
  let totalQty = 0;
  let totalAmount = 0;

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

  // Build the new Table
  const tableHeader = `
  <h4 class="no-print">Résumé (non visible par le client)</h4>
  <table
    class="client-doc-items no-print"
    cellspacing="0"
    cellpadding="0"
    border="0"
    style="margin-top: 10px; width: 600px;">
      <thead class="client-doc-items-header desktop-only">
        <tr>
          <th class="item-type">Item Type</th>
          <th class="item-qty">Quantité</th>
          <th class="item-amount">Montant</th>
        </tr>
      </thead>
      <tbody class="client-doc-rows">
      `;

  let tableBody = '';
  summary.forEach((data, key) => {
    tableBody += `
      <tr>
        <td class="item-type desktop-only">${key}</td>
        <td class="item-qty desktop-only">${data.qty}</td>
        <td class="item-amount">${data.amount}</td>
      </tr>
      `;
  });
  tableBody += '</tbody>';

  let tableFooter = `
  <tbody class="client-doc-summary">
      <tr class="total">
          <td class="item-type desktop-only">Totaux de l'estimation</td>
          <td class="item-qty desktop-only">${totalQty}</td>
          <td class="item-amount">${totalAmount}</td>
      </tr>
  </tbody>`;
  tableFooter += '</table>';

  // Inject summary markup
  const summaryHTML = tableHeader + tableBody + tableFooter;
  d.getElementById('summary-wrapper').innerHTML = summaryHTML;
};
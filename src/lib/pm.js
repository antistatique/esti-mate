/**
 * Set PM fields and handle value updates and actions
 *
 * this = App class
 */
const initPM = app => {
  const d = document;

  /**
   * PM tools generation and events handling
   * ---------------------------------------------------------------------------
   */
  const pmField = d
    .getElementById('invoice_item_rows')
    .querySelectorAll('tr:last-of-type .quantity input')[0];
  pmField.insertAdjacentHTML(
    'afterend',
    `
    <br /><br />
    <em>Should be <b id="pm-total"></b>h</em><br />
    <a href="#" id="pm-update" class="btn-action btn-small btn-pill">
      Update !
    </a>
    <br /><br />
    <label for="pm-factor">Percentage :</label><br>
    <input id="pm-factor" type="number" value="${app.state.factor}" />
  `,
  );

  // PM percentage events
  const pmFactor = d.getElementById('pm-factor');
  pmFactor.addEventListener('change', e => {
    app.updateFactor(e.target.value);
  });

  // PM update button events
  const pmUpdater = d.getElementById('pm-update');
  pmUpdater.addEventListener('click', e => {
    e.preventDefault();
    const total = (app.state.total * app.state.factor) / 100;

    pmField.value = total;
    // Hack to trigger global results refresh
    var event = document.createEvent('HTMLEvents');
    event.initEvent('change', true, false);
    d.getElementById('estimate_currency').dispatchEvent(event);

    app.generateSummary();
  });

  // PM total update method
  const pmTotal = d.getElementById('pm-total');
  app.totalTrigger.subscribe(() => {
    const total = (app.state.total * app.state.factor) / 100;
    pmTotal.innerHTML = total;
  });

  /**
   * Quantity fields events
   * ---------------------------------------------------------------------------
   */
  const qtyFields = d
    .getElementById('invoice_item_rows')
    .querySelectorAll('tr:not(:last-of-type) .quantity input');

  qtyFields.forEach(field => {
    const value = app.format(field.value);
    app.updateTotal(value);

    field.addEventListener('focusin', e => {
      e.target.setAttribute('data-val', e.target.value);
    });

    field.addEventListener('change', e => {
      const oldValue = app.format(e.target.getAttribute('data-val'));
      const newValue = app.format(e.target.value);
      const diff = newValue - oldValue;

      app.updateTotal(diff);

      // Wait for amount updates
      setTimeout(() => app.generateSummary(), 300);
    });
  });

  /**
   * Price fields events
   * ---------------------------------------------------------------------------
   */
  const priceFields = d
    .getElementById('invoice_item_rows')
    .querySelectorAll('tr:not(:last-of-type) .price input');

  priceFields.forEach(field => {
    field.addEventListener('change', e =>
      setTimeout(() => app.generateSummary(), 300),
    );
  });

  /**
   * Type select events
   * ---------------------------------------------------------------------------
   */
  const selects = d
    .getElementById('invoice_item_rows')
    .querySelectorAll('tr .type select');

  selects.addEventListener('change', () => app.generateSummary());
};

/**
 * Parse DOM's inputs and set app.total of total hours
 *
 */
const setTotal = (app) => {
  // Reset total
  app.state.total = 0;

  // Parse all quantity fields and set total
  const d = document;
  const qtyFields = d
    .getElementById('invoice_item_rows')
    .querySelectorAll('tr:not(:last-of-type) .quantity input');

  qtyFields.forEach((field) => {
    const value = app.format(field.value);
    app.updateTotal(value);
  });
};

/**
 * Set PM fields and handle value updates and actions
 */
const initPM = (app, settings) => {
  const d = document;

  /**
   * PM tools generation and events handling
   * ---------------------------------------------------------------------------
   */
  const pmField = d
    .getElementById('invoice_item_rows')
    .querySelectorAll('tr:last-of-type .quantity input')[0];

  pmField.addEventListener('change', (e) => {
    setTimeout(() => app.generateSummary(), 300);
  });

  if (d.getElementById('pm-tools')) d.getElementById('pm-tools').remove();

  // build HTML
  /*
   <div id="pm-tools">
      <br /><br />
      <em>Should be <b id="pm-total"></b>h</em><br />
      <a href="#" id="pm-update" class="hui-button hui-button-primary">
        Update !
      </a>
      <div class="pm-factor-block" style="display: ${settings.show_pm_factor_field ? 'block' : 'none'}">
        <br />
        <label for="pm-factor">Percentage :</label><br>
        <input id="pm-factor" type="number" value="${app.state.factor}" />
      </div>
    </div>
   */
  const pmToolsWrapper = d.createElement('div');
  pmToolsWrapper.id = 'pm-tools';
  pmToolsWrapper.append(d.createElement('br'), d.createElement('br'));

  const em = d.createElement('em');
  const shouldBe = d.createTextNode('Should be ');
  const pmTotalEl = d.createElement('b');
  pmTotalEl.id = 'pm-total';
  em.append(shouldBe, pmTotalEl, d.createElement('br'));
  pmToolsWrapper.appendChild(em);

  const pmUpdate = d.createElement('a');
  pmUpdate.href = '#';
  pmUpdate.id = 'pm-update';
  pmUpdate.className = 'hui-button hui-button-primary';
  pmUpdate.append(d.createTextNode('Update !'));
  pmToolsWrapper.appendChild(pmUpdate);

  const pmFactorBlock = d.createElement('div');
  pmFactorBlock.className = 'pm-factor-block';
  pmFactorBlock.style.display = settings.show_pm_factor_field ? 'block' : 'none';
  pmFactorBlock.append(d.createElement('br'));

  const labelFactor = d.createElement('label');
  labelFactor.setAttribute('for', 'pm-factor');
  labelFactor.textContent = 'Percentage: ';
  pmFactorBlock.append(labelFactor, d.createElement('br'));

  const inputFactor = d.createElement('input');
  inputFactor.type = 'number';
  inputFactor.id = 'pm-factor';
  inputFactor.value = app.state.factor;
  pmFactorBlock.append(inputFactor);

  pmToolsWrapper.appendChild(pmFactorBlock);


  pmField.insertAdjacentElement(
    'afterend',
    pmToolsWrapper,
  );

  // PM percentage events
  const pmFactor = d.getElementById('pm-factor');
  pmFactor.addEventListener('change', (e) => {
    setTotal(app);
    app.updateFactor(e.target.value);
  });

  // PM update button events
  const pmUpdater = d.getElementById('pm-update');
  pmUpdater.addEventListener('click', (e) => {
    e.preventDefault();
    const total = (app.state.total * app.state.factor) / 100;

    pmField.value = total;

    // Hack to trigger global results refresh
    const event = document.createEvent('HTMLEvents');
    event.initEvent('change', true, false);
    d.getElementById('estimate_currency').dispatchEvent(event);

    app.generateSummary();
  });

  // PM total update method
  const pmTotal = d.getElementById('pm-total');
  app.totalTrigger.subscribe(() => {
    const total = (app.state.total * app.state.factor) / 100;
    pmTotal.textContent = total;
  });

  setTotal(app);

  /**
   * Type, Price and Hours events for summary update
   * ---------------------------------------------------------------------------
   */
  const selectors = [
    'tr .type select',
    'tr:not(:last-of-type) .price input',
    'tr:not(:last-of-type) .quantity input',
  ].join(', ');

  const items = d
    .getElementById('invoice_item_rows')
    .querySelectorAll(selectors);

  items.forEach((item) => {
    item.addEventListener('change', () => {
      setTotal(app);
      setTimeout(() => app.generateSummary(), 300);
    });
  });
};

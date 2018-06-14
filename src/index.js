$(document).ready(() => {
  const app = new App();
  const fields = $('#invoice_item_rows tr').not(':last').find('.quantity input');
  const selects = $('#invoice_item_rows tr').find('.type select');

  $('#invoice_notes_area').before('<div id="summary-wrapper"></div>')
  generateSummary();

  // Handle PM fields and notes
  const pmField = $('#invoice_item_rows tr').last().find('.quantity input');
  pmField.after(`
    <br /><br />
    <em>Should be <b id="pm-total"></b>h</em><br />
    <a href="#" id="pm-update" class="btn-action btn-small btn-pill">
      Update !
    </a>
    <br /><br />
    <label for="pm-factor">Percentage :</label><br>
    <input id="pm-factor" type="number" value="${app.state.factor}" />
  `);

  const pmFactor = $('#pm-factor');
  const pmUpdater = $('#pm-update');
  const pmTotal = $('#pm-total');

  pmFactor.on('change', function () {
    app.updateFactor($(this).val());
  });

  pmField.on('change', function () {
    console.log('yo');
  });

  pmUpdater.on('click', function (e) {
    e.preventDefault();
    const total = app.state.total * app.state.factor / 100;

    pmField.val(total);
    // Hack to trigger global results refresh
    $("#estimate_currency").change();

    generateSummary();
  });

  app.totalTrigger.subscribe(() => {
    const total = app.state.total * app.state.factor / 100;
    pmTotal.text(total);
  })

  // Set initial total
  fields.each(function () {
    const value = app.format($(this).val());
    app.updateTotal(value);
  });

  fields.on('focusin', function(){
    $(this).data('val', $(this).val());
  });

  fields.on('change', function () {
    const oldValue = app.format($(this).data('val'));
    const newValue = app.format($(this).val());
    const diff = newValue - oldValue;

    app.updateTotal(diff);
    generateSummary();
  });

  selects.on('change', () => generateSummary());
});
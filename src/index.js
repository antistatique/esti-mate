$(document).ready(() => {
  const app = new App();
  const fields = $('#invoice_item_rows tr').not(':last').find('.quantity input');

  // Handle PM fields and notes
  const pmField = $('#invoice_item_rows tr:last').find('.quantity input');
  pmField.after(`
    <br />
    <em>Should be <span id="pm-total"></span>h</em>
    <br /><br />
    <label for="pm-factor">Percentage :</label><br>
    <input id="pm-factor" class="js-change-total" type="number" value="${app.state.factor}" />
  `);

  const pmFactor = $('#pm-factor');
  const pmTotal = $('#pm-total');

  pmFactor.on('change', function () {
    app.updateFactor($(this).val());
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
  });
});
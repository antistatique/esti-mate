/**
 * document ready
 */
const ready = (fn) => {
  if (
    document.attachEvent
      ? document.readyState === 'complete'
      : document.readyState !== 'loading'
  ) {
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
};

/**
 * Fire the Plugin !!
 */
ready(() => {
  const d = document;
  const app = new App();

  // Prepare and generate summary
  d.getElementById('invoice_notes_area').insertAdjacentHTML(
    'beforebegin',
    '<div id="summary-wrapper"></div>',
  );
  app.generateSummary();

  // Generate PM tools
  app.initPM(app);

  // Init template feature
  const templates = app.airtableFetch('templates');
  const types = app.airtableFetch('types');

  Promise.all([templates, types]).then((values) => {
    app.airtableTemplate(...values);
  });
});

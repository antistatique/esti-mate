/**
 * document ready
 */
const ready = fn => {
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
  app.airtableFetch('templates').then(data => {
    console.log(data);
    app.airtableTemplate(data);
  });
});

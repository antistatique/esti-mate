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

  // Prepare
  d.getElementById('invoice_notes_area').insertAdjacentHTML(
    'beforebegin',
    `
    <div class="clearfix"  style="margin: 50px 0;">
      <div id="summary-wrapper" class="span-12"></div>
      <div id="todo-wrapper" class="span-4"></div>
    </div>
    `,
  );

  const init = () => {
    // Init summary generation
    app.generateSummary();

    // Generate PM tools
    app.initPM(app);

    // Init template feature
    app.airtableInit();
  };

  init();

  d.getElementById('close_sort_items_link')
    .querySelector('a')
    .addEventListener('click', () => {
      init();
    });

  d.querySelectorAll('a.delete').forEach((element) => {
    element.addEventListener('click', () => {
      setTimeout(() => init(), 300);
    });
  });
});

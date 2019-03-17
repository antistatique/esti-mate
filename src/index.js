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
  let targetQueryElement;
  let appView; // 'edit' or 'view'

  if (d.querySelector('.client-doc-notes')) {
    targetQueryElement = '.client-doc-notes';
    appView = 'view';
  } else if (d.querySelector('#invoice_notes_area')) {
    targetQueryElement = '#invoice_notes_area';
    appView = 'edit';
  } else {
    // page not compatible with this plugin
    return false;
  }

  // Prepare DOM
  d.querySelector(targetQueryElement).insertAdjacentHTML(
    'beforebegin',
    `
    <div class="clearfix"  style="margin: 50px 0;">
      <div id="summary-wrapper" class="span-12"></div>
      <div id="todo-wrapper" class="span-4"></div>
    </div>
    `,
  );

  // Plugin's Init method (can be restarted on major changes)
  const init = () => {
    // Init summary generation
    app.generateSummary();

    if ('edit' === appView) {
      // Generate PM tools
      const show_pm_factor_field = browser.storage.local.get('show_pm_factor_field');
      show_pm_factor_field.then(res => app.initPM(app, res));

      // Init template feature
      const workspace = browser.storage.local.get('airtable_workspace');
      const key = browser.storage.local.get('airtable_key');

      Promise.all([workspace, key]).then(res => app.airtableInit(res));
    }
  };
  init();

  // Reset everything after reordering rows
  if (d.getElementById('close_sort_items_link')) {
    d.getElementById('close_sort_items_link')
      .querySelector('a')
      .addEventListener('click', () => {
        init();
      });
  }

  // Reset everything after removing rows
  if (d.querySelector('a.delete, a#add_line_item_link')) {
    d.querySelectorAll('a.delete, a#add_line_item_link').forEach((element) => {
      element.addEventListener('click', () => {
        setTimeout(() => init(), 300);
      });
    });
  }

});

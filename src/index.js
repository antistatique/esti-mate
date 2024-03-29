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
  } else if (d.querySelector('#edit_estimate')) {
    targetQueryElement = '#edit_estimate > .pds-mt-md';
    appView = 'edit';
  } else if (d.querySelector('#new_estimate')) {
    targetQueryElement = '#new_estimate > .pds-mt-md';
    appView = 'new';
  } else {
    // page not compatible with this plugin
    return false;
  }

  // Prepare DOM
  d.querySelector(targetQueryElement).insertAdjacentHTML(
    'beforebegin',
    `
    <div class="pds-row clearfix"  style="margin: 50px 0;">
      <div id="summary-wrapper" class="pds-column"></div>
      <div id="todo-wrapper" class="pds-column-4"></div>
    </div>
    `,
  );

  // Plugin's Init method (can be restarted on major changes)
  const init = () => {
    // Init summary generation
    app.generateSummary();

    if ('edit' === appView || 'new' === appView) {
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
      .querySelector('button')
      .addEventListener('click', () => {
        init();
      });
  }

  // Reset everything after removing rows
  if (d.querySelector('button[data-analytics-element-id="estimate-edit-remove-line-item"], #add_line_item_link')) {
    d.querySelectorAll('button[data-analytics-element-id="estimate-edit-remove-line-item"], #add_line_item_link').forEach((element) => {
      element.addEventListener('click', () => {
        setTimeout(() => init(), 300);
      });
    });
  }

});

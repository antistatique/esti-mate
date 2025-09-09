import App from './App.js';

const ready = (fn) => {
  if (
    document.attachEvent ? document.readyState === 'complete' : document.readyState !== 'loading'
  ) {
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
};

ready(() => {
  const d = document;
  const app = new App();
  let targetQueryElement;
  let appView;

  // Determine the current view and target element
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

  // Add spell check button to header
  const headerH1 = d.querySelector('h1');
  if (headerH1) {
    const headerContainer = headerH1.parentElement;
    if (headerContainer) {
      // Create IA dropdown container
      const iaDropdownContainer = d.createElement('div');
      iaDropdownContainer.className = 'pds-menu-container';
      iaDropdownContainer.style.cssText = `
        position: absolute;
        top: 10px;
        right: 10px;
      `;
      
      // Create the IA dropdown button
      const iaDropdownButton = d.createElement('button');
      iaDropdownButton.id = 'ia-dropdown-button';
      iaDropdownButton.className = 'pds-button';
      iaDropdownButton.setAttribute('aria-haspopup', 'true');
      iaDropdownButton.setAttribute('aria-expanded', 'false');
      iaDropdownButton.setAttribute('aria-label', 'IA actions');
      iaDropdownButton.setAttribute('data-analytics-element-id', 'ia-actions-menu');
      iaDropdownButton.setAttribute('type', 'button');
      iaDropdownButton.setAttribute('aria-controls', 'ia-dropdown-menu');
      
      // Add IA text and chevron icon
      iaDropdownButton.innerHTML = `IA Tools<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" aria-label="Down chevron icon" aria-hidden="true"><polyline points="5 9 12 17 19 9"></polyline></svg>`;
      
      // Create dropdown menu structure
      const menuBackdrop = d.createElement('div');
      menuBackdrop.className = 'pds-menu-backdrop';
      menuBackdrop.style.display = 'none';
      
      const menu = d.createElement('div');
      menu.className = 'pds-menu pds-menu-left';
      
      const menuList = d.createElement('ul');
      menuList.setAttribute('role', 'menu');
      menuList.id = 'ia-dropdown-menu';
      menuList.setAttribute('aria-labelledby', 'ia-dropdown-button');
      
      // Create spell check menu item
      const spellCheckItem = d.createElement('li');
      spellCheckItem.setAttribute('role', 'none');
      
      const spellCheckLink = d.createElement('a');
      spellCheckLink.setAttribute('role', 'menuitem');
      spellCheckLink.setAttribute('tabindex', '-1');
      spellCheckLink.setAttribute('data-analytics-element-id', 'ia-spell-check');
      spellCheckLink.className = 'pds-menu-item';
      spellCheckLink.textContent = 'Spell check';
      spellCheckLink.href = '#';
      
      // Add click event listener for spell check
      spellCheckLink.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('Spell check triggered');
        // TODO: Implement spell check functionality
        spellCheckLink.textContent = 'Checking...';
        
        // Close dropdown
        menuBackdrop.style.display = 'none';
        iaDropdownButton.setAttribute('aria-expanded', 'false');
        
        // Simulate API call for now
        setTimeout(() => {
          spellCheckLink.textContent = 'Spell check';
        }, 2000);
      });
      
      // Toggle dropdown functionality
      iaDropdownButton.addEventListener('click', () => {
        const isExpanded = iaDropdownButton.getAttribute('aria-expanded') === 'true';
        if (isExpanded) {
          menuBackdrop.style.display = 'none';
          iaDropdownButton.setAttribute('aria-expanded', 'false');
        } else {
          menuBackdrop.style.display = 'block';
          iaDropdownButton.setAttribute('aria-expanded', 'true');
        }
      });
      
      // Close dropdown when clicking outside
      d.addEventListener('click', (e) => {
        if (!iaDropdownContainer.contains(e.target)) {
          menuBackdrop.style.display = 'none';
          iaDropdownButton.setAttribute('aria-expanded', 'false');
        }
      });
      
      // Build the dropdown structure
      spellCheckItem.appendChild(spellCheckLink);
      menuList.appendChild(spellCheckItem);
      menu.appendChild(menuList);
      menuBackdrop.appendChild(menu);
      iaDropdownContainer.appendChild(iaDropdownButton);
      iaDropdownContainer.appendChild(menuBackdrop);
      
      // Make header container relative positioned
      headerContainer.style.position = 'relative';
      headerContainer.appendChild(iaDropdownContainer);
    }
  }

  // Prepare DOM
  d.querySelector(targetQueryElement).insertAdjacentHTML(
    'beforebegin',
    `
    <div class="pds-row clearfix" style="margin: 50px 0;">
      <div id="summary-wrapper" class="pds-column"></div>
      <div id="todo-wrapper" class="pds-column-4"></div>
    </div>
    `
  );

  // Plugin's Init method (can be restarted on major changes)
  const init = () => {
    app.init(appView);
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
  const targetElements = d.querySelectorAll('button[data-analytics-element-id="estimate-edit-remove-line-item"], #add_line_item_link');
  targetElements.forEach((element) => {
    element.addEventListener('click', () => {
      setTimeout(() => init(), 300);
    });
  });
});
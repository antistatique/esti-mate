/**
 * Airtable data recursive fetch method
 *
 * @param {String} type
 * @param {Object} settings
 * @param {Number} [offset=null]
 * @param {Object} [payload=[]]
 * @param {Function} [resolver=null]
 * @returns Promise(data)
 */
const airtableFetch = (
  type,
  settings,
  offset = null,
  payload = [],
  resolver = null,
) => {
  return new Promise((resolve, reject) => {
    fetch(
      `https://api.airtable.com/v0/${settings.airtable_workspace}/${type}${
        offset ? `?offset=${offset}` : ''
      }`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${settings.airtable_key}`,
        },
      },
    )
      .then(async (res) => {
        const data = await res.json();
        const newData = [...payload, ...data.records];
        if (data.offset) {
          airtableFetch(
            type,
            settings,
            data.offset,
            newData,
            resolver || resolve,
          );
        } else {
          if (resolver) resolver(newData);
          resolve(newData);
        }
      })
      .catch((err) => {
        reject(err);
        throw new Error(err);
      });
  });
};

/**
 * Will inject the template's content into the sibling textarea
 *
 * @param {Node} e
 * @param {Array} templates
 */
const airtableInject = (e, templates) => {
  const id = e.target.options[e.target.selectedIndex].value;
  const template = templates.find(tpl => tpl.id === id);
  const content = template.fields.content; // eslint-disable-line

  e.target.nextElementSibling.value = content;
};

/**
 * Generate the template selector
 *
 * @param {Array} templates
 * @param {Array} types
 */
const airtableSelector = (templates, types) => {
  const d = document;

  // Remove old selectors
  if (d.querySelectorAll('.select-template').length > 0) {
    d.querySelectorAll('.select-template').forEach(node => node.remove());
  }

  d.getElementById('invoice_item_rows')
    .querySelectorAll('tr')
    .forEach((element) => {
      const itemTypeSelect = element.querySelector('select');
      const currentType = itemTypeSelect.options[itemTypeSelect.selectedIndex]
        .value;

      // Restart select generator if type changes
      itemTypeSelect.addEventListener('change', () => {
        airtableSelector(templates, types);
      });

      // Construct select's options based on row type
      const options = templates.map((item, key) => {
        // Check if item is sane
        if (undefined === item.fields.types || undefined === item.fields.name) {
          return null;
        }

        // Collect and validate item types
        const availableTypes = item.fields.types.reduce((acc, value) => {
          const relatedType = types.find(type => type.id === value);
          acc.push(relatedType.fields.name);
          return acc;
        }, []);
        if (!availableTypes.includes(currentType)) return null;

        const templateOption = d.createElement('option');
        templateOption.value = item.id;
        templateOption.textContent = item.fields.name;

        return templateOption;
      });

      // Create select with options
      const airtableSelectTemplate = d.createElement('select');
      airtableSelectTemplate.className = 'select-template';
      airtableSelectTemplate.name = 'airtable-template';
      airtableSelectTemplate.style.marginBottom = '1em';
      airtableSelectTemplate.style.fontSize = '14px;';

      const defaultOption = d.createElement('option');
      defaultOption.textContent = '- Apply a template to the following description -';
      defaultOption.value = element.getAttribute('id');
      airtableSelectTemplate.appendChild(defaultOption);

      options.forEach((item) => {
        if (item) airtableSelectTemplate.appendChild(item);
      });

      element.querySelector('textarea').insertAdjacentElement(
        'beforebegin',
        airtableSelectTemplate,
      );
    });

  d.querySelectorAll('.select-template').forEach((select) => {
    select.addEventListener('change', (e) => {
      airtableInject(e, templates);
    });
  });
};

/**
 *  Generate a nice todo list
 *
 * @param {Array} todos
 */
const airtableTodo = (todos) => {
  const d = document;

  const todoList = todos
    .reverse()
    .map((todo) => {
      const label = d.createElement('label');
      const checkbox = d.createElement('input');
      checkbox.type = 'checkbox';
      const value = d.createTextNode(` ${todo.fields.content}`);
      label.appendChild(checkbox);
      label.appendChild(value);

      return label;
    });

  // build the HTML
  const wrapper = d.getElementById('todo-wrapper');
  wrapper.textContent = ''; // remove all child

  const divWrapper = d.createElement('div');
  wrapper.appendChild(divWrapper);

  const todoTitle = d.createElement('h3');
  todoTitle.textContent = '⚠️ Avant d\'envoyer';
  divWrapper.appendChild(todoTitle);
  divWrapper.appendChild(d.createElement('br'));

  todoList.forEach((item) => {
    divWrapper.appendChild(item);
    divWrapper.appendChild(d.createElement('br'));
  });
};

/**
 * Init airtable template feature
 *
 * @param {Array} res of browser settings (Airtable's wroskpace and key)
 */
const airtableInit = (res) => {
  const settings = Object.assign(...res);

  // Init template feature
  const templates = airtableFetch('templates', settings);
  const types = airtableFetch('types', settings);

  // Populate backup textarea content
  const templatesBackup = [];
  document
    .getElementById('invoice_item_rows')
    .querySelectorAll('tr')
    .forEach((element) => {
      // Push original textarea content
      templatesBackup.push({
        id: element.getAttribute('id'),
        fields: {
          content: element.querySelector('textarea').value,
        },
      });
    });

  // Setup templates selector
  Promise.all([templates, types]).then((values) => {
    airtableSelector([...values[0], ...templatesBackup], values[1]);
  });

  // Setup todo list
  airtableFetch('todos', settings).then(todos => airtableTodo(todos));
};

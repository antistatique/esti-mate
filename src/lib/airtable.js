/**
 * Airtable data recursive fetch method
 *
 * @param {String} type
 * @param {Number} [offset=null]
 * @param {Object} [payload=[]]
 * @param {Function} [resolver=null]
 * @returns Promise(data)
 */
const airtableFetch = (type, offset = null, payload = [], resolver = null) => {
  return new Promise((resolve, reject) => {
    fetch(
      `https://api.airtable.com/v0/appNwnrYUfPz3B1qd/${type}${
        offset ? `?offset=${offset}` : ''
      }`,
      {
        method: 'GET',
        headers: {
          Authorization: 'Bearer keyx4jPvUTE9OvN6e',
        },
      },
    )
      .then(async (res) => {
        const data = await res.json();
        const newData = [...payload, ...data.records];
        if (data.offset) {
          airtableFetch(type, data.offset, newData, resolver || resolve);
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
  const content = template.fields.content;

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
      const select = element.querySelector('select');
      const currentType = select.options[select.selectedIndex].value;

      // Restart select generator if type changes
      select.addEventListener('change', () => {
        airtableSelector(templates, types);
      });

      // Constructe select's options based on row type
      const options = templates.map((item, key) => {
        // Check if item is sane
        if (undefined === item.fields.types || undefined === item.fields.name) {
          return '';
        }

        // Collect and validate item types
        const availableTypes = item.fields.types.reduce((acc, value) => {
          const relatedType = types.find(type => type.id === value);
          acc.push(relatedType.fields.name);
          return acc;
        }, []);
        if (!availableTypes.includes(currentType)) return '';

        return `
          <option value="${item.id}">👉 ${item.fields.name}</option>
        `;
      });

      // Create select with options
      element.querySelector('.description').insertAdjacentHTML(
        'afterbegin',
        `<select
          name="airtable-template"
          class="select-template"
          style="margin-bottom: 1em; font-size: 14px;">
            <option value="${element.getAttribute('id')}">
              - Apply a template to the following description -
            </option>
            ${options}
          </select>`,
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
      return `<label><input type="checkbox"> ${todo.fields.content}</label>`;
    })
    .join('<br>');

  d.getElementById('todo-wrapper').innerHTML = `
    <div>
      <h3>⚠️ Avant d'envoyer</h3><br>
      ${todoList}
    </div>`;
};

/**
 * Init airtable template feature
 *
 */
const airtableInit = (app) => {
  // Init template feature
  const templates = airtableFetch('templates');
  const types = airtableFetch('types');

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
  airtableFetch('todos').then(todos => airtableTodo(todos));
};

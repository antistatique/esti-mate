/**
 * Airtable data recursive fetch method
 *
 * @param {*} type
 * @param {*} [offset=null]
 * @param {*} [payload=[]]
 * @param {*} [resolver=null]
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
      .then(async res => {
        const data = await res.json();
        const newData = [...payload, ...data.records];
        if (data.offset) {
          airtableFetch(type, data.offset, newData, resolver || resolve);
        } else {
          if (resolver) resolver(newData);
          resolve(newData);
        }
      })
      .catch(err => {
        console.error(err);
        reject(err);
      });
  });
};

const airtableTemplate = data => {
  const d = document;

  d.getElementById('invoice_item_rows')
    .querySelectorAll('tr')
    .forEach(element => {
      const options = data.map((item, key) => {
        if (undefined === item.fields.type || undefined === item.fields.name) {
          return '';
        }

        return `
          <option value="${key}">[${item.fields.type}] ${
          item.fields.name
        }</option> 
        `;
      });

      console.log(options);

      element.querySelector('.description').insertAdjacentHTML(
        'afterbegin',
        `<select name="airtable-template">
          <option>- Apply a template to the following description -</option>
          ${options}
        </select><br /><br />`,
      );
    });
};

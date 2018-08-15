function saveSettings(e) {
  e.preventDefault();
  browser.storage.local.set({
    airtable_workspace: document.querySelector('#airtable_workspace').value,
    airtable_key: document.querySelector('#airtable_key').value,
  });
  document.querySelector('.feedback').style.display = 'block';
}

function restoreOptions() {
  function setCurrentChoice(res) {
    const settings = Object.assign(...res);
    // eslint-disable-next-line
    document.getElementById('airtable_workspace').value =
      settings.airtable_workspace || '';
    document.getElementById('airtable_key').value = settings.airtable_key || '';
  }

  function onError(error) {
    throw new Error(`Error: ${error}`);
  }

  const workspace = browser.storage.local.get('airtable_workspace');
  const key = browser.storage.local.get('airtable_key');
  document.querySelector('.feedback').style.display = 'none';

  Promise.all([workspace, key]).then(setCurrentChoice, onError);
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector('form').addEventListener('submit', saveSettings);

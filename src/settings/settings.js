function saveSettings(e) {
  e.preventDefault();
  browser.storage.local.set({
    airtable_workspace: document.querySelector('#airtable_workspace').value,
    airtable_key: document.querySelector('#airtable_key').value,
  });
}

function restoreOptions() {
  function setCurrentChoice(res) {
    const settings = Object.assign(...res);
    document.querySelector('#airtable_workspace').value = settings.airtable_workspace;
    document.querySelector('#airtable_key').value = settings.airtable_key;
  }

  function onError(error) {
    console.error(`Error: ${error}`);
  }

  const workspace = browser.storage.local.get('airtable_workspace');
  const key = browser.storage.local.get('airtable_key');

  Promise.all([workspace, key]).then(setCurrentChoice, onError);
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector('form').addEventListener('submit', saveSettings);

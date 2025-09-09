document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('options-form');
  const status = document.getElementById('status');

  // Use chrome or browser API for cross-browser compatibility
  const browserAPI = typeof chrome !== 'undefined' && chrome.storage ? chrome : browser;

  // Load saved options
  browserAPI.storage.local.get(['airtableWorkspace', 'airtableKey', 'pmPercentage', 'serverUrl'], (items) => {
    document.getElementById('airtable-workspace').value = items.airtableWorkspace || '';
    document.getElementById('airtable-key').value = items.airtableKey || '';
    document.getElementById('pm-percentage').value = items.pmPercentage || 25;
    document.getElementById('server-url').value = items.serverUrl || '';
  });

  // Save options
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const airtableWorkspace = document.getElementById('airtable-workspace').value;
    const airtableKey = document.getElementById('airtable-key').value;
    const pmPercentage = parseInt(document.getElementById('pm-percentage').value, 10);
    const serverUrl = document.getElementById('server-url').value.trim();

    browserAPI.storage.local.set(
      { airtableWorkspace, airtableKey, pmPercentage, serverUrl },
      () => {
        status.style.display = 'block';
        status.textContent = 'Options saved.';
        setTimeout(() => {
          status.textContent = '';
          status.style.display = 'none';
        }, 3000);
      }
    );
  });
});

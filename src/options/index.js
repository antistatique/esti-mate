document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('options-form');
  const status = document.getElementById('status');

  // Load saved options
  chrome.storage.local.get(['airtableWorkspace', 'airtableKey', 'pmPercentage'], (items) => {
    document.getElementById('airtable-workspace').value = items.airtableWorkspace || '';
    document.getElementById('airtable-key').value = items.airtableKey || '';
    document.getElementById('pm-percentage').value = items.pmPercentage || 25;
  });

  // Save options
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const airtableWorkspace = document.getElementById('airtable-workspace').value;
    const airtableKey = document.getElementById('airtable-key').value;
    const pmPercentage = document.getElementById('pm-percentage').value;

    chrome.storage.local.set(
      { airtableWorkspace, airtableKey, pmPercentage },
      () => {
        status.textContent = 'Options saved.';
        setTimeout(() => {
          status.textContent = '';
        }, 3000);
      }
    );
  });
});

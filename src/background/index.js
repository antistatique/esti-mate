browser.runtime.onInstalled.addListener(() => {
  console.log('Esti\'mate extension installed');
});

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'getStorageData') {
    browser.storage.local.get(['airtableWorkspace', 'airtableKey', 'pmPercentage'], (items) => {
      sendResponse({ data: items });
    });
    return true;  // Will respond asynchronously
  }
});
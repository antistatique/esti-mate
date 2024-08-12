chrome.runtime.onInstalled.addListener(() => {
  console.log('Esti\'mate extension installed');
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'getStorageData') {
    chrome.storage.local.get(null, (items) => {
      sendResponse({ data: items });
    });
    return true;  // Will respond asynchronously
  }
});
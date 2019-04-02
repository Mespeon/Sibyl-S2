console.log("[Sibyl] Client content script started.");

// Return current URL to allow extension to run in all tabs
let current_url = (new URL(document.location)).searchParams;
let href = current_url.get("href");

// Allow extension to run persistently in all tabs
chrome.runtime.onInstalled.addListener(function() {
  chrome.declarativeContent.onPageChanged.addRules([{
    conditions: [new chrome.declarativeContent.PageStateMatcher({
      pageUrl: {hostEquals: href},
    })],
      actions: [new chrome.declarativeContent.ShowPageAction()]
  }]);
});

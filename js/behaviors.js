var submitButton = document.getElementById('submit--reg-form');
var registryForm = document.getElementById('register-form');

// submitButton.addEventListener('click', demoScript);
// registryForm.addEventListener('submit', redirectMe);

function demoScript() {
  alert('Hello World!');
}

// Open the options page
document.querySelector('#link--options-page').addEventListener('click', function() {
  if (chrome.runtime.openOptionsPage) {
    chrome.runtime.openOptionsPage();
  }
  else {
    window.open(chrome.runtime.getURL('options.html'));
  }
});

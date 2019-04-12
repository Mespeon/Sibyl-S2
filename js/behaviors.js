var submitButton = document.getElementById('submit--reg-form');
var registryForm = document.getElementById('register-form');
var commentArea = document.querySelector('#comment');

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

// Listen to the Lexicon Analysis form for submission
// then POST the data using AJAX and retrieve a JSON response.
$(function() {
  $('#form-analyze-single').submit(function() {
      $.ajax({
          type: 'POST',
          url: 'analyze/mode=lexicon',
          data: {comment: commentArea.value},
          error: function()
          {
             alert("Request Failed");
          },
          success: function(response)
          {
             //alert('Request Sent');
             console.log(commentArea.value);
             console.log(response.result);
             $("#result").html(response.result);
          } // this was missing
      });
      return false;
  })
});

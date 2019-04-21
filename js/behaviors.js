// var submitButton = document.getElementById('submit--reg-form');
// var registryForm = document.getElementById('register-form');

// submitButton.addEventListener('click', demoScript);
// registryForm.addEventListener('submit', redirectMe);
//
// function demoScript() {
//   alert('Hello World!');
// }

// // Open the options page
// document.querySelector('#link--options-page').addEventListener('click', function() {
//   if (chrome.runtime.openOptionsPage) {
//     chrome.runtime.openOptionsPage();
//   }
//   else {
//     window.open(chrome.runtime.getURL('options.html'));
//   }
// });

var $response;
var $currentEntrySet = 0;

document.querySelector('#open--formBuilder').addEventListener('click', function() {
  window.open(chrome.runtime.getURL('builder.html'));
});

// AJAX LISTENERS
$(document).ready(function() {
  $(this).ajaxStart(function() {
    $('#async').fadeIn(300);
  }).ajaxStop(function() {
    $('#async').fadeOut(300);
  });
});

// ACTION ON FORM FINDER SUBMISSION
$('#form-findFormId').submit(function() {
  form = $(this);

  $('#form-analysis-parent-container').slideUp(300);

  // Begin async request
  $.ajax({
      type: 'POST',
      url: 'https://marknolledo.pythonanywhere.com/sibyl/prepare',
      data: form.serialize(),
      error: function()
      {
         showNotifToast('error', 'No form with this ID is found.');
      },
      success: function(response)
      {
         console.log(response);

         // Dump the full response in the variable.
         // This will enable on-the-fly UI modifications and updates
         // without sending another request to the server, unless necessary.
         $response = response;
         console.log('Global variable for JSON response: ', $response);

         // Append statistics values to these elements.
         $('#statistics--table-id').html(response.received['text--formId']);
         $('#statistics--response-counter').html(response.rowsCount);
         $('#statistics--column-counter').html(response.colsCount);

         // Iterate through the JSON result and append them into
         // the table. These will be programatically created.
         $('#analysis--recent-entries').html(''); // This will clear any previously appended child elements.
         $table = document.querySelector('#analysis--recent-entries');  // The table to be appended to.

         var i, v;
         for (i = 0; i < response.rowsCount; i++) {
           // For the debugging LULZ
           console.log(response.rows[i][1]);
           console.log(response.rows[i][2]);

           // Create the rows and columns (MIGHT CHANGE TO STYLIZED DIVS)
           // Then assign them their values and CSS classes, if ever.
           var $tr = document.createElement('tr');
           $tr.className = 'recent-entries--row';

           var $td_value = document.createElement('td');
           if (i % 2 == 0) {
             $td_value.className = 'recent-entries--data-even';
           }
           else {
             $td_value.className = 'recent-entries--data-odd';
           }
           $td_value.textContent = response.rows[i][0];
           $tr.append($td_value);

           $table.append($tr);  // Append to level 1 parent
         }

         // Append the table column names as options in a select tag.
         // These will be used as a switcher for column display.
         $('#recent-entries--data-switch').html('');
         $select = document.querySelector('#recent-entries--data-switch');

         // Iterate through the returned response cols values
         var v;
         for (v = 0; v < response.colsCount; v++) {
           console.log(response.cols[v]);

           var $option = document.createElement('option');
           $option.textContent = response.cols[v];
           $option.value = v;

           $select.append($option);
         }
         // END SELECT TAG OPTION APPEND

         // Show the table after appending everything
         $('#form-analysis-parent-container').slideToggle(300);
      }
  });
  return false;
});

// Notification
function showNotifToast(type, message) {
  $('#notif-message').html(message);
  if (type == 'error') {
    $('#notif--child-container').addClass('error');
    $('#notification').fadeIn(300, function() {
      setTimeout(function() {
        $('#notification').fadeToggle(300, function() {
          $('#notif--child-container').removeClass('error');
        });
      }, 5000);
    });
  }
  else {
    console.log('Hello there, Obi-wan.');
  }
}

// Entry set switch
document.querySelector('#recent-entries--data-switch').addEventListener('change', function() {
  var select = document.querySelector('#recent-entries--data-switch');
  var value = select.options[select.selectedIndex].value;
  $currentEntrySet = value;
  console.log(value);

  $('#classifier--results-container').fadeOut(300);
  $('#analysis--recent-entries').fadeOut(300, function() {
    // TABLE CREATION
    // Iterate through the JSON result and append them into
    // the table. These will be programatically created.
    $('#analysis--recent-entries').html(''); // This will clear any previously appended child elements.
    $table = document.querySelector('#analysis--recent-entries');  // The table to be appended to.

    var i;
    for (i = 0; i < $response.rowsCount; i++) {
      // For the debugging LULZ
      console.log($response.rows[i][1]);
      console.log($response.rows[i][2]);

      // Create the rows and columns (MIGHT CHANGE TO STYLIZED DIVS)
      // Then assign them their values and CSS classes, if ever.
      var $tr = document.createElement('tr');
      $tr.className = 'recent-entries--row';

      var $td_value = document.createElement('td');
      if (i % 2 == 0) {
        $td_value.className = 'recent-entries--data-even';
      }
      else {
        $td_value.className = 'recent-entries--data-odd';
      }
      $td_value.textContent = $response.rows[i][value];
      $tr.append($td_value);

      $table.append($tr);  // Append to level 1 parent
    }
    // END TABLE CREATION

    $('#analysis--recent-entries').fadeToggle(300);
    if ($currentEntrySet == 0) {
      $('#recent-entries--classifier-parent-container').fadeOut(300);
    }
    else {
      $('#recent-entries--classifier-parent-container').fadeIn(300);
    }
  });
});

// Classify trigger
document.querySelector('#classifier-trigger').addEventListener('click', function() {
  if ($currentEntrySet == 0) {
    console.log('Current row cannot be classified.');
  }
  else {
    var $formId = $response.received['text--formId'];
    var $column = $response.cols[$currentEntrySet];

    console.log($currentEntrySet);
    $('#classifier--results-container').fadeOut(300);
    $.ajax({
      type: 'POST',
      url: 'https://marknolledo.pythonanywhere.com/sibyl/classify',
      data: {formId: $formId, request: $column},
      error: function(response) { showNotifToast('error', response.status); },
      success: function(response) {
        console.log(response);

        // Pull values from the response then assign them to their respective containers.
        var classification = response.classification;
        var entryCount = response.entryCount;
        var negativeAverage = response.negativeAverage;
        var positiveAverage = response.positiveAverage;
        var negatives = response.negatives;
        var positives = response.positives;

        $('#classifier--classification').html(classification);
        $('#positive').html(positiveAverage + '% Positive');
        $('#negative').html(negativeAverage + '% Negative');
        $('#classifier--entry-count').html(entryCount);
        $('#classifier--pos-count').html(positives);
        $('#classifier--neg-count').html(negatives);

        $('#classifier--results-container').fadeIn(300);
      }
    });
    return false;
  }
});

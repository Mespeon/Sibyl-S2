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
    $('#scrim').fadeIn(300);
  }).ajaxStop(function() {
    $('#async').fadeOut(300);
    $('#scrim').fadeOut(300);
  });
});

// ACTION ON FORM FINDER SUBMISSION
$('#form-findFormId').submit(function() {
  form = $(this);
  $columnSwitch = document.querySelector('#recent-entries--data-switch');
  //$countSwitch = document.querySelector('#recent-entries--count-switch');

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
         // Dump the full response in the variable.
         // This will enable on-the-fly UI modifications and updates
         // without sending another request to the server, unless necessary.
         $response = response;
         console.log('Global variable for JSON response: ', $response);

         // Append statistics values to these elements.
         $('#statistics--table-id').html(response.received);
         $('#statistics--response-counter').html(response.rowsCount);
         $('#statistics--column-counter').html(response.colsCount - 1);

         // Iterate through the JSON result and append them into
         // the table. These will be programatically created.
         $('#analysis--recent-entries').html(''); // This will clear any previously appended child elements FOR THE FILTERED VIEW.
         $('#recents--assist-container').html('') // This will clear any previously appended child elements FOR THE FULL VIEW.

         // The table/divs to be appended to.
         $div = document.querySelector('#recents--assist-container');
         $table = document.querySelector('#analysis--recent-entries');

         if (response.rowsCount == 0) {
           var $notice = document.createElement('h2');
           $notice.textContent = 'No responses to show.';
           $div.append($notice);
           $columnSwitch.disabled = true;
           //$countSwitch.disabled = true;
         }
         else {
           // If the page is not reloaded prior to update, re-enable the select fields.
           $columnSwitch.disabled = false;
           //$countSwitch.disabled = false;

           // In case of a column change without reloading, show the full view table
           // then hide the filtered view table and the sentiment classifier div.
           $('#recents--full-container').show();
           $('#analysis--recent-entries').hide();
           $('#recent-entries--classifier-parent-container').hide();

           // PREPEND FULL VIEW TO THEIR TABLES
           var row, col;
           // Create the div, h2, and table
           for (col = 1; col < response.colsCount; col++) {
             // Child div
             var $childDiv = document.createElement('div');
             $childDiv.className = 'table-group';

             // H2 heading
             var $subhead = document.createElement('h2');
             $subhead.className = 'subheader';
             $subhead.textContent = response.cols[col];
             $childDiv.append($subhead);

             // Table
             var $childTable = document.createElement('table');
             $childTable.className = 'analysis--recent-entries-full';

             // Append the rows to the table
             for (row = 0; row < response.rowsCount; row++) {
               var $trFull = document.createElement('tr');

               //var $tdRowId = document.createElement('td');
               if (col != 0) {
                 var $tdValue = document.createElement('td');
               }

               if (row % 2 == 0) {
                 //$tdRowId.className = 'recent-entries--data-even';
                 if ($tdValue) $tdValue.className = 'recent-entries--data-even';
               }
               else {
                 //$tdRowId.className = 'recent-entries--data-odd';
                 if ($tdValue) $tdValue.className = 'recent-entries--data-odd';
               }

               if (col != 0) {
                 //$tdRowId.textContent = response.rows[row][0];
                 $tdValue.textContent = response.rows[row][col];
               }
               else {
                 //$tdRowId.textContent = response.rows[row][col];
               }

               //$trFull.append($tdRowId);
               if ($tdValue) $trFull.append($tdValue);
               $childTable.append($trFull);
             }
             $childDiv.append($childTable);

             // Append all to immediate parent
             $div.append($childDiv);

             // PREPEND FILTERED VIEW TO FILTER TABLES
             var i, v;
             for (i = 0; i < response.rowsCount; i++) {
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
           }
         }

         // Append the table column names as options in a select tag.
         // These will be used as a switcher for column display.
         $('#recent-entries--data-switch').html('');
         $select = document.querySelector('#recent-entries--data-switch');

         // Iterate through the returned response cols values
         var v;
         for (v = 1; v < response.colsCount; v++) {
           var $option = document.createElement('option');
           $option.textContent = response.cols[v];
           $option.value = v;

           $select.append($option);
         }
         // END SELECT TAG OPTION APPEND

         // Show the table after appending everything
         $('#form-analysis-parent-container').slideToggle(300);

         // In case that there are only two columns available (rowId and col_name),
         // i.e. no change in category possible since the row ID is no longer included
         // in the iteration, show the sentiment classifier div.
         if (response.colsCount == 2) {
           $('#recent-entries--classifier-parent-container').show();
           $currentEntrySet = 1;
         }
         else {
           $('#recent-entries--classifier-parent-container').hide();
           $currentEntrySet = 0;
         }

         // // Append the corresponding number of possible view limit counts depending
         // // on number of rows returned. Remove the options if they are less than the limits.
         // $counterSwitch = document.querySelector('#recent-entries--count-switch');
         // $('#recent-entries--count-switch').html('');
         //
         // // Create the ALL limit option always.
         // $allSwitch = document.createElement('option');
         // $allSwitch.textContent = 'All';
         // $allSwitch.value = 'all';
         // $counterSwitch.append($allSwitch);
         //
         // // Then append the following numbered limits when row counts exceed specific counts.
         // if (response.rowsCount > 10) {
         //   $count10 = document.createElement('option');
         //   $count10.textContent = '10';
         //   $count10.value = '10';
         //   $countSwitch.append($count10);
         // }
         //
         // if (response.rowsCount > 50) {
         //   $count50 = document.createElement('option');
         //   $count50.textContent = '50';
         //   $count50.value = '50';
         //   $countSwitch.append($count50);
         // }
         //
         // if (response.rowsCount > 100) {
         //   $count100 = document.createElement('option');
         //   $count100.textContent = '100';
         //   $count100.value = '100';
         //   $countSwitch.append($count100);
         // }
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
  var text = select.options[select.selectedIndex].text;
  var radioGroup = text.substring(0, 11);
  var selectGroup = text.substring(0, 6);
  var checkGroup = text.substring(0, 14);
  var value = select.options[select.selectedIndex].value;

  $currentEntrySet = value;
  console.log('Switched category: ', $currentEntrySet, text);
  //console.log(radioGroup, selectGroup, checkGroup);

  if ($currentEntrySet !== '') {
    $('#recents--full-container').fadeOut(300);
  }

  // Perform an Ajax request to the API to get statistical data of a selected column (currently limited to RADIOS, SELECTS, AND CHECKBOXES).
  if (radioGroup == 'radio-group' || selectGroup == 'select' || checkGroup == 'checkbox-group') {
    console.log('Requesting statistics from API...');

    // Hide the sentiment analysis trigger since this column is more on the quantifiable side.
    // Then chain the Ajax request after.
    $('#analysis--recent-entries').fadeOut(300);
    $('#recent-entries--classifier-parent-container').fadeOut(300, function() {
      $.ajax({
        type: 'POST',
        url: 'https://marknolledo.pythonanywhere.com/sibyl/statistics',
        data: {formId: $response.received, column: text},
        error: function(response) { showNotifToast('error', response.status); },
        success: function(response) {
          console.log(response);
          $('#analysis--recent-entries').html('');  // Clear table of any previously appended elements.
          $table = document.querySelector('#analysis--recent-entries');

          // Create table headers first
          $tr_heading = document.createElement('tr');
          $td_value_header = document.createElement('td');
          $td_count_header = document.createElement('td');
          $td_distro_header = document.createElement('td');

          $td_value_header.className = 'recent-entries--data-heading';
          $td_count_header.className = 'recent-entries--data-heading';
          $td_distro_header.className = 'recent-entries--data-heading';

          $td_value_header.textContent = 'Distinct Value';
          $td_count_header.textContent = 'Count';
          $td_distro_header.textContent = 'Percentage';

          $tr_heading.append($td_value_header);
          $tr_heading.append($td_count_header);
          $tr_heading.append($td_distro_header);

          $table.append($tr_heading);

          // Append values to the table
          var i;
          for (i = 0; i < response.distinctValues.length; i++) {
            var $tr = document.createElement('tr');
            $tr.className = 'recent-entries--row';

            // Distinct value name
            var $td_distinctValue = document.createElement('td');
            if (i % 2 == 0) {
              $td_distinctValue.className = 'recent-entries--data-even';
            }
            else {
              $td_distinctValue.className = 'recent-entries--data-odd';
            }
            $td_distinctValue.textContent = response.distinctValues[i];

            // Distinct result count
            var $td_distinctCount = document.createElement('td');
            if (i % 2 == 0) {
              $td_distinctCount.className = 'recent-entries--data-even';
            }
            else {
              $td_distinctCount.className = 'recent-entries--data-odd';
            }
            $td_distinctCount.textContent = response.distinctCount[i];

            // Distinct distribution bias
            var $td_distinctDistribution = document.createElement('td');
            if (i % 2 == 0) {
              $td_distinctDistribution.className = 'recent-entries--data-even';
            }
            else {
              $td_distinctDistribution.className = 'recent-entries--data-odd';
            }
            $td_distinctDistribution.textContent = response.distinctDistribution[i];

            $tr.append($td_distinctValue);
            $tr.append($td_distinctCount);
            $tr.append($td_distinctDistribution);

            $table.append($tr);
          }

          // CHART CREATION
          // Clear the parent container first
          // This is done so that the previous chart data won't interfere
          // with the new one.
          var chartContainer = document.getElementById('analysisChart--parent-container');
          $('#analysisChart--parent-container').html('');

          // Append a new chart of the same ID
          var $chart = document.createElement('canvas');
          $chart.id = 'analysisChart';
          chartContainer.append($chart);

          // Set chart context
          var chartContext = document.getElementById('analysisChart').getContext('2d');

          // Chart Dataset
          var chartData = {
            labels: [],

            datasets: [{
              label: '',
              backgroundColor: [
                'rgba(255,218,51,0.5)',
                'rgba(0,169,142,0.5)',
                'rgba(255,88,146,0.5)',
                'rgba(255,130,218,0.5)',
                'rgba(0,169,219,0.5)'
              ],
              borderColor: [
                'rgba(255,218,51,0.8)',
                'rgba(0,169,142,0.8)',
                'rgba(255,88,146,0.8)',
                'rgba(255,130,218,0.8)',
                'rgba(0,169,219,0.8)'
              ],
              borderWidth: 3,
              borderSkipped: 'bottom',
              data: []
            }]
          };

          // Chart Options
          var chartOptions = {
            legend: {
              labels: {
                fontSize: 16
              }
            },
            scales: {
              yAxes: [{
                ticks: { beginAtZero: true }
              }],

              xAxes: [{
                barThickness: 'flex'
              }]
            },
            title: {
              display: true,
              text: '?',
              fontSize: 24
            },
            events: ['mousemove']
          }

          // Set chart title prior to instantiating it
          chartOptions.title.text = text;

          // Instantiate the chart
          var chart = new Chart(chartContext, {
            type: 'bar',
            data: chartData,
            options: chartOptions
          });

          // USED FOR POPPING DATA FROM THE CHART
          // for (var clean = 0; clean <= response.distinctValues.length-1; clean++) {
          //   // Clean the dataset and labels first
          //   chartData.labels.pop();
          //   chartData.datasets.forEach((dataset) => {
          //     dataset.data.pop();
          //     dataset.label = '';
          //   });
          //   chart.update();
          // }

          // Iterate through the data and push them to the chart
          for (var s = 0; s <= response.distinctValues.length-1; s++) {
            chartData.labels.push(response.distinctValues[s]);
            chartData.datasets.forEach((dataset) => {
              dataset.data.push(response.distinctCount[s]);
              dataset.label = 'Response';
            });
            chart.update();
          }

          // Show the chart
          $('#analysisChart').fadeIn(300);

          // Toggle parent container display
          $('#analysis--recent-entries').fadeToggle(300);
        }
      });
      return false;
    });
  }
  else {
    // Hide the graphic chart if shown
    $('#analysisChart').fadeOut(300);

    $('#classifier--results-parent-container').fadeOut(300);
    $('#analysis--recent-entries').fadeOut(300, function() {
      // TABLE CREATION
      // Iterate through the JSON result and append them into
      // the table. These will be programatically created.
      $('#analysis--recent-entries').html(''); // This will clear any previously appended child elements.

      // The table/divs to be appended to.
      $table = document.querySelector('#analysis--recent-entries');

      // PREPEND FILTERED VIEW TO THEIR TABLES
      var i;
      for (i = 0; i < $response.rowsCount; i++) {
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
  }
});

// View count switch
// document.querySelector('#recent-entries--count-switch').addEventListener('change', function() {
//   console.log('HELLO');
// });

// Classify trigger
document.querySelector('#classifier-trigger').addEventListener('click', function() {
  if ($currentEntrySet == 0) {
    console.log('Current row cannot be classified.');
  }
  else {
    var $formId = $response.received;
    var $column = $response.cols[$currentEntrySet];

    console.log($currentEntrySet);
    $('#classifier--results-parent-container').fadeOut(300);
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
        var positiveLexes = response.positiveLexes;
        var negativeLexes = response.negativeLexes;
        var ecl = response.entryClassification;

        // Single values
        $('#classifier--classification').html(classification);
        $('#positive').html(positiveAverage + '% Positive');
        $('#negative').html(negativeAverage + '% Negative');
        $('#classifier--entry-count').html(entryCount);
        $('#classifier--pos-count').html(positives);
        $('#classifier--neg-count').html(negatives);

        // Reset tables first
        $('#classifier--lexicon-distribution-positive').html('');
        $('#classifier--lexicon-distribution-negative').html('');
        $('#classifier--entry-classification').html('');

        // Query tables
        $lexiconPositive = document.querySelector('#classifier--lexicon-distribution-positive');
        $lexiconNegative = document.querySelector('#classifier--lexicon-distribution-negative');
        $eclTable = document.querySelector('#classifier--entry-classification');

        // Array values
        var plexCtr;
        for (plexCtr = 0; plexCtr < response.positiveLexes.length; plexCtr++) {
          var $tr_plex = document.createElement('tr');
          var $td_plex = document.createElement('td');
          if (plexCtr % 2 == 0) {
            $td_plex.className = 'recent-entries--data-even';
          }
          else {
            $td_plex.className = 'recent-entries--data-odd';
          }
          $td_plex.textContent = response.positiveLexes[plexCtr];
          $tr_plex.append($td_plex);
          $lexiconPositive.append($tr_plex);
        }

        var nlexCtr;
        for (nlexCtr = 0; nlexCtr < response.negativeLexes.length; nlexCtr++) {
          var $tr_nlex = document.createElement('tr');
          var $td_nlex = document.createElement('td');
          if (nlexCtr % 2 == 0) {
            $td_nlex.className = 'recent-entries--data-even';
          }
          else {
            $td_nlex.className = 'recent-entries--data-odd';
          }
          $td_nlex.textContent = response.negativeLexes[nlexCtr];
          $tr_nlex.append($td_nlex);
          $lexiconNegative.append($tr_nlex);
        }

        var eclCtr;
        for (eclCtr = 0; eclCtr < ecl.length; eclCtr++) {
          var $tr_class = document.createElement('tr');
          var $tdEntry = document.createElement('td');
          var $tdClassification = document.createElement('td');

          // Class attachment
          if (ecl[eclCtr] == 'pos') {
            $tdEntry.className = 'classification--data-positive';
            $tdClassification.className = 'classification--data-positive';
          }
          else {
            $tdEntry.className = 'classification--data-negative';
            $tdClassification.className = 'classification--data-negative';
          }

          // Data attachment
          $tdEntry.textContent = $response.rows[eclCtr][$currentEntrySet];
          $tdClassification.textContent = ecl[eclCtr];

          // Append to <tr> in order
          $tr_class.append($tdEntry);
          $tr_class.append($tdClassification);

          $eclTable.append($tr_class);
        }

        $('#classifier--results-parent-container').fadeIn(300);
      }
    });
    return false;
  }
});

// CSV downloader
document.querySelector('#download-csv-data').addEventListener('click', function() {
  function csvConversion(objArray) {
    var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
    var str = '';

    for (var i = 0; i < array.length; i++) {
      var line = '';
      for (var index in array[i]) {
        if (line != '') line += ','
        line += array[i][index];
      }

      str += line + '\r\n';
    }

    return str;
  }

  function exportCSV(items, fileTitle) {
    // Object conversion to JSON
    var responseJSON = JSON.stringify(items);
    var csv = csvConversion(responseJSON);
    var exportedFileName = fileTitle + '.csv' || 'export.csv';

    var blob = new Blob([csv], {type: 'text/csv;charset=utf-8'});
    var link = document.createElement('a');
    if (link.download !== undefined) {
      var url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', exportedFileName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  exportCSV($response.rows, $response.received);
});
